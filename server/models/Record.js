const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    // === DOCUMENT METADATA ===
    uploadId: { type: String, required: true, unique: true },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf', 'scan'], required: true },
    originalFileUrl: { type: String }, // path or GCS URL
    uploadedAt: { type: Date, default: Date.now },

    // === OCR RAW DATA ===
    rawExtractedText: { type: String, default: '' },
    detectedLanguages: [{
        languageCode: String,   // e.g., "te", "hi", "en"
        languageName: String,   // e.g., "Telugu", "Hindi", "English"
        confidence: Number      // 0.0 to 1.0
    }],
    overallOCRConfidence: { type: Number, min: 0, max: 1 },
    lowConfidenceWords: [{ word: String, confidence: Number, boundingBox: Object }],
    requiresManualReview: { type: Boolean, default: false },

    // === OFFICER INFORMATION (Extracted by Gemini) ===
    officerDetails: {
        name: { value: String, confidence: Number, manuallyEdited: Boolean },
        badgeNumber: { value: String, confidence: Number, manuallyEdited: Boolean },
        rank: { value: String, confidence: Number, manuallyEdited: Boolean },
        department: { value: String, confidence: Number, manuallyEdited: Boolean },
        station: { value: String, confidence: Number, manuallyEdited: Boolean },
        district: { value: String, confidence: Number, manuallyEdited: Boolean },
        state: { value: String, confidence: Number, manuallyEdited: Boolean },
        contactNumber: { value: String, confidence: Number, manuallyEdited: Boolean },
        joiningDate: { value: Date, confidence: Number, manuallyEdited: Boolean },
    },

    // === INCIDENT / CASE INFORMATION ===
    caseDetails: {
        caseNumber: { value: String, confidence: Number, manuallyEdited: Boolean },
        caseType: { value: String, confidence: Number, manuallyEdited: Boolean },
        incidentDate: { value: Date, confidence: Number, manuallyEdited: Boolean },
        incidentLocation: { value: String, confidence: Number, manuallyEdited: Boolean },
        description: { value: String, confidence: Number, manuallyEdited: Boolean },
        status: {
            value: { type: String, enum: ['Open', 'Closed', 'Under Investigation', 'Pending', 'Unknown'] },
            confidence: Number,
            manuallyEdited: Boolean
        },
        fir_number: { value: String, confidence: Number, manuallyEdited: Boolean },
    },

    // === DOCUMENT CLASSIFICATION ===
    documentType: {
        type: String,
        enum: ['FIR', 'Case Report', 'Officer Record', 'Incident Report', 'Duty Roster', 'Complaint', 'Witness Statement', 'Other'],
        default: 'Other'
    },

    // === STATUS ===
    processingStatus: {
        type: String,
        enum: ['uploaded', 'ocr_processing', 'ocr_complete', 'extracting', 'complete', 'failed'],
        default: 'uploaded'
    },
    errorMessage: { type: String },

    // === EDIT HISTORY ===
    editHistory: [{
        field: String,
        oldValue: String,
        newValue: String,
        editedAt: { type: Date, default: Date.now },
        editedBy: { type: String, default: 'user' }
    }],

    // === SEARCH OPTIMIZATION ===
    searchTags: [String], // flat array of all searchable keywords

}, { timestamps: true });

// Atlas Search index
RecordSchema.index({
    rawExtractedText: 'text',
    searchTags: 'text',
    'officerDetails.name.value': 'text',
    'caseDetails.caseNumber.value': 'text'
});

module.exports = mongoose.model('Record', RecordSchema);
