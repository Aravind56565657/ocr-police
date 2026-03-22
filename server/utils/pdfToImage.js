const { fromPath } = require('pdf2pic');
const path = require('path');
const fs = require('fs');

async function convertPdfToImages(pdfPath, uploadId) {
    const outputDir = path.join(__dirname, '..', 'uploads', uploadId);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const options = {
        density: 300,
        saveFilename: 'page',
        savePath: outputDir,
        format: 'png',
        width: 2048,
        height: 2048
    };

    const storeAsImage = fromPath(pdfPath, options);

    // Convert all pages. For pdf2pic, bulk(-1) converts all pages
    const results = await storeAsImage.bulk(-1, { responseType: 'image' });
    return results.map(res => res.path);
}

module.exports = { convertPdfToImages };
