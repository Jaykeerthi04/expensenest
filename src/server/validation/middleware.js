import { z } from 'zod';

/**
 * Validation middleware factory
 * Returns middleware that validates req.body against a schema
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the request body against the schema
      const validatedData = schema.parse(req.body);
      // Replace req.body with cleaned/coerced data from validation
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into a readable error message
        const fieldErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join('.');
          const message = err.message;
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(message);
          return acc;
        }, {});

        return res.status(400).json({
          message: 'Validation failed',
          errors: fieldErrors
        });
      }

      // Handle unexpected errors
      res.status(400).json({
        message: 'Invalid request body'
      });
    }
  };
};
