const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

router.post('/document', upload.single('document'), uploadController.uploadAndProcess);
router.get('/status/:uploadId', uploadController.getStatus);

module.exports = router;
