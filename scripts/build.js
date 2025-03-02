const fs = require('fs');

const source = fs.readFileSync('src/index.html', 'utf8');
const destination = 'index.html';


const minify = (source) => {
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
    
    fs.writeFileSync(destination, minified);
};

minify(source);