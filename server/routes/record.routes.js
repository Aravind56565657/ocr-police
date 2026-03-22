const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { validateFieldUpdate } = require('../middleware/validateRequest');

router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);
router.patch('/:id/field', validateFieldUpdate, recordController.updateField);
router.patch('/:id/review', recordController.markReviewed);
router.delete('/:id', recordController.deleteRecord);
router.get('/:id/raw-text', recordController.getRawText);

module.exports = router;
