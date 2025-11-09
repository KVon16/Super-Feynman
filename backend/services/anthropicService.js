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
 * Generate concepts from lecture notes using Anthropic Claude API
 * @param {string} fileContent - The lecture notes text
 * @returns {Promise<Array>} Array of concept objects with concept_name and concept_description
 */
async function generateConcepts(fileContent) {
  // Validate input
  if (!fileContent || typeof fileContent !== 'string' || fileContent.trim().length === 0) {
    throw new Error('File content is required and must be a non-empty string');
  }

  // Check API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment variables');
  }

  console.log(`Generating concepts from lecture notes (${fileContent.length} characters)...`);

  try {
    // Call Anthropic API with retry logic
    const message = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `You are an expert educator analyzing lecture notes. Your task is to break down these lecture notes into 5-15 bite-sized, distinct concepts that a student should understand and be able to explain using the Feynman Technique.

For each concept, provide:
1. concept_name: A clear, concise name (2-6 words)
2. concept_description: A brief description explaining what the concept is about (1-2 sentences)

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown formatting, or explanations. The response must be parseable JSON.

Format:
[
  {
    "concept_name": "Concept Title",
    "concept_description": "Brief explanation of what this concept covers."
  }
]

Guidelines:
- Extract 5-15 concepts (adjust based on content length and complexity)
- Make concepts specific and testable
- Focus on key ideas that require understanding, not just memorization
- Ensure concepts are distinct and don't overlap significantly
- Use clear, student-friendly language

Lecture Notes:
${fileContent}`
        }]
      });
    });

    // Extract text from response
    let responseText = message.content[0].text.trim();
    console.log('Received response from Anthropic API');

    // Strip markdown code blocks if present (Claude sometimes wraps JSON in ```json ... ```)
    if (responseText.startsWith('```')) {
      // Remove opening code block (```json or ```)
      responseText = responseText.replace(/^```(?:json)?\s*\n/, '');
      // Remove closing code block (```)
      responseText = responseText.replace(/\n```\s*$/, '');
      responseText = responseText.trim();
    }

    // Parse JSON response
    let concepts;
    try {
      concepts = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Anthropic response as JSON:', responseText);
      throw new Error('Anthropic API returned invalid JSON format');
    }

    // Validate response format
    if (!Array.isArray(concepts)) {
      throw new Error('Anthropic API response is not an array');
    }

    if (concepts.length === 0) {
      console.warn('Anthropic API returned empty concepts array');
      return [];
    }

    if (concepts.length < 5 || concepts.length > 15) {
      console.warn(`Anthropic API returned ${concepts.length} concepts (expected 5-15)`);
    }

    // Validate each concept has required fields
    const validatedConcepts = concepts
      .filter(concept => {
        if (!concept.concept_name || !concept.concept_description) {
          console.warn('Skipping invalid concept (missing required fields):', concept);
          return false;
        }
        return true;
      })
      .map(concept => ({
        concept_name: String(concept.concept_name).trim(),
        concept_description: String(concept.concept_description).trim()
      }));

    console.log(`Successfully generated ${validatedConcepts.length} concepts`);
    return validatedConcepts;

  } catch (error) {
    // Log detailed error for debugging
    console.error('Error generating concepts:', {
      message: error.message,
      status: error.status,
      type: error.type
    });

    // Re-throw with user-friendly message
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Anthropic API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    } else {
      throw new Error(`Concept generation failed: ${error.message}`);
    }
  }
}

module.exports = {
  generateConcepts
};
