export class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.statusCode = status;
    }
}

export const ErrorHandling = (err, res) => {
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message
    });
};