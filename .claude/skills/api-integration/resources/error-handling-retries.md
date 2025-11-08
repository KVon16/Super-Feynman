# Error Handling & Retry Logic - Super Feynman APIs

Complete guide to handling API errors and implementing retry logic for Anthropic and Whisper APIs.

---

## API Error Types

```javascript
// utils/apiErrors.js

class AnthropicError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'AnthropicError';
        this.statusCode = statusCode;
    }
}

class WhisperError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'WhisperError';
        this.statusCode = statusCode;
    }
}

module.exports = { AnthropicError, WhisperError };
```

---

## Retry with Exponential Backoff

```javascript
// utils/retryHelper.js

async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            // Don't retry on client errors (4xx)
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Last attempt, throw error
            if (attempt === maxRetries - 1) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = { retryWithBackoff };
```

---

## Usage with Retry

```javascript
const { retryWithBackoff } = require('../utils/retryHelper');

async generateConceptsWithRetry(lectureText) {
    return await retryWithBackoff(async () => {
        return await this.generateConcepts(lectureText);
    });
}
```

---

## Rate Limiting

### Simple Rate Limiter Middleware

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Limit API calls to prevent quota exhaustion
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Max 10 requests per minute
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later.'
        }
    }
});

module.exports = apiLimiter;
```

### Apply to Routes

```javascript
// app.js
const apiLimiter = require('./middleware/rateLimiter');

app.use('/api/concepts/generate', apiLimiter);
app.use('/api/transcribe', apiLimiter);
```

---

## Environment Variable Validation

```javascript
// Validate environment variables on startup
// In server.js or app.js

const requiredEnvVars = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`[Error] Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

console.log('[Server] Environment variables validated ✓');
```

---

## Graceful Error Handling

### In Services

```javascript
// services/anthropicService.js

async generateConcepts(lectureText) {
    try {
        const message = await client.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            messages: [{ role: 'user', content: prompt }]
        });

        const concepts = JSON.parse(message.content[0].text.trim());
        return concepts;

    } catch (error) {
        console.error('[Anthropic] Concept generation failed:', error);

        // Return fallback if JSON parsing fails
        if (error instanceof SyntaxError) {
            return [{
                concept_name: 'General Overview',
                concept_description: 'Review the main ideas from the lecture notes.'
            }];
        }

        throw error;
    }
}
```

### In Controllers

```javascript
// controllers/ConceptController.js

async startReview(req, res) {
    try {
        const { conceptId, audienceLevel } = req.body;

        const concept = queries.getConceptById(conceptId);
        if (!concept) {
            return this.error(res, new Error('Concept not found'), 'startReview', 404);
        }

        const result = await anthropicService.startReviewConversation(
            concept.concept_name,
            concept.concept_description,
            audienceLevel
        );

        this.success(res, result);

    } catch (error) {
        // Log the error with context
        console.error('[ConceptController] startReview failed:', error);

        // Send appropriate error response
        this.error(res, error, 'startReview');
    }
}
```

---

## Timeout Handling

```javascript
// Add timeout to API calls
const axios = require('axios');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
});

// Handle timeout errors
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('[API] Request timeout');
            return Promise.reject(new Error('Request timed out'));
        }
        return Promise.reject(error);
    }
);
```

---

## Common Error Scenarios

### 1. Invalid API Key

```javascript
try {
    await anthropicService.generateConcepts(text);
} catch (error) {
    if (error.status === 401) {
        console.error('Invalid API key');
        // Notify admin or user
    }
}
```

### 2. Rate Limit Exceeded

```javascript
try {
    await whisperService.transcribeAudio(audioPath);
} catch (error) {
    if (error.status === 429) {
        console.error('Rate limit exceeded, retry after delay');
        // Implement exponential backoff
    }
}
```

### 3. Network Errors

```javascript
try {
    const response = await apiClient.get('/courses');
} catch (error) {
    if (error.code === 'ECONNREFUSED') {
        console.error('Cannot connect to API');
        // Show user-friendly message
    }
}
```

---

## Logging Best Practices

```javascript
// utils/logger.js

function logApiError(service, method, error) {
    console.error(`[${service}] ${method} failed:`, {
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString()
    });
}

// Usage
logApiError('Anthropic', 'generateConcepts', error);
```

---

## Environment Best Practices

```bash
# .env.example (commit this to repo)
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
NODE_ENV=development
PORT=3001

# .env (DO NOT commit this)
# Add your actual keys here
```

---

## Testing Error Handling

```javascript
// Test in Node.js REPL or create a test script
const anthropicService = require('./services/anthropicService');

async function testErrorHandling() {
    try {
        // Test with invalid input
        const concepts = await anthropicService.generateConcepts('');
    } catch (error) {
        console.log('Error caught correctly:', error.message);
    }
}

testErrorHandling();
```

---

## Best Practices Summary

✅ **DO:**
- Implement retry logic with exponential backoff
- Don't retry on 4xx errors (client errors)
- Validate environment variables on startup
- Log errors with context and timestamps
- Provide fallback values when possible
- Use rate limiting to prevent abuse
- Set timeouts for API calls
- Clean up resources on errors

❌ **DON'T:**
- Retry indefinitely
- Expose API keys in error messages
- Skip error logging
- Leave unhandled promise rejections
- Forget to clean up temp files on error
- Use generic error messages
