const PDFDocument = require('pdfkit');
const fs = require('fs');

async function test() {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('test_telugu.pdf'));
    
    try {
        doc.registerFont('Telugu', 'fonts/NotoSansTelugu-Regular.ttf');
        doc.font('Telugu').text('హలో వరల్డ్', { features: ['-mark', '-mkmk'] }); // Testing feature toggle
        console.log('Success with toggled features!');
    } catch (e) {
        console.error('PDFKit crashed:', e.message);
    }
    
    doc.end();
}
test();
