const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

router.post('/document', upload.single('document'), uploadController.uploadAndProcess);
router.get('/status/:uploadId', uploadController.getStatus);
router.post('/:id/reprocess', uploadController.reprocessDocument);

module.exports = router;
