const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { sanitizeSearch } = require('../middleware/validateRequest');

router.get('/', sanitizeSearch, searchController.searchRecords);
router.get('/suggest', sanitizeSearch, searchController.getSuggestions);

module.exports = router;
