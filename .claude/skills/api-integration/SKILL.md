---
name: api-integration
description: API integration guide for Super Feynman using Anthropic Claude API and OpenAI Whisper API. Use when integrating external AI services, implementing concept generation, conversational review sessions, feedback analysis, or speech-to-text transcription. Covers error handling, rate limiting, and retry logic.
---

# API Integration - Super Feynman

## Purpose

Provide Anthropic Claude API and OpenAI Whisper API integration patterns specifically for Super Feynman's AI-powered learning features.

## When to Use This Skill

Automatically activates when:
- Integrating Anthropic Claude API
- Implementing concept generation from lecture notes
- Building conversational review sessions (Feynman Technique)
- Generating feedback analysis
- Integrating OpenAI Whisper for speech-to-text
- Handling API errors and rate limiting
- Setting up retry logic

---

## Quick Start

### API Integration Checklist

- [ ] Environment variables set (API keys)
- [ ] API client initialized
- [ ] Error handling implemented
- [ ] Rate limiting middleware added
- [ ] Retry logic for failures
- [ ] Input validation
- [ ] Response parsing and validation
- [ ] Testing with sample data

---

## Core Patterns

### 1. Anthropic Concept Generation

```javascript
// services/anthropicService.js
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateConcepts(lectureText) {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: `Break down these lecture notes into 5-15 bite-sized concepts...

${lectureText}`
        }]
    });

    const concepts = JSON.parse(message.content[0].text);
    return concepts;
}
```

### 2. Conversational Review Session

```javascript
async function continueReviewConversation(conversationHistory, userMessage) {
    const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: updatedHistory
    });

    return {
        message: message.content[0].text,
        conversationHistory: [
            ...updatedHistory,
            { role: 'assistant', content: message.content[0].text }
        ]
    };
}
```

### 3. Whisper Transcription

```javascript
// services/whisperService.js
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function transcribeAudio(audioFilePath) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'en'
    });

    return transcription;
}
```

---

## API Models (Latest as of Jan 2025)

### Anthropic
- **Model**: `claude-sonnet-4-20250514`
- **Context**: 200K tokens
- **Use**: Concept generation, conversations, feedback

### OpenAI Whisper
- **Model**: `whisper-1`
- **Formats**: mp3, mp4, wav, webm
- **Max Size**: 25MB

---

## Error Handling

### Retry with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status >= 400 && error.status < 500) {
                throw error; // Don't retry client errors
            }

            if (attempt === maxRetries - 1) throw error;

            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

### Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: { error: 'Too many requests' }
});

module.exports = apiLimiter;
```

---

## Directory Structure

```
backend/src/
├── services/
│   ├── anthropicService.js
│   └── whisperService.js
├── routes/
│   ├── conceptRoutes.js
│   └── transcribeRoutes.js
├── middleware/
│   └── rateLimiter.js
└── utils/
    └── retryHelper.js
```

---

## Navigation Guide

For detailed implementations, see the resources:

| Need to... | Resource File |
|------------|--------------|
| Complete API integration guide | [complete-api-guide.md](resources/complete-api-guide.md) |
| Anthropic Claude integration | [anthropic-integration.md](resources/anthropic-integration.md) |
| OpenAI Whisper integration | [whisper-integration.md](resources/whisper-integration.md) |
| Error handling & retry logic | [error-handling-retries.md](resources/error-handling-retries.md) |

---

## Quick Reference

### Environment Variables

```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Common Patterns

```javascript
// 1. Concept generation from notes
const concepts = await anthropicService.generateConcepts(lectureText);

// 2. Start review conversation
const result = await anthropicService.startReviewConversation(
    conceptName,
    conceptDescription,
    audienceLevel
);

// 3. Continue conversation
const response = await anthropicService.continueReviewConversation(
    conversationHistory,
    userMessage
);

// 4. Generate feedback
const feedback = await anthropicService.generateFeedback(
    conversationHistory,
    conceptName
);

// 5. Transcribe audio
const text = await whisperService.transcribeAudio(audioFilePath);
```

---

## Best Practices

✅ **DO:**
- Validate API keys on startup
- Use max_tokens to limit costs
- Implement retry logic
- Add rate limiting
- Parse and validate responses
- Clean up uploaded files
- Log API errors with context

❌ **DON'T:**
- Expose API keys in code
- Skip error handling
- Retry on 4xx errors
- Forget to set timeouts
- Leave debug logs in production

---

## Related Skills

- **backend-dev** - Controllers and services that use these APIs
- **frontend-dev** - UI components that trigger API calls

---

**Skill Status**: Optimized for Super Feynman hackathon ✅
**Progressive Disclosure**: See resources/ for detailed guides ✅
