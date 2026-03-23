const mongoose = require('mongoose');
const recordSchema = new mongoose.Schema({ uploadId: String });
const Record = mongoose.model('Record', recordSchema, 'records');

async function verifyDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ocr_police', { serverSelectionTimeoutMS: 3000 });
        console.log('MongoDB connection successful');
        await Record.create({ uploadId: 'test-' + Date.now() });
        console.log('Inserted test record successfully');
        process.exit(0);
    } catch (e) {
        console.error('MongoDB verification failed:', e.message);
        process.exit(1);
    }
}

verifyDB();
