const fs = require('fs');
const https = require('https');
const path = require('path');

const source = fs.readFileSync('src/index.html', 'utf8');
const destination = 'index.html';


const minify = async (source) => {
    let minified = "";

    minified = source.trim().replace(/>\s+</g, '><');
    
    // remove spaces between attributes
    minified = minified.replace(/([a-zA-Z0-9\-]+=['"][a-zA-Z0-9\[\]()%.\s\-\/]+['"])\s*/g, '$1');
    
    // remove spaces between attributes and tags
    minified = minified.replace(/class="([^"]+)"/g, (match, classes) => {
        let css;
        //remove comments (// or /* */)
        classes = classes.replace(/\/\*[\s\S]*?\*\//g, '');
        classes = classes.replace(/\/\/.*/g, '');
        // remove spaces
        css = classes.replace(/\s+/g, ' ').trim();
        return `class="${css}"`;
    });

    // optimize text inside tags (text nodes)
    minified = minified.replace(/>\s+(\S)/g, '>$1');
    minified = minified.replace(/(\S)\s+</g, '$1<');

    // minify css
    minified = minified.replace(/<style>([a-zA-Z0-9:.>()!,{}@%/\[\];\-='"\s]+)<\/style>/g, (match, css) => {
        // remove comments
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        css = css.replace(/\/\/.*/g, '');
        // remove spaces
        css = css.replace(/\s+/g, ' ').trim();

        return `<style>${css}</style>`;
    });

    // minify js
    minified = minified.replace(/<script>([\S\s]+)<\/script>/g, (match, js) => {
        return `<script>${js.replace(/\s+/g, ' ').trim()}</script>`;
    });

    // transform images to base64
    const imgMatches = [...minified.matchAll(/<img[a-zA-Z0-9"'=\s]+src="([^"]+)"/g)];
    for (const match of imgMatches) {
        const [fullMatch, src] = match;
        let img = await getFileContent(src);
        let mime = src.split('.').pop();
        mime = mime === 'svg' ? 'svg+xml' : mime;
        const url = `data:image/${mime};base64,${img.toString('base64')}`;
        minified = minified.replace(fullMatch, `<img src="${url}"`);
    }

    // transforml scripts to base64
    const scriptMatches = [...minified.matchAll(/<script[a-zA-Z0-9"'=\s]+src="([^"]+)"/g)];
    for (const match of scriptMatches) {
        const [fullMatch, src] = match;
        let file = await getFileContent(src);
        const url = `data:application/javascript;base64,${file.toString('base64')}`;
        minified = minified.replace(fullMatch, `<script src="${url}"`);
    }
    
    fs.writeFileSync(destination, minified);
};

async function getFileContent(_path) {
    let file;
    try {
        const parsedPath = path.resolve(process.cwd(),_path);
        file = fs.readFileSync(parsedPath);
    }
    catch (e) {
        file = await new Promise((resolve, reject) => {
            https.get(_path, (response) => {
            let data = [];
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on('end', () => {
                resolve(Buffer.concat(data));
            });
            }).on('error', (err) => {
            reject(err);
            });
        });
    }
    finally {
        return file;
    }
}

minify(source)
    .then(() => {
        console.log('Minification successful');
    })
    .catch((error) => {
        console.error('Error during minification:', error);
    });