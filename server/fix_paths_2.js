const mongoose = require('mongoose');
const Record = require('./models/Record');
require('dotenv').config();

async function fixPaths() {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await Record.find({});
    for (let r of records) {
        if (r.originalFileUrl && r.originalFileUrl.includes('server')) {
            // Convert 'C:/Users/aravi/ocr-police-system/server/uploads/filname.ext' to 'uploads/filename.ext'
            const parts = r.originalFileUrl.split('/');
            const uploadIndex = parts.indexOf('uploads');
            if (uploadIndex !== -1) {
                r.originalFileUrl = parts.slice(uploadIndex).join('/');
                await r.save();
            }
        }
    }
    console.log(`Fixed paths for ${records.length} records.`);
    process.exit(0);
}

fixPaths().catch(console.error);
