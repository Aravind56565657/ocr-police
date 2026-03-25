# OCR Police System Workflow

The OCR Police System is a highly interactive, AI-powered platform for extracting, processing, and managing textual information from images and documents. Below is a detailed breakdown of the technical and functional workflow.

---

## 1. Document Upload & Pre-processing
**User Action:** Drag and drop an image (JPG, PNG) or PDF into the Upload Zone.

- **Frontend:** The `UploadZone` component handles file selection and provides a real-time progress bar.
- **Backend:** 
    - Files are stored temporarily in the `server/uploads` directory.
    - If the file is a **PDF**, the system automatically converts the first page into a high-resolution image using `pdf-poppler` or `canvas` for OCR processing.

## 2. OCR Execution (Google Vision API)
Once the file is uploaded, the backend initiates the **Optical Character Recognition (OCR)** phase.

- **Vision Service:** The application sends the document to **Google Cloud Vision API**.
- **Raw Text Extraction:** Google Vision returns every detected word, its coordinates (bounding box), and the overall layout.
- **Data Persistence:** The raw text and document metadata are saved to **MongoDB** with an "In Progress" status.

## 3. Intelligent Analysis (Gemini AI)
After raw text is recovered, the system uses **Google Gemini 1.5 Flash** to add "brains" to the data.

- **Entity Extraction:** Gemini analyzes the unstructured text to find key fields like Names, Dates, IDs, and Locations.
- **Language Detection:** The system automatically detects the original language of the document (e.g., Hindi, Telugu, Marathi).
- **Confidence Scoring:** Gemini provides a confidence score for the extraction accuracy.

## 4. Interactive Record View
Users can view and interact with the processed results in the **Record View** page.

- **Dual-Pane Interface:**
    - **Left Panel (Source):** Displays the original document/image with zooming and scaling controls via `OCRViewer`.
    - **Right Panel (Analysis):** Displays the extracted text and AI-structured data.
- **Screen-Fit Layout:** The UI is designed to fit the viewport perfectly, with independent scrollbars for both the document and the text analysis.

## 5. Post-Processing Features
The system provides several interactive tools to refine the data:

- **Manual Editing:** If the AI makes a minor mistake, users can toggle "Edit Mode" to manually correct the extracted raw text.
- **Instant Translation:** Powered by Gemini, users can translate the extracted text into English or other context-aware languages.
- **Report Generation:** Users can download a formatted document (DOCX) containing both the original extracted text and the translated version.
- **Reprocessing:** If the OCR result is unsatisfactory, a single-click "Reprocess" button triggers the pipeline again.

---

## Technical Stack Summary
- **Frontend:** React + Vite, Tailwind CSS (Glassmorphism UI), Lucide Icons.
- **Backend:** Node.js, Express.
- **Database:** MongoDB (Mongoose).
- **AI/ML:** Google Cloud Vision (OCR), Google Gemini 1.5 (Extraction & Translation).
