// read file index.html
// we are not going to compress it
// we are going to minify it ourselves

const fs = require('fs');
const process = require('process');

const source = fs.readFileSync('src/index.html', 'utf8');
const destination = 'index.html';


const minify = (source) => {
    console.log('Minifying index.html');

    let minified = "";

    minified = source.trim().replace(/>\s+</g, '><');
    
    const tags = Array.from(minified.match(/<(?!\/)[a-zA-Z0-9"'=,\[\]{}()>\/%:.\-\s]+>+/g));

    // remove spaces between attributes
    minified = minified.replace(/([a-zA-Z0-9\-]+=['"][a-zA-Z0-9\[\]()%.\s\-\/]+['"])\s*/g, '$1');
    
    // remove spaces between attributes and tags
    minified = minified.replace(/class="([^"]+)"/g, (match, classes) => {
        return `class="${classes.replace(/\s+/g, ' ').trim()}"`;
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