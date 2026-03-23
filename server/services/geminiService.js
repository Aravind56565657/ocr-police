const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EXTRACTION_PROMPT = (rawText) => `
You are an expert document analysis AI specialized in processing multilingual Indian police records.

Below is raw OCR-extracted text from a handwritten police document. The text may be in English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, or any other Indian language — or a mix of multiple languages.

Your task is to extract ALL relevant structured information from this text and return it as a STRICT JSON object.

=== RAW OCR TEXT START ===
${rawText}
=== RAW OCR TEXT END ===

Instructions:
1. Extract every identifiable piece of information from the text.
2. For each field, assign a confidence value from 0.0 (very uncertain) to 1.0 (completely certain).
3. If a field is not found in the text, set its value to null and confidence to 0.
4. Analyze the following document text and classify it into the most appropriate category. Do not restrict yourself to predefined labels. Return only a short, meaningful category name (1-3 words).
5. Generate a flat array of searchTags — all important keywords, names, numbers, and locations that should be indexed for search.
6. The response MUST be valid JSON only — no markdown, no explanation, no preamble.

Return this exact JSON structure:
{
  "documentType": "string",
  "officerDetails": {
    "name": { "value": "string or null", "confidence": 0.0 },
    "badgeNumber": { "value": "string or null", "confidence": 0.0 },
    "rank": { "value": "string or null", "confidence": 0.0 },
    "department": { "value": "string or null", "confidence": 0.0 },
    "station": { "value": "string or null", "confidence": 0.0 },
    "district": { "value": "string or null", "confidence": 0.0 },
    "state": { "value": "string or null", "confidence": 0.0 },
    "contactNumber": { "value": "string or null", "confidence": 0.0 },
    "joiningDate": { "value": "YYYY-MM-DD or null", "confidence": 0.0 }
  },
  "caseDetails": {
    "caseNumber": { "value": "string or null", "confidence": 0.0 },
    "caseType": { "value": "string or null", "confidence": 0.0 },
    "incidentDate": { "value": "YYYY-MM-DD or null", "confidence": 0.0 },
    "incidentLocation": { "value": "string or null", "confidence": 0.0 },
    "description": { "value": "string or null", "confidence": 0.0 },
    "status": { "value": "Open|Closed|Under Investigation|Pending|Unknown", "confidence": 0.0 },
    "fir_number": { "value": "string or null", "confidence": 0.0 }
  },
  "searchTags": ["tag1", "tag2", "tag3"],
  "summary": "One sentence description of what this document is about"
}
`;

async function extractStructuredData(rawText) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(EXTRACTION_PROMPT(rawText));
        const responseText = result.response.text();

        // Strip markdown fences if present
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Identify all low-confidence fields (below 0.6)
        const lowConfidenceFields = [];
        const checkConfidence = (obj, path = '') => {
            for (const key in obj) {
                const fullPath = path ? `${path}.${key}` : key;
                if (obj[key] && typeof obj[key] === 'object' && 'confidence' in obj[key]) {
                    if (obj[key].confidence < 0.6 && obj[key].value !== null) {
                        lowConfidenceFields.push({ field: fullPath, confidence: obj[key].confidence });
                    }
                } else if (typeof obj[key] === 'object') {
                    checkConfidence(obj[key], fullPath);
                }
            }
        };
        checkConfidence(parsed);

        return {
            extracted: parsed,
            lowConfidenceFields,
            requiresManualReview: lowConfidenceFields.length > 2
        };
    } catch (err) {
        throw new Error(`Gemini extraction failed: ${err.message}`);
    }
}

async function translateText(text, targetLanguage) {
    if (!text) return '';
    try {
        const prompt = `Translate the following text into ${targetLanguage}.
Preserve the original meaning and structure.
Return only translated text. No explanations.

Text:
${text}`;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        throw new Error(`Gemini translation failed: ${err.message}`);
    }
}

module.exports = { extractStructuredData, translateText };
