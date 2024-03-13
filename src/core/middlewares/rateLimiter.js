import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  handler: (req, res, next) => next(new ErrorResponse("Too many requests", 429)),
});
