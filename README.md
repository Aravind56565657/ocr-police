# 🚔 AI-Enabled OCR Police System

A production-grade, full-stack AI-powered OCR web application for digitizing multilingual handwritten police records.

## Features
- **Intelligent Processing**: Upload handwritten documents (FIRs, Case Reports) and automatically extract data using Google Cloud Vision and Gemini AI.
- **Multilingual Support**: Supports English, Hindi, Telugu, Tamil, Marathi, and other regional languages.
- **Smart Data Structuring**: Extracts Officer Details (Name, Badge No, Department) and Case Details (Case No, Incident Date, Status).
- **Confidence Scoring**: Flags low-confidence extractions and highlights records requiring manual review.
- **Inline Editing**: Fix any OCR errors with a seamless, Notion-like inline editing interface.
- **Global Search**: Search across millions of records using MongoDB Atlas Search (or Regex fallback).
- **Premium UI**: Navy-blue and dark slate themed aesthetic built with Tailwind CSS.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Lucide React
- **Backend**: Node.js, Express, Mongoose, Multer, `pdf2pic`
- **Database**: MongoDB Atlas (with Atlas Vector/Text Search)
- **AI/ML**: Google Cloud Vision API (OCR), Google Gemini AI API (Structuring)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (for database and search indexing)
- Google Cloud Console Account (for Vision API keys)
- Google AI Studio Account (for Gemini API keys)

### 1. Client Setup
```bash
cd client
npm install
```
Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Server Setup
```bash
cd server
npm install
```
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GOOGLE_CLOUD_API_KEY=your_google_cloud_vision_key
GEMINI_API_KEY=your_gemini_api_key
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
NODE_ENV=development
```

### 3. Database Configuration
You must configure an Atlas Search index on your `records` collection using the schema definition provided in `server/models/Record.js`. The search controller implements a regex fallback, but Atlas Search is highly recommended for production exact-matching on text.

### 4. Running the Application
Open two terminal windows:

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.
