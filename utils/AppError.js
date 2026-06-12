class AppError extends Error {
  constructor(message, status) {
    super(message); // new Error(message)
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); // show error on line no:
  }
}

module.exports = AppError;
