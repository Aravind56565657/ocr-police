const vision = require('@google-cloud/vision');

const path = require('path');

// Initialize with keyFilename (credentials json)
const client = new vision.ImageAnnotatorClient({
    keyFilename: 'E:\\lunar-standard-461416-s6-ed07d40b9718.json'
});

async function extractTextFromImage(imagePath) {
    const [result] = await client.documentTextDetection(imagePath);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation) {
        return { rawText: '', confidence: 0, languages: [], words: [] };
    }

    const rawText = fullTextAnnotation.text;

    // Extract all detected languages
    const langSet = new Map();
    const wordData = [];

    for (const page of fullTextAnnotation.pages) {
        // Page-level language detection
        if (page.property?.detectedLanguages) {
            for (const lang of page.property.detectedLanguages) {
                langSet.set(lang.languageCode, (langSet.get(lang.languageCode) || 0) + lang.confidence);
            }
        }

        for (const block of page.blocks) {
            for (const paragraph of block.paragraphs) {
                for (const word of paragraph.words) {
                    const wordText = word.symbols.map(s => s.text).join('');
                    const wordConf = word.confidence || 0;
                    wordData.push({
                        word: wordText,
                        confidence: wordConf,
                        boundingBox: word.boundingBox
                    });
                }
            }
        }
    }

    // Calculate overall confidence
    const avgConfidence = wordData.length > 0
        ? wordData.reduce((sum, w) => sum + w.confidence, 0) / wordData.length
        : 0;

    // Low confidence words
    const lowConfWords = wordData.filter(w => w.confidence < 0.6);

    // Language mapping
    const LANG_NAMES = {
        'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
        'kn': 'Kannada', 'ml': 'Malayalam', 'mr': 'Marathi', 'bn': 'Bengali',
        'gu': 'Gujarati', 'pa': 'Punjabi', 'ur': 'Urdu', 'or': 'Odia'
    };

    const languages = Array.from(langSet.entries()).map(([code, conf]) => ({
        languageCode: code,
        languageName: LANG_NAMES[code] || code,
        confidence: Math.min(conf, 1.0)
    }));

    return {
        rawText,
        overallOCRConfidence: parseFloat(avgConfidence.toFixed(3)),
        detectedLanguages: languages,
        lowConfidenceWords: lowConfWords,
        totalWords: wordData.length
    };
}

module.exports = { extractTextFromImage };
