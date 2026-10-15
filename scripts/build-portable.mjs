import {build} from 'vite';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';
// A separate bundle without chunks produces a genuinely offline, double-clickable HTML.
await build({configFile:false,base:'./',build:{outDir:'dist-portable',assetsInlineLimit:10000000,cssCodeSplit:false,rollupOptions:{output:{inlineDynamicImports:true}},chunkSizeWarningLimit:3000}});
const dir='dist-portable',html=await readFile(path.join(dir,'index.html'),'utf8');
let result=html;
const js=html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
if(!js)throw new Error('Portable bundle script missing');
const code=await readFile(path.join(dir,js[1]),'utf8');
result=result.replace(js[0],()=>`<script type="module">${code.replaceAll('</script','<\\/script')}</script>`);
for(const link of html.matchAll(/<link[^>]*href="([^"]+\.css)"[^>]*>/g)){const css=await readFile(path.join(dir,link[1]),'utf8');result=result.replace(link[0],`<style>${css}</style>`);}
result=result.replace(/<link[^>]*rel="modulepreload"[^>]*>/g,'');
await writeFile(path.join(dir,'NuclearReaction-Lab.html'),result);
console.log(`Portable standalone HTML: ${Buffer.byteLength(result)} bytes`);
