import {test,expect} from 'vitest';
import {analyze} from '../../src/physics/validation';
import {particle} from '../../src/physics/particles';
import {energy} from '../../src/physics/units';
import {snapshot,csvText,reportLines,makePDF} from '../../src/reports';
test('CSV and PDF report lines preserve same engine result snapshot and source masses',()=>{const r={a:particle('d'),A:particle('t'),b:particle('n'),B:particle('alpha'),excitation:0};const a=analyze(r,energy(.1),90,'cm'),value=a.solutions[0].Tb;
 const s=snapshot('Analysis',r,{beamMeV:.1,frame:'cm'},[{label:'Outgoing kinetic energy',value,unit:'MeV'}],['Same computed solution'],'p^*',a.warnings);
 const csv=csvText(s),lines=reportLines(s);expect(csv).toContain(String(value));expect(csv).toContain(String(r.a.mass));expect(lines.join('\n')).toContain('Outgoing kinetic energy: 14.0843 MeV');expect(lines.join('\n')).toContain('CODATA2022');const pdf=makePDF(s);expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);expect(pdf.output()).toContain('%PDF-');});
test('CSV escapes formula punctuation and preserves undefined, never NaN',()=>{const r={a:particle('d'),A:particle('t'),b:particle('n'),B:particle('alpha'),excitation:0};const s=snapshot('Test',r,{},[{label:'Undefined angle',value:null,unit:'deg'}],['a, b; "quoted"'],'x',[]);expect(csvText(s)).toContain('"undefined"');expect(csvText(s)).toContain('""quoted""');expect(csvText(s)).not.toMatch(/NaN|Infinity/);});
