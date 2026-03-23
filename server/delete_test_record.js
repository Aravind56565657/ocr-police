const mongoose = require('mongoose');
const recordSchema = new mongoose.Schema({ _id: mongoose.Schema.Types.ObjectId });
const Record = mongoose.model('Record', recordSchema, 'records');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ocr_police', { serverSelectionTimeoutMS: 3000 });
        const res = await Record.deleteOne({ _id: '69c0b9bac6d00648c7bf73bc' });
        console.log('Deleted record:', res.deletedCount);
        // Also delete any other invalid records that don't have fileType
        const res2 = await Record.deleteMany({ fileType: null });
        console.log('Deleted null fileType records:', res2.deletedCount);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
