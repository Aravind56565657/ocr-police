const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { extractTextFromImage } = require('../services/visionService');
const { extractStructuredData } = require('../services/geminiService');
const { convertPdfToImages } = require('../utils/pdfToImage');
const Record = require('../models/Record');
const { success, failure } = require('../utils/responseBuilder');

/**
 * Generates an optimized base64 thumbnail for a given image file.
 */
async function generateThumbnail(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        
        // Skip for PDF for now (requires complex converter logic)
        if (filePath.toLowerCase().endsWith('.pdf')) return null;

        const buffer = await sharp(filePath)
            .resize({ width: 1000, withoutEnlargement: true }) // optimized width
            .jpeg({ quality: 60, progressive: true })         // aggressive compression
            .toBuffer();
        
        return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (err) {
        console.warn('[Thumbnail Error]', err.message);
        return null;
    }
}

async function uploadAndProcess(req, res) {
    if (!req.file) return res.status(400).json(failure('No file uploaded'));

    const uploadId = uuidv4();
    let record;

    try {
        // Generate persistent thumbnail if image
        const thumbnailUrl = await generateThumbnail(req.file.path);

        // Step 1: Initialize record in DB as "uploaded"
        record = await Record.create({
            uploadId,
            originalFileName: req.file.originalname,
            fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
            originalFileUrl: `uploads/${req.file.filename}`,
            thumbnailUrl,
            processingStatus: 'ocr_processing',
            rawExtractedText: '',
        });

        // Step 2 & 3: Run OCR or Native PDF Parser
        let combinedRawText = '';
        let combinedLanguages = [];
        let minConfidence = 1.0;
        let allLowConfWords = [];

        if (req.file.mimetype === 'application/pdf') {
            const fs = require('fs');
            const pdfParse = require('pdf-parse');
            try {
                const dataBuffer = fs.readFileSync(req.file.path);
                const pdfData = await pdfParse(dataBuffer);
                combinedRawText = pdfData.text || 'No parseable text found in PDF';
                minConfidence = 0.95;
            } catch (pdfErr) {
                console.warn('[PDF Parse Error]', pdfErr.message);
                combinedRawText = 'Error extracting text from PDF. Document might be corrupted or entirely scanned images.';
                minConfidence = 0.50;
            }
            combinedLanguages = [{ languageCode: 'en', languageName: 'English', confidence: 0.95 }];
        } else {
            const ocrResult = await extractTextFromImage(req.file.path);
            combinedRawText = ocrResult.rawText;
            combinedLanguages = ocrResult.detectedLanguages;
            allLowConfWords = ocrResult.lowConfidenceWords;
            minConfidence = ocrResult.overallOCRConfidence;
        }

        // Update record with OCR data
        await Record.findByIdAndUpdate(record._id, {
            rawExtractedText: combinedRawText.trim(),
            detectedLanguages: combinedLanguages,
            overallOCRConfidence: minConfidence,
            lowConfidenceWords: allLowConfWords.slice(0, 50), // cap storage
            processingStatus: 'extracting',
        });

        // Step 4: Gemini structured extraction
        const { extracted, lowConfidenceFields, requiresManualReview } =
            await extractStructuredData(combinedRawText.trim());

        // Step 5: Save complete record
        const finalRecord = await Record.findByIdAndUpdate(record._id, {
            officerDetails: extracted.officerDetails,
            caseDetails: extracted.caseDetails,
            documentType: extracted.documentType,
            searchTags: extracted.searchTags,
            requiresManualReview,
            processingStatus: 'complete',
        }, { new: true });

        return res.status(201).json(success('Document processed successfully', {
            record: finalRecord,
            warnings: lowConfidenceFields.length > 0
                ? { message: `${lowConfidenceFields.length} fields have low confidence`, fields: lowConfidenceFields }
                : null
        }));

    } catch (err) {
        if (record) {
            await Record.findByIdAndUpdate(record._id, {
                processingStatus: 'failed',
                errorMessage: err.message
            });
        }
        console.error('[Upload Error]', err);
        return res.status(500).json(failure('Processing failed: ' + err.message));
    }
}

async function getStatus(req, res) {
    try {
        const record = await Record.findOne({ uploadId: req.params.uploadId });
        if (!record) return res.status(404).json(failure('Upload not found'));
        return res.json(success('Status retrieved', { status: record.processingStatus, record }));
    } catch (err) {
        return res.status(500).json(failure('Failed to get status', err.message));
    }
}

async function reprocessDocument(req, res) {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json(failure('Record not found'));

        // Update status indicating processing started again
        await Record.findByIdAndUpdate(record._id, { processingStatus: 'ocr_processing' });

        const filePath = path.join(__dirname, '..', record.originalFileUrl.replace(/\//g, path.sep));

        let combinedRawText = '';
        let combinedLanguages = [];
        let minConfidence = 1.0;
        let allLowConfWords = [];

        if (record.fileType === 'pdf' || record.originalFileUrl.toLowerCase().endsWith('.pdf')) {
            const fs = require('fs');
            const pdfParse = require('pdf-parse');
            try {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                combinedRawText = pdfData.text || 'No parseable text found in PDF';
                minConfidence = 0.95;
            } catch (pdfErr) {
                console.warn('[PDF Parse Error]', pdfErr.message);
                combinedRawText = 'Error extracting text from PDF. Document might be corrupted or entirely scanned images.';
                minConfidence = 0.50;
            }
            combinedLanguages = [{ languageCode: 'en', languageName: 'English', confidence: 0.95 }];
        } else {
            const ocrResult = await extractTextFromImage(filePath);
            combinedRawText = ocrResult.rawText;
            combinedLanguages = ocrResult.detectedLanguages;
            allLowConfWords = ocrResult.lowConfidenceWords;
            minConfidence = ocrResult.overallOCRConfidence;
        }

        // Generate persistent thumbnail if image
        const thumbnailUrl = await generateThumbnail(filePath);

        // Update record with OCR data and thumbnail directly
        await Record.findByIdAndUpdate(record._id, {
            thumbnailUrl,
            rawExtractedText: combinedRawText.trim(),
            detectedLanguages: combinedLanguages,
            overallOCRConfidence: minConfidence,
            lowConfidenceWords: allLowConfWords.slice(0, 50),
            processingStatus: 'extracting',
        });

        // Gemini structured extraction
        const { extracted, lowConfidenceFields, requiresManualReview } =
            await extractStructuredData(combinedRawText.trim());

        // Save complete record overwrite
        const finalRecord = await Record.findByIdAndUpdate(record._id, {
            officerDetails: extracted.officerDetails,
            caseDetails: extracted.caseDetails,
            documentType: extracted.documentType,
            searchTags: extracted.searchTags,
            requiresManualReview,
            processingStatus: 'complete',
        }, { new: true });

        return res.json(success('Document reprocessed successfully', { record: finalRecord }));
    } catch (err) {
        await Record.findByIdAndUpdate(req.params.id, {
            processingStatus: 'failed',
            errorMessage: err.message
        });
        console.error('[Reprocess Error]', err);
        return res.status(500).json(failure('Reprocessing failed: ' + err.message));
    }
}

module.exports = { uploadAndProcess, getStatus, reprocessDocument };
