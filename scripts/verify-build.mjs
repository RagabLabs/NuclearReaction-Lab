import fs from 'node:fs';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
assert(fs.existsSync('dist/index.html'));assert(fs.existsSync('dist-portable/NuclearReaction-Lab.html'));
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('/NuclearReaction-Lab/assets/'));
const portable=fs.readFileSync('dist-portable/NuclearReaction-Lab.html','utf8'),document=new JSDOM(portable).window.document;assert.equal(document.querySelectorAll('script[src]').length,0);assert.equal(document.querySelectorAll('link[rel="stylesheet"]').length,0);assert.equal(document.querySelectorAll('script[type="module"]').length,1);assert(portable.includes('Nuclear Reaction Lab'));console.log('PASS: GitHub Pages base path and standalone bundle DOM structural checks');
