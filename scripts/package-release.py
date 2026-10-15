"""Package verified source and builds; never include credentials, caches or screenshots."""
from pathlib import Path
import json,shutil,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'deliverables'
OMIT={'node_modules','.cache','.git','.openai','test-results','playwright-report','__pycache__'}
def main():
 stats=json.loads((ROOT/'reports/release-summary.json').read_text());assert stats['totalFailed']==0 and stats['totalExecuted']==stats['totalPassed']
 assert (ROOT/'dist-portable/NuclearReaction-Lab.html').is_file()
 for name in ['SCIENTIFIC_METHODS','REACTION_KINEMATICS','DATA_SOURCES','SCIENTIFIC_VALIDATION','NUMERICAL_PRECISION','UNCERTAINTY_POLICY','CALCULATION_UNIQUENESS','TEST_REPORT','KNOWN_LIMITATIONS']:assert (ROOT/f'docs/{name}.md').is_file()
 # Preserve licensing for redistributed modules and embedded equation fonts.
 dest=ROOT/'licenses';dest.mkdir(exist_ok=True)
 packages=[]
 for p in (ROOT/'node_modules').iterdir():
  if p.name.startswith('@') and p.is_dir():packages.extend(x for x in p.iterdir() if x.is_dir())
  elif p.is_dir() and not p.name.startswith('.'):packages.append(p)
 for p in packages:
  for src in list(p.glob('LICENSE*'))+list(p.glob('LICENCE*'))+list(p.glob('NOTICE*')):
   if src.is_file():
    label=p.name if not p.parent.name.startswith('@') else p.parent.name[1:]+'-'+p.name
    shutil.copy2(src,dest/(label+'-'+src.name))
 # KaTeX fonts have additional font-specific copyright/licensing text.
 for src in (ROOT/'node_modules/katex').rglob('*'):
  if src.is_file() and ('LICENSE' in src.name.upper() or 'OFL' in src.name.upper()) and src.parent!=ROOT/'node_modules/katex':shutil.copy2(src,dest/('katex-'+str(src.relative_to(ROOT/'node_modules/katex')).replace('/','-')))
 OUT.mkdir(exist_ok=True)
 full=OUT/'NuclearReaction-Lab-v1.0.0-source.zip';build=OUT/'NuclearReaction-Lab-v1.0.0-build.zip';standalone=OUT/'NuclearReaction-Lab-v1.0.0.html';pdf=OUT/'NuclearReaction-Lab-Scientific-Verification-v1.0.0.pdf'
 files=[p for p in sorted(ROOT.rglob('*')) if p.is_file() and not any(x in OMIT for x in p.relative_to(ROOT).parts)]
 with zipfile.ZipFile(full,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in files:z.write(p,'NuclearReaction-Lab/'+str(p.relative_to(ROOT)))
 with zipfile.ZipFile(build,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for directory in ['dist','dist-portable','licenses']:
   for p in sorted((ROOT/directory).rglob('*')):
    if p.is_file():z.write(p,str(p.relative_to(ROOT)))
  z.write(ROOT/'README.md','README.md');z.write(ROOT/'LICENSE','LICENSE');z.write(ROOT/'THIRD_PARTY_NOTICES.md','THIRD_PARTY_NOTICES.md')
 shutil.copy2(ROOT/'dist-portable/NuclearReaction-Lab.html',standalone);shutil.copy2(ROOT/'reports/NuclearReaction-Lab-Scientific-Verification-v1.0.0.pdf',pdf)
 for p in [full,build]:
  with zipfile.ZipFile(p) as z:assert z.testzip() is None
 print(json.dumps({'sourceFilesIncludingBuilds':len(files),'artifacts':[{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [full,build,standalone,pdf]]},indent=2))
if __name__=='__main__':main()
