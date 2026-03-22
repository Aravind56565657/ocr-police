const mongoose = require('mongoose');

const UploadLogSchema = new mongoose.Schema({
    uploadId: { type: String, required: true },
    fileName: { type: String },
    status: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadLog', UploadLogSchema);
