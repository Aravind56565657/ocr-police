const Record = require('../models/Record');
const { success, failure } = require('../utils/responseBuilder');

exports.getRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', documentType, language } = req.query;
        const query = {};
        if (documentType) query.documentType = documentType;
        if (language) query['detectedLanguages.languageName'] = language;

        const skip = (page - 1) * limit;

        // Default ignore deleted if we implement soft delete
        query.isDeleted = { $ne: true };

        const records = await Record.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Record.countDocuments(query);

        return res.json(success('Records retrieved successfully', {
            records,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        }));
    } catch (err) {
        return res.status(500).json(failure('Error retrieving records', err));
    }
};

exports.getRecordById = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record || record.isDeleted) return res.status(404).json(failure('Record not found'));
        return res.json(success('Record retrieved successfully', { record }));
    } catch (err) {
        return res.status(500).json(failure('Error retrieving record', err));
    }
};

exports.updateField = async (req, res) => {
    try {
        const { id } = req.params;
        const { fieldPath, newValue } = req.body;

        const record = await Record.findById(id);
        if (!record) return res.status(404).json(failure('Record not found'));

        // We get the old value using simple string path reduction to save to editHistory
        const getNestedValue = (obj, path) => path.split('.').reduce((o, i) => o?.[i], obj);
        const oldValue = getNestedValue(record, fieldPath);

        // Apply the new value dynamically
        const updateObj = {};
        updateObj[fieldPath] = newValue;

        // Also track that it was manually edited if it is inside officerDetails/caseDetails
        if (fieldPath.includes('officerDetails') || fieldPath.includes('caseDetails')) {
            const basePath = fieldPath.substring(0, fieldPath.lastIndexOf('.'));
            updateObj[`${basePath}.manuallyEdited`] = true;
        }

        record.editHistory.push({
            field: fieldPath,
            oldValue: oldValue?.toString(),
            newValue: newValue?.toString()
        });

        await Record.updateOne({ _id: id }, { $set: updateObj, $push: { editHistory: record.editHistory[record.editHistory.length - 1] } });

        return res.json(success('Field updated successfully', { fieldPath, newValue }));
    } catch (err) {
        return res.status(500).json(failure('Error updating field', err));
    }
};

exports.markReviewed = async (req, res) => {
    try {
        const record = await Record.findByIdAndUpdate(req.params.id, {
            requiresManualReview: false
        });
        if (!record) return res.status(404).json(failure('Record not found'));
        return res.json(success('Record marked as reviewed'));
    } catch (err) {
        return res.status(500).json(failure('Error updating record', err));
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true });
        if (!record) return res.status(404).json(failure('Record not found'));
        return res.json(success('Record deleted successfully'));
    } catch (err) {
        return res.status(500).json(failure('Error deleting record', err));
    }
};

exports.getRawText = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id).select('rawExtractedText detectedLanguages overallOCRConfidence');
        if (!record) return res.status(404).json(failure('Record not found'));
        return res.json(success('Raw text retrieved', {
            rawText: record.rawExtractedText,
            languages: record.detectedLanguages,
            confidence: record.overallOCRConfidence
        }));
    } catch (err) {
        return res.status(500).json(failure('Error reading record', err));
    }
};
