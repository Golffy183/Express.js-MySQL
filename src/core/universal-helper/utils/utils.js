export class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.statusCode = status;
  }
}

export function ErrorHandling(err, req, res, next) {
  // Check if err.statusCode exists and is a number, else default to 500
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  res.status(statusCode).json({ 
    status: statusCode, 
    message: err.message
   });
}