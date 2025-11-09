# Anthropic Claude API Integration - Super Feynman

Complete guide to integrating Anthropic Claude API for concept generation, review sessions, and feedback.

---

## Latest Model Information

As of November 2025, the latest Anthropic model is:
- **Model ID:** `claude-sonnet-4-5`
- **Context Window:** 200K tokens
- **Features:** Advanced reasoning, code generation, long context

Check [Anthropic's documentation](https://docs.anthropic.com/en/api/getting-started) for the latest models.

---

## Service Setup

```javascript
// services/anthropicService.js
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Model configuration
const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 2000;

class AnthropicService {
    // Methods implemented below
}

module.exports = new AnthropicService();
```

---

## Concept Generation

Generate bite-sized concepts from lecture notes.

```javascript
async generateConcepts(lectureText) {
    try {
        const message = await client.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            messages: [{
                role: 'user',
                content: `You are an educational assistant helping students learn using the Feynman Technique.

Analyze the following lecture notes and break them down into 5-15 bite-sized, distinct concepts that a student should understand. Each concept should be:
- A specific, focused topic (not too broad)
- Something that can be explained in 2-3 minutes
- Testable through conversation

Return ONLY a valid JSON array with this exact structure:
[
  {
    "concept_name": "Brief name of the concept",
    "concept_description": "2-3 sentence description of what the student should understand"
  }
]

Lecture notes:
${lectureText}

Remember: Return ONLY the JSON array, no additional text.`
            }]
        });

        const responseText = message.content[0].text.trim();

        // Parse JSON response
        const concepts = JSON.parse(responseText);

        // Validate structure
        if (!Array.isArray(concepts)) {
            throw new Error('Response is not an array');
        }

        // Ensure each concept has required fields
        concepts.forEach(concept => {
            if (!concept.concept_name || !concept.concept_description) {
                throw new Error('Invalid concept structure');
            }
        });

        console.log(`[Anthropic] Generated ${concepts.length} concepts`);
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

**Usage:**

```javascript
// In lectureService.js
const anthropicService = require('./anthropicService');

async createLectureWithConcepts(courseId, name, fileContent) {
    const lecture = queries.createLecture(courseId, name, fileContent);

    try {
        const concepts = await anthropicService.generateConcepts(fileContent);

        for (const concept of concepts) {
            queries.createConcept(
                lecture.id,
                concept.concept_name,
                concept.concept_description
            );
        }
    } catch (error) {
        console.error('Failed to generate concepts:', error);
        // Lecture exists, but without AI-generated concepts
    }

    return lecture;
}
```

---

## Review Conversation

Interactive conversation to test student understanding using the Feynman Technique.

### Start Review Session

```javascript
async startReviewConversation(conceptName, conceptDescription, audienceLevel) {
    // Map audience level to system prompt
    const audiencePrompts = {
        'classmate': 'a fellow college student in your class',
        'middle-schooler': 'a curious 13-year-old middle school student',
        'kid': 'a bright 8-year-old child'
    };

    const audience = audiencePrompts[audienceLevel] || audiencePrompts['classmate'];

    const systemPrompt = `You are a Socratic tutor helping a student learn using the Feynman Technique. The student will explain the concept: "${conceptName}".

Your role:
- Ask probing questions to test their understanding
- Identify gaps in their knowledge
- Encourage them to explain in simple terms (as if explaining to ${audience})
- NEVER directly teach or explain the concept yourself
- Ask follow-up questions about unclear explanations
- Challenge them with "why" and "how" questions
- Keep responses concise (2-3 sentences max)
- Be encouraging but honest about gaps

The student should be explaining to ${audience}, so watch for:
- Use of technical jargon without explanation
- Skipping important steps in reasoning
- Vague or circular explanations
- Missing key concepts from the description: ${conceptDescription}

Start by asking them to explain the concept in their own words.`;

    try {
        const message = await client.messages.create({
            model: MODEL,
            max_tokens: 300, // Shorter for quick responses
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: 'I\'m ready to explain this concept.'
            }]
        });

        return {
            message: message.content[0].text,
            conversationHistory: [
                { role: 'user', content: 'I\'m ready to explain this concept.' },
                { role: 'assistant', content: message.content[0].text }
            ]
        };

    } catch (error) {
        console.error('[Anthropic] Failed to start conversation:', error);
        throw error;
    }
}
```

### Continue Conversation

```javascript
async continueReviewConversation(conversationHistory, userMessage) {
    try {
        // Add user's message to history
        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        const message = await client.messages.create({
            model: MODEL,
            max_tokens: 300,
            messages: updatedHistory
        });

        const assistantMessage = message.content[0].text;

        return {
            message: assistantMessage,
            conversationHistory: [
                ...updatedHistory,
                { role: 'assistant', content: assistantMessage }
            ]
        };

    } catch (error) {
        console.error('[Anthropic] Failed to continue conversation:', error);
        throw error;
    }
}
```

**Usage in Controller:**

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
        this.error(res, error, 'startReview');
    }
}

async continueReview(req, res) {
    try {
        const { conversationHistory, userMessage } = req.body;

        const result = await anthropicService.continueReviewConversation(
            conversationHistory,
            userMessage
        );

        this.success(res, result);
    } catch (error) {
        this.error(res, error, 'continueReview');
    }
}
```

---

## Feedback Analysis

Analyze the review session and provide feedback.

```javascript
async generateFeedback(conversationHistory, conceptName, conceptDescription) {
    try {
        const conversationText = conversationHistory
            .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
            .join('\n\n');

        const message = await client.messages.create({
            model: MODEL,
            max_tokens: 1500,
            messages: [{
                role: 'user',
                content: `You are analyzing a Feynman Technique review session for the concept: "${conceptName}".

Expected understanding: ${conceptDescription}

Review session transcript:
${conversationText}

Analyze the student's performance and provide structured feedback in JSON format:
{
  "overallQuality": "2-3 sentence summary of how well they explained the concept",
  "clearParts": ["Array of specific things they explained well"],
  "unclearParts": ["Array of areas that were unclear or incomplete"],
  "jargonUsed": ["Array of technical terms they used without explaining"],
  "struggledWith": ["Array of specific aspects they had difficulty explaining"],
  "progressLevel": "one of: Not Started, Reviewing, Understood, Mastered"
}

Progress level guidelines:
- "Not Started": Never attempted or completely off-track
- "Reviewing": Made an attempt but major gaps in understanding
- "Understood": Explained most of the concept correctly with minor gaps
- "Mastered": Explained clearly and completely with proper analogies

Return ONLY the JSON object, no additional text.`
            }]
        });

        const feedbackText = message.content[0].text.trim();
        const feedback = JSON.parse(feedbackText);

        console.log(`[Anthropic] Generated feedback for concept: ${conceptName}`);
        return feedback;

    } catch (error) {
        console.error('[Anthropic] Feedback generation failed:', error);

        // Fallback feedback
        return {
            overallQuality: 'Unable to analyze the session. Please try again.',
            clearParts: [],
            unclearParts: ['Session analysis failed'],
            jargonUsed: [],
            struggledWith: [],
            progressLevel: 'Reviewing'
        };
    }
}
```

**Usage:**

```javascript
// controllers/ConceptController.js

async endReview(req, res) {
    try {
        const { conceptId, conversationHistory, audienceLevel } = req.body;

        const concept = queries.getConceptById(conceptId);
        if (!concept) {
            return this.error(res, new Error('Concept not found'), 'endReview', 404);
        }

        // Generate feedback
        const feedback = await anthropicService.generateFeedback(
            conversationHistory,
            concept.concept_name,
            concept.concept_description
        );

        // Update concept progress
        const updatedConcept = queries.updateConceptProgress(
            conceptId,
            feedback.progressLevel
        );

        // Save review session
        queries.createReviewSession(
            conceptId,
            audienceLevel,
            conversationHistory,
            feedback
        );

        this.success(res, {
            feedback,
            concept: updatedConcept
        });

    } catch (error) {
        this.error(res, error, 'endReview');
    }
}
```

---

## Cost Optimization Tips

1. Use `max_tokens` to limit response length
2. Cache system prompts when possible
3. Monitor token usage in responses
4. Keep conversation contexts concise

---

## Best Practices

✅ **DO:**
- Validate API key on startup
- Use max_tokens to control costs
- Parse and validate JSON responses
- Provide fallback for parsing failures
- Log API calls with context
- Handle rate limits gracefully

❌ **DON'T:**
- Expose API keys in code
- Skip JSON validation
- Forget error handling
- Use unnecessarily large max_tokens
- Leave debug logs in production
