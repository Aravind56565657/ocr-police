const { failure } = require('../utils/responseBuilder');

const errorHandler = (err, req, res, next) => {
    console.error('[Global Error]', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json(failure('Validation error', err.errors));
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(failure('File too large', { details: 'Max size is 20MB' }));
    }

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json(failure(message, process.env.NODE_ENV === 'production' ? null : { stack: err.stack }));
};

module.exports = errorHandler;
