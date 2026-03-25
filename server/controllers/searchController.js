const Record = require('../models/Record');
const { success, failure } = require('../utils/responseBuilder');

exports.searchRecords = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) return res.json(success('Empty query', { results: [], total: 0 }));

        const skip = (page - 1) * limit;

        // We will use Strategy B (Regex Fallback) as Atlas Search requires manual index setting via UI, 
        // which makes local testing without the UI setup impossible.
        // The instructions say "Auto-detect which to use based on MONGODB_URI" 
        // but regex works flawlessly out of the box. I'll implement exactly as requested.

        let results = [];
        let total = 0;

        const uri = process.env.MONGODB_URI || '';
        const isAtlas = uri.includes('atlas') || uri.includes('mongodb+srv');

        if (isAtlas) {
            try {
                // We perform the Atlas Search aggregation if an Atlas cluster is detected.
                // Note: user must create a search index named 'default' in Atlas to use this.
                results = await Record.aggregate([
                    {
                        $search: {
                            index: 'default', // Name of index created in Atlas UI
                            text: {
                                query: q,
                                path: ['rawExtractedText', 'searchTags', 'officerDetails.name.value', 'caseDetails.caseNumber.value'],
                                fuzzy: { maxEdits: 1 }
                            }
                        }
                    },
                    { $addFields: { score: { $meta: 'searchScore' } } },
                    { $sort: { score: -1 } },
                    { $skip: skip },
                    { $limit: Number(limit) }
                ]);
                total = results.length; // Approximate without extra count aggregation
            } catch (e) {
                console.warn("Atlas search failed (index might not exist yet), falling back to regex", e.message);
            }
        }

        if (results.length === 0) {
            const regex = new RegExp(q, 'i');
            const query = {
                isDeleted: { $ne: true },
                $or: [
                    { rawExtractedText: regex },
                    { searchTags: regex },
                    { 'officerDetails.name.value': regex },
                    { 'caseDetails.caseNumber.value': regex },
                    { 'caseDetails.fir_number.value': regex },
                    { 'officerDetails.badgeNumber.value': regex }
                ]
            };

            results = await Record.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
            total = await Record.countDocuments(query);
        }

        return res.json(success('Search successful', { results, total, query: q }));
    } catch (err) {
        return res.status(500).json(failure('Search failed', err));
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json(success('Suggestions', { suggestions: [] }));

        const regex = new RegExp(q, 'i');

        // We only suggest officer names or case numbers
        const records = await Record.find({
            isDeleted: { $ne: true },
            $or: [
                { 'officerDetails.name.value': regex },
                { 'caseDetails.caseNumber.value': regex }
            ]
        }).limit(8).select('officerDetails.name.value caseDetails.caseNumber.value -_id');

        const suggestions = new Set();
        records.forEach(r => {
            const name = r.officerDetails?.name?.value;
            const caseNum = r.caseDetails?.caseNumber?.value;
            if (name && regex.test(name)) suggestions.add(name);
            if (caseNum && regex.test(caseNum)) suggestions.add(caseNum);
        });

        return res.json(success('Suggestions loaded', { suggestions: Array.from(suggestions) }));
    } catch (err) {
        return res.status(500).json(failure('Error getting suggestions', err));
    }
};
