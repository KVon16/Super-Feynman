const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Retry helper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx) except rate limits (429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate exponential backoff delay: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying Anthropic API call in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Get system prompt template for a specific audience level
 * @param {string} conceptName - Name of the concept
 * @param {string} conceptDescription - Description of the concept
 * @param {string} audienceLevel - One of: 'classmate', 'middleschooler', 'kid'
 * @returns {string} System prompt
 */
function getSystemPrompt(conceptName, conceptDescription, audienceLevel) {
  const prompts = {
    classmate: `You are a college classmate learning about "${conceptName}".

Your goal is to check if the student truly understands this concept: "${conceptDescription}"

Guidelines:
- Ask thoughtful, probing questions that go beyond surface-level understanding
- Don't accept yes/no answers - ask for examples, explanations, and connections
- Challenge assumptions and ask "why" or "how" questions
- Be friendly but intellectually rigorous
- If they explain something well, acknowledge it and dig deeper
- If they struggle, guide them with questions rather than giving answers
- Keep responses concise (2-3 sentences)
- Never provide the answer directly - your role is to probe their understanding through questions

Start by asking them to explain the concept in their own words.`,

    middleschooler: `You are a curious 13-year-old middle school student learning about "${conceptName}".

You're trying to understand: "${conceptDescription}"

Guidelines:
- Use simple, age-appropriate language
- If they use jargon or complex terms, ask "what does that mean?"
- Ask for real-world examples you could relate to
- Express curiosity and enthusiasm
- Don't pretend to know things you wouldn't know as a middle schooler
- Keep responses short and energetic (1-2 sentences)
- Ask questions like a student would, showing genuine curiosity

Start by asking them to explain it like you're learning it for the first time.`,

    kid: `You are a bright 6-year-old child learning about "${conceptName}".

Someone is trying to teach you about: "${conceptDescription}"

Guidelines:
- Use very simple words a child would understand
- If they use ANY big words, ask "what does that mean?"
- Ask for comparisons to things kids know (toys, animals, cartoons, etc.)
- Be playful and ask innocent questions
- Express wonder and curiosity
- Keep responses very short (1 sentence)
- Ask simple, direct questions

Start by asking them to explain it in a way you can understand.`
  };

  return prompts[audienceLevel];
}

/**
 * Generate the initial AI message for starting a conversation
 * @param {string} conceptName - Name of the concept
 * @param {string} conceptDescription - Description of the concept
 * @param {string} audienceLevel - One of: 'classmate', 'middleschooler', 'kid'
 * @returns {Promise<string>} Initial AI message
 */
async function generateInitialMessage(conceptName, conceptDescription, audienceLevel) {
  // Validate inputs
  if (!conceptName || typeof conceptName !== 'string') {
    throw new Error('Concept name is required and must be a string');
  }

  if (!conceptDescription || typeof conceptDescription !== 'string') {
    throw new Error('Concept description is required and must be a string');
  }

  const validAudienceLevels = ['classmate', 'middleschooler', 'kid'];
  if (!validAudienceLevels.includes(audienceLevel)) {
    throw new Error(`Audience level must be one of: ${validAudienceLevels.join(', ')}`);
  }

  // Check API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment variables');
  }

  console.log(`Generating initial message for "${conceptName}" at ${audienceLevel} level...`);

  try {
    const systemPrompt = getSystemPrompt(conceptName, conceptDescription, audienceLevel);

    // Call Anthropic API with retry logic
    const message = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'Please start the conversation by asking me to explain the concept.'
        }]
      });
    });

    const aiMessage = message.content[0].text.trim();
    console.log('Generated initial message successfully');
    return aiMessage;

  } catch (error) {
    console.error('Error generating initial message:', {
      message: error.message,
      status: error.status,
      type: error.type
    });

    // Re-throw with user-friendly message
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Anthropic API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  }
}

/**
 * Continue a conversation with context
 * @param {Array} conversationHistory - Array of {role, content} message objects
 * @param {string} conceptName - Name of the concept
 * @param {string} conceptDescription - Description of the concept
 * @param {string} audienceLevel - One of: 'classmate', 'middleschooler', 'kid'
 * @returns {Promise<string>} AI response message
 */
async function continueConversation(conversationHistory, conceptName, conceptDescription, audienceLevel) {
  // Validate inputs
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    throw new Error('Conversation history is required and must be a non-empty array');
  }

  if (!conceptName || typeof conceptName !== 'string') {
    throw new Error('Concept name is required and must be a string');
  }

  if (!conceptDescription || typeof conceptDescription !== 'string') {
    throw new Error('Concept description is required and must be a string');
  }

  const validAudienceLevels = ['classmate', 'middleschooler', 'kid'];
  if (!validAudienceLevels.includes(audienceLevel)) {
    throw new Error(`Audience level must be one of: ${validAudienceLevels.join(', ')}`);
  }

  // Check API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment variables');
  }

  console.log(`Continuing conversation for "${conceptName}" (${conversationHistory.length} messages in history)...`);

  try {
    const systemPrompt = getSystemPrompt(conceptName, conceptDescription, audienceLevel);

    // Call Anthropic API with retry logic
    const message = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversationHistory
      });
    });

    const aiMessage = message.content[0].text.trim();
    console.log('Generated conversation response successfully');
    return aiMessage;

  } catch (error) {
    console.error('Error continuing conversation:', {
      message: error.message,
      status: error.status,
      type: error.type
    });

    // Re-throw with user-friendly message
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Anthropic API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Failed to continue conversation: ${error.message}`);
    }
  }
}

/**
 * Analyze conversation and generate feedback
 * @param {Array} conversationHistory - Array of {role, content} message objects
 * @param {string} conceptName - Name of the concept
 * @param {string} conceptDescription - Description of the concept
 * @param {string} audienceLevel - One of: 'classmate', 'middleschooler', 'kid'
 * @returns {Promise<Object>} Feedback object with overallQuality, clearParts, unclearParts, jargonUsed, struggledWith
 */
async function analyzeFeedback(conversationHistory, conceptName, conceptDescription, audienceLevel) {
  // Validate inputs
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    throw new Error('Conversation history is required and must be a non-empty array');
  }

  if (!conceptName || typeof conceptName !== 'string') {
    throw new Error('Concept name is required and must be a string');
  }

  if (!conceptDescription || typeof conceptDescription !== 'string') {
    throw new Error('Concept description is required and must be a string');
  }

  const validAudienceLevels = ['classmate', 'middleschooler', 'kid'];
  if (!validAudienceLevels.includes(audienceLevel)) {
    throw new Error(`Audience level must be one of: ${validAudienceLevels.join(', ')}`);
  }

  // Check API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment variables');
  }

  console.log(`Analyzing feedback for "${conceptName}" conversation (${conversationHistory.length} messages)...`);

  try {
    // Create conversation transcript for analysis
    const transcript = conversationHistory
      .map((msg, idx) => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    const feedbackPrompt = `You are an educational assessment expert analyzing a student's explanation of a concept.

Concept: "${conceptName}"
Description: "${conceptDescription}"
Audience Level: ${audienceLevel}

Here is the conversation transcript:

${transcript}

Based on this conversation, analyze the student's understanding and provide detailed, specific feedback in JSON format:

{
  "overallQuality": "A brief 1-2 sentence summary of how well they explained the concept",
  "clearParts": ["Specific aspect 1 they explained well", "Specific aspect 2 they explained well"],
  "unclearParts": ["Specific aspect 1 that was unclear or missing", "Specific aspect 2 that was unclear"],
  "jargonUsed": ["Technical term 1 they used without explanation", "Technical term 2"],
  "struggledWith": ["Specific struggle point 1", "Specific struggle point 2"]
}

Important:
- Be SPECIFIC, not generic. Reference actual parts of their explanation.
- clearParts should mention concrete aspects they got right (e.g., "Explained the tree structure with left/right child nodes")
- unclearParts should identify gaps or misconceptions (e.g., "Didn't explain why balancing matters for performance")
- jargonUsed should list technical terms used without proper explanation
- struggledWith should identify conceptual areas where they had difficulty
- Arrays can be empty if not applicable
- Return ONLY valid JSON, no additional text`;

    // Call Anthropic API with retry logic
    const message = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: feedbackPrompt
        }]
      });
    });

    let feedbackText = message.content[0].text.trim();

    // Strip markdown code blocks if present
    if (feedbackText.includes('```')) {
      feedbackText = feedbackText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    // Parse JSON response
    const feedback = JSON.parse(feedbackText);

    // Validate feedback structure
    if (!feedback.overallQuality || typeof feedback.overallQuality !== 'string') {
      throw new Error('Invalid feedback: missing overallQuality');
    }

    if (!Array.isArray(feedback.clearParts)) {
      feedback.clearParts = [];
    }

    if (!Array.isArray(feedback.unclearParts)) {
      feedback.unclearParts = [];
    }

    if (!Array.isArray(feedback.jargonUsed)) {
      feedback.jargonUsed = [];
    }

    if (!Array.isArray(feedback.struggledWith)) {
      feedback.struggledWith = [];
    }

    console.log('Generated feedback successfully');
    return feedback;

  } catch (error) {
    console.error('Error analyzing feedback:', {
      message: error.message,
      status: error.status,
      type: error.type
    });

    // Re-throw with user-friendly message
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Anthropic API rate limit exceeded. Please try again later.');
    } else if (error instanceof SyntaxError) {
      throw new Error('Failed to parse feedback response from AI');
    } else {
      throw new Error(`Failed to analyze feedback: ${error.message}`);
    }
  }
}

module.exports = {
  generateInitialMessage,
  continueConversation,
  analyzeFeedback
};
