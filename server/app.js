const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers (disabled strict CSP/CORP to allow local Vite cross-origin media embeds)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xFrameOptions: false
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// CORS - Allow all origins in development, specific in production
const origin = process.env.NODE_ENV === 'production'
    ? true // Allow any origin in production or set specifically
    : 'http://localhost:5173';

app.use(cors({
    origin: origin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true
}));

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/records', require('./routes/record.routes'));
app.use('/api/search', require('./routes/search.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
