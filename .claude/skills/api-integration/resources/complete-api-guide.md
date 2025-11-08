# API Integration Guide - Super Feynman
## Anthropic Claude API + OpenAI Whisper API

Comprehensive overview and quick reference for Super Feynman API integrations.

---

## Environment Setup

### Install Dependencies

```bash
# Backend
npm install @anthropic-ai/sdk openai dotenv
```

### Environment Variables

```bash
# .env file
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
NODE_ENV=development
```

### Load Environment Variables

```javascript
// At the top of your app.js or server.js
require('dotenv').config();
```

---

## Topic Guide

This guide is organized into specialized topics. Choose what you need:

### 🤖 Anthropic Claude Integration
**File:** [anthropic-integration.md](anthropic-integration.md)

Topics covered:
- Latest model information (claude-sonnet-4-20250514)
- Concept generation from lecture notes
- Review conversation sessions (Feynman Technique)
- Feedback analysis
- Usage examples and controller integration

### 🎤 OpenAI Whisper Integration
**File:** [whisper-integration.md](whisper-integration.md)

Topics covered:
- Whisper model setup (whisper-1)
- Speech-to-text transcription
- File upload handling with Multer
- Frontend integration examples
- Testing and troubleshooting

### ⚠️ Error Handling & Retry Logic
**File:** [error-handling-retries.md](error-handling-retries.md)

Topics covered:
- API error types
- Retry with exponential backoff
- Rate limiting middleware
- Environment variable validation
- Common error scenarios
- Logging best practices

---

## Quick Reference

### Latest API Models (Jan 2025)

**Anthropic:**
- Model: `claude-sonnet-4-20250514`
- Context: 200K tokens
- Use: Concept generation, conversations, feedback

**OpenAI Whisper:**
- Model: `whisper-1`
- Formats: mp3, mp4, wav, webm
- Max Size: 25MB

---

## Common Patterns

### 1. Concept Generation from Notes

```javascript
const concepts = await anthropicService.generateConcepts(lectureText);
```

### 2. Start Review Conversation

```javascript
const result = await anthropicService.startReviewConversation(
    conceptName,
    conceptDescription,
    audienceLevel
);
```

### 3. Continue Conversation

```javascript
const response = await anthropicService.continueReviewConversation(
    conversationHistory,
    userMessage
);
```

### 4. Generate Feedback

```javascript
const feedback = await anthropicService.generateFeedback(
    conversationHistory,
    conceptName
);
```

### 5. Transcribe Audio

```javascript
const text = await whisperService.transcribeAudio(audioFilePath);
```

---

## Best Practices Summary

✅ **DO:**
- Validate API keys on startup
- Use max_tokens to limit costs
- Implement retry logic with exponential backoff
- Add rate limiting middleware
- Parse and validate API responses
- Clean up uploaded files after processing
- Log API errors with context
- Set timeouts for API calls

❌ **DON'T:**
- Expose API keys in code or frontend
- Skip error handling
- Retry on 4xx errors (client errors)
- Forget to clean up temp files
- Leave debug logs in production
- Skip input validation
- Use unnecessarily large max_tokens

---

## Cost Optimization

### Anthropic API
1. Use `max_tokens` to limit response length
2. Cache system prompts when possible
3. Monitor token usage in responses
4. Keep conversation contexts concise

### OpenAI Whisper
1. Compress audio files before sending
2. Limit recording duration in frontend
3. Use `response_format: 'text'` for smallest response
4. Implement client-side validation before upload

### General
1. Implement rate limiting
2. Cache responses when appropriate
3. Add request timeouts
4. Use fallback values when possible

---

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check `.env` file exists and is loaded
   - Verify API keys are correct
   - Ensure no extra spaces in `.env` values

2. **"Rate limit exceeded"**
   - Implement exponential backoff
   - Add rate limiting middleware
   - Consider upgrading API tier

3. **"Transcription failed"**
   - Check audio file format (webm, wav, mp3)
   - Verify file size < 25MB
   - Ensure microphone permissions granted

4. **"JSON parsing error"**
   - AI sometimes returns non-JSON text
   - Add robust error handling
   - Provide clear instructions in prompt
   - Use fallback values

---

## Getting Help

- **Anthropic Integration**: See [anthropic-integration.md](anthropic-integration.md)
- **Whisper Integration**: See [whisper-integration.md](whisper-integration.md)
- **Error Handling**: See [error-handling-retries.md](error-handling-retries.md)

Good luck with your API integrations! 🤖
