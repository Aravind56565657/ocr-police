const { Document, Packer, Paragraph, TextRun } = require('docx');
const puppeteer = require('puppeteer');
const { failure } = require('../utils/responseBuilder');

exports.downloadText = async (req, res) => {
    try {
        const { text, selected_format, selected_font = 'Arial' } = req.body;
        if (!text) return res.status(400).json(failure('Text content is required'));
        
        const timestamp = Date.now();
        const filename = `download_${timestamp}.${selected_format}`;
        const safeText = text || "";
        
        if (selected_format === 'txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.write(Buffer.from('\uFEFF', 'utf-8')); 
            return res.send(`Font: ${selected_font}\n\n${safeText}`);
        } 
        else if (selected_format === 'pdf') {
            let browser;
            try {
                browser = await puppeteer.launch({
                    headless: "new",
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                
                const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <style>
                  body {
                    font-family: '${selected_font}', 'Noto Sans', 'Noto Sans Telugu', 'Noto Sans Devanagari', 'Noto Sans Tamil', Arial;
                    white-space: pre-wrap;
                    font-size: 14px;
                  }
                </style>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&family=Noto+Sans+Telugu&family=Noto+Sans+Tamil&family=Noto+Sans+Devanagari&display=swap" rel="stylesheet">
                </head>
                <body>
                ${safeText}
                </body>
                </html>
                `;

                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true
                });
                
                await browser.close();
                browser = null; 
                
                console.log("PDF size:", pdfBuffer.length);

                const finalBuffer = Buffer.from(pdfBuffer);

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Length': finalBuffer.length,
                    'Content-Disposition': `attachment; filename="${filename}"`
                });
                
                return res.end(finalBuffer);
            } catch (pdfErr) {
                if (browser) await browser.close();
                console.error("PDF generation error:", pdfErr);
                return res.status(500).send("Failed to generate PDF");
            }
        }
        else if (selected_format === 'docx') {
            let docxFont = selected_font;
            if (/[\u0C00-\u0C7F]/.test(safeText)) docxFont = 'Noto Sans Telugu';
            else if (/[\u0900-\u097F]/.test(safeText)) docxFont = 'Noto Sans Devanagari';
            else if (/[\u0B80-\u0BFF]/.test(safeText)) docxFont = 'Noto Sans Tamil';
            else if (/[^\x00-\x7F]/.test(safeText)) docxFont = 'Noto Sans';

            const paragraphs = safeText.split('\n').map(line => 
                new Paragraph({
                    children: [new TextRun({ text: line, font: docxFont })]
                })
            );
            
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs
                }]
            });
            const b64string = await Packer.toBase64String(doc);
            const buffer = Buffer.from(b64string, 'base64');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(buffer);
        } else {
            return res.status(400).json(failure('Unsupported format. Use txt, pdf, or docx.'));
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            return res.status(500).json(failure('Error generating download file', err.message));
        }
    }
};
