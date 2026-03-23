const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = {
    'NotoSans-Regular.ttf': 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
    'NotoSansTelugu-Regular.ttf': 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf',
    'NotoSansDevanagari-Regular.ttf': 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf',
    'NotoSansTamil-Regular.ttf': 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf'
};

const dir = path.join(__dirname, 'fonts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => { file.close(resolve); });
        }).on('error', (err) => { fs.unlink(dest, () => reject(err)); });
    });
}

(async () => {
    for (const [name, url] of Object.entries(fonts)) {
        console.log(`Downloading ${name}...`);
        try {
            await downloadFile(url, path.join(dir, name));
            console.log(`Successfully downloaded ${name}.`);
        } catch (e) {
            console.error(`Error downloading ${name}:`, e.message);
        }
    }
})();
