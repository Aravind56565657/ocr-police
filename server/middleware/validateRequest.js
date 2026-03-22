const { failure } = require('../utils/responseBuilder');

exports.validateFieldUpdate = (req, res, next) => {
    const { fieldPath, newValue } = req.body;
    if (!fieldPath) {
        return res.status(400).json(failure('fieldPath is required'));
    }

    const allowedPrefixes = ['officerDetails.', 'caseDetails.', 'documentType', 'processingStatus'];
    const isValid = allowedPrefixes.some(prefix => fieldPath.startsWith(prefix) || fieldPath === prefix);

    if (!isValid) {
        return res.status(400).json(failure('Invalid fieldPath'));
    }

    next();
};

exports.sanitizeSearch = (req, res, next) => {
    if (req.query.q) {
        req.query.q = req.query.q.replace(/[\{\}\$\\]/g, '');
    }
    next();
};
