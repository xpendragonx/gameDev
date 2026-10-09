// Bundles index.html + farm.js into one self-contained file: lemon-farm.html
// Usage: node build-single.js
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('farm.js', 'utf8');
const tag = /<script src="farm\.js[^"]*"><\/script>/;
if (!tag.test(html)) throw new Error('script tag for farm.js not found in index.html');
const out = html.replace(tag, () => `<script>\n${js}\n</script>`);
fs.writeFileSync('lemon-farm.html', out);
console.log(`wrote lemon-farm.html (${out.length} bytes)`);
