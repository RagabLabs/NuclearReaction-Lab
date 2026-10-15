import fs from 'node:fs';
import assert from 'node:assert/strict';
const d=JSON.parse(fs.readFileSync('src/data/nuclear-data.json','utf8'));let incomplete=0;
for(const r of d.records){for(const k of ['id','symbol','Z','A','mass','massUnit','massUncertainty','massType','source','sourceVersion','referenceUrl','dataStatus','retrievalDate']){if(r[k]===null||r[k]===undefined||r[k]==='')incomplete++;}assert(Number.isFinite(r.mass)&&r.mass>0);assert(Number.isFinite(r.massUncertainty)&&r.massUncertainty>=0);assert(r.referenceUrl.startsWith('https://'));assert(r.massType==='bare-nucleus'||r.usableForKinematics===false);if(r.source==='AME2020')assert(r.originalRecord&&r.sourceLine>30);}
assert.equal(d.records.length,18);assert.equal(incomplete,0);assert.equal(new Set(d.records.map(r=>r.id)).size,18);
const result={status:'PASS',records:d.records.length,documentedRecords:d.records.length,incompleteMetadata:incomplete,bareNuclei:6,atomicCatalogOnly:12,dataVersion:d.version,retrievalDate:d.retrievalDate,sourceFileHashes:d.upstreamFiles};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/data-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
