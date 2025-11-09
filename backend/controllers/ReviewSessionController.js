const BaseController = require('./BaseController');
const { query, run } = require('../database/db');
const conversationService = require('../services/conversationService');

/**
 * ReviewSessionController - Handles conversational review sessions
 *
 * Endpoints:
 * - POST /api/review-sessions - Start a new review session
 * - POST /api/review-sessions/:id/message - Send a message in a session
 */
class ReviewSessionController extends BaseController {
  /**
   * Start a new review session
   * POST /api/review-sessions
   * Body: { concept_id: number, audience_level: string }
   */
  startSession = this.asyncHandler(async (req, res) => {
    const { concept_id, audience_level } = req.body;

    // Validate concept_id is a positive integer
    const parsedConceptId = parseInt(concept_id, 10);
    if (!Number.isInteger(parsedConceptId) || parsedConceptId <= 0) {
      return this.sendError(res, 'Invalid concept ID', 400);
    }

    // Validate audience_level
    const validAudienceLevels = ['classmate', 'middleschooler', 'kid'];
    if (!audience_level || !validAudienceLevels.includes(audience_level)) {
      return this.sendError(
        res,
        `Audience level must be one of: ${validAudienceLevels.join(', ')}`,
        400
      );
    }

    // Fetch concept from database
    const concepts = await query(
      'SELECT concept_name, concept_description FROM concepts WHERE id = ?',
      [parsedConceptId]
    );

    if (concepts.length === 0) {
      return this.sendError(res, 'Concept not found', 404);
    }

    const concept = concepts[0];

    try {
      // Generate initial AI message
      const initialMessage = await conversationService.generateInitialMessage(
        concept.concept_name,
        concept.concept_description,
        audience_level
      );

      // Create conversation history with first AI message
      const conversationHistory = [
        {
          role: 'assistant',
          content: initialMessage
        }
      ];

      // Create review session in database
      const result = await run(
        `INSERT INTO review_sessions (concept_id, audience_level, conversation_history)
         VALUES (?, ?, ?)`,
        [parsedConceptId, audience_level, JSON.stringify(conversationHistory)]
      );

      console.log(`Created review session ID ${result.lastID} for concept "${concept.concept_name}"`);

      // Return session ID and initial message
      this.sendSuccess(
        res,
        {
          session_id: result.lastID,
          initial_message: initialMessage
        },
        201
      );
    } catch (error) {
      console.error('Error starting review session:', error.message);

      // Check if it's an API-related error
      if (error.message.includes('API key') || error.message.includes('rate limit')) {
        return this.sendError(res, error.message, 503);
      }

      // Generic error
      return this.sendError(res, `Failed to start review session: ${error.message}`, 500);
    }
  });

  /**
   * End a review session and generate feedback
   * POST /api/review-sessions/:id/end
   */
  endSession = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate session ID is a positive integer
    const sessionId = parseInt(id, 10);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return this.sendError(res, 'Invalid session ID', 400);
    }

    // Fetch session from database
    const sessions = await query(
      'SELECT * FROM review_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return this.sendError(res, 'Session not found', 404);
    }

    const session = sessions[0];

    // Fetch concept details
    const concepts = await query(
      'SELECT concept_name, concept_description, progress_status FROM concepts WHERE id = ?',
      [session.concept_id]
    );

    if (concepts.length === 0) {
      return this.sendError(res, 'Associated concept not found', 404);
    }

    const concept = concepts[0];
    const oldStatus = concept.progress_status;

    try {
      // Parse conversation history
      let conversationHistory;
      try {
        conversationHistory = JSON.parse(session.conversation_history);
      } catch (parseError) {
        console.error('Failed to parse conversation history:', parseError);
        return this.sendError(res, 'Invalid conversation history in database', 500);
      }

      // Generate feedback using Anthropic API
      const feedback = await conversationService.analyzeFeedback(
        conversationHistory,
        concept.concept_name,
        concept.concept_description,
        session.audience_level
      );

      // Determine new progress status (increment by one level)
      const statusProgression = {
        'Not Started': 'Reviewing',
        'Reviewing': 'Understood',
        'Understood': 'Mastered',
        'Mastered': 'Mastered'
      };

      const newStatus = statusProgression[oldStatus] || 'Reviewing';

      // Update concept progress_status and last_reviewed
      await run(
        'UPDATE concepts SET progress_status = ?, last_reviewed = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, session.concept_id]
      );

      // Save feedback to session
      await run(
        'UPDATE review_sessions SET feedback = ? WHERE id = ?',
        [JSON.stringify(feedback), sessionId]
      );

      console.log(`Session ${sessionId}: Generated feedback, updated concept ${session.concept_id} from "${oldStatus}" to "${newStatus}"`);

      // Return feedback with old/new status
      this.sendSuccess(res, {
        feedback,
        old_status: oldStatus,
        new_status: newStatus
      });
    } catch (error) {
      console.error('Error ending session:', error.message);

      // Check if it's an API-related error
      if (error.message.includes('API key') || error.message.includes('rate limit')) {
        return this.sendError(res, error.message, 503);
      }

      // Generic error
      return this.sendError(res, `Failed to end session: ${error.message}`, 500);
    }
  });

  /**
   * Send a message in a review session
   * POST /api/review-sessions/:id/message
   * Body: { user_message: string }
   */
  sendMessage = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_message } = req.body;

    // Validate session ID is a positive integer
    const sessionId = parseInt(id, 10);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return this.sendError(res, 'Invalid session ID', 400);
    }

    // Validate user_message
    if (!user_message || typeof user_message !== 'string' || user_message.trim() === '') {
      return this.sendError(res, 'User message is required and must be a non-empty string', 400);
    }

    // Fetch session from database
    const sessions = await query(
      'SELECT * FROM review_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return this.sendError(res, 'Session not found', 404);
    }

    const session = sessions[0];

    // Fetch concept details for system prompt
    const concepts = await query(
      'SELECT concept_name, concept_description FROM concepts WHERE id = ?',
      [session.concept_id]
    );

    if (concepts.length === 0) {
      return this.sendError(res, 'Associated concept not found', 404);
    }

    const concept = concepts[0];

    try {
      // Parse conversation history
      let conversationHistory;
      try {
        conversationHistory = JSON.parse(session.conversation_history);
      } catch (parseError) {
        console.error('Failed to parse conversation history:', parseError);
        return this.sendError(res, 'Invalid conversation history in database', 500);
      }

      // Add user message to history
      conversationHistory.push({
        role: 'user',
        content: user_message.trim()
      });

      // Get AI response with full conversation context
      const aiResponse = await conversationService.continueConversation(
        conversationHistory,
        concept.concept_name,
        concept.concept_description,
        session.audience_level
      );

      // Add AI response to history
      conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Update session with new conversation history
      await run(
        'UPDATE review_sessions SET conversation_history = ? WHERE id = ?',
        [JSON.stringify(conversationHistory), sessionId]
      );

      console.log(`Session ${sessionId}: Added user message and AI response (${conversationHistory.length} total messages)`);

      // Return AI response
      this.sendSuccess(res, {
        ai_response: aiResponse
      });
    } catch (error) {
      console.error('Error sending message:', error.message);

      // Check if it's an API-related error
      if (error.message.includes('API key') || error.message.includes('rate limit')) {
        return this.sendError(res, error.message, 503);
      }

      // Generic error
      return this.sendError(res, `Failed to send message: ${error.message}`, 500);
    }
  });
}

module.exports = new ReviewSessionController();
