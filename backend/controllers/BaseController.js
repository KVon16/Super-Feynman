/**
 * BaseController - Provides common utilities for all controllers
 *
 * This class offers:
 * - asyncHandler: Wraps async route handlers to catch errors
 * - sendSuccess: Standardized success response format
 * - sendError: Standardized error response format
 */
class BaseController {
  /**
   * Wraps async route handlers to automatically catch errors
   * and pass them to the error handling middleware
   *
   * @param {Function} fn - Async route handler function
   * @returns {Function} - Express middleware function
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Sends a standardized success response
   *
   * @param {Object} res - Express response object
   * @param {*} data - Data to send in response
   * @param {number} status - HTTP status code (default: 200)
   */
  sendSuccess(res, data, status = 200) {
    res.status(status).json({
      success: true,
      data
    });
  }

  /**
   * Sends a standardized error response
   *
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 400)
   */
  sendError(res, message, status = 400) {
    res.status(status).json({
      success: false,
      error: message
    });
  }
}

module.exports = BaseController;
