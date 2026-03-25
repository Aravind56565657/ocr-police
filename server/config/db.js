const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<user>')) {
            console.warn('[Warning] MONGODB_URI is not set or uses placeholder. Db connection skipped.');
            return;
        }
        const isAtlas = process.env.MONGODB_URI.includes('atlas') || process.env.MONGODB_URI.includes('mongodb+srv');

        // Disable command buffering so queries fail fast if the connection drops
        mongoose.set('bufferCommands', false);

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Optimized for Atlas
            retryWrites: true,
            autoIndex: process.env.NODE_ENV !== 'production'
        });

        console.log(`MongoDB Connected (${isAtlas ? 'Atlas cluster' : 'Local instance'})`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
