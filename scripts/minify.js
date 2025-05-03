const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'font/eot',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    '.bz2': 'application/x-bzip2',
    '.xz': 'application/x-xz',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'audio/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.opus': 'audio/opus',
    '.webmanifest': 'application/manifest+json',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.xhtml': 'application/xhtml+xml',
    '.svgz': 'image/svg+xml',
};

const filePath = path.resolve(__dirname, '../src/index.html');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    //-----------------------
    // Base64 encode all href and src attributes
    const regex = /(?<=\b(?:href|src)\s*=\s*['"])([^'"]+)(?=['"])/g;
    const matches = data.match(regex);
    if (matches) {
        const validExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|eot|webmanifest)$/i;
        const validUrls = matches.filter((url) => {
            return validExtensions.test(url);
        });
        validUrls.forEach((url) => {
            const absoluteUrl = url.startsWith('http') ? url : path.resolve(__dirname, '../src', url);
            const fileData = fs.readFileSync(absoluteUrl);
            const fileExtension = path.extname(absoluteUrl);
            const mimeType = MIME_TYPES[fileExtension] || 'application/octet-stream';
            const base64Data = Buffer.from(fileData).toString('base64');
            const base64Url = `data:${mimeType};base64,${base64Data}`;
            data = data.replace(url, base64Url);
        });
    }

    //-----------------------
    // Minify HTML

    // Spaces and new lines between tags
    data = data.replace(/>\s+</g, '><');


    //-----------------------
    // Writing the modified data to a new file
    const newFilePath = path.resolve(__dirname, '../index.html');
    fs.writeFile(newFilePath, data, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('File written successfully');
    });
});