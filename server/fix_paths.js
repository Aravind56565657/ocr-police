const mongoose = require('mongoose');
const Record = require('./models/Record');
require('dotenv').config();

async function fixPaths() {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await Record.find({});
    for (let r of records) {
        if (r.originalFileUrl && r.originalFileUrl.includes('\\')) {
            r.originalFileUrl = r.originalFileUrl.replace(/\\/g, '/');
            await r.save();
        }
    }
    console.log(`Fixed paths for ${records.length} records.`);
    process.exit(0);
}

fixPaths().catch(console.error);
