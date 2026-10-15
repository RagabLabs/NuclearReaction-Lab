"""Import a small, auditable factual subset; never infer a bare nucleus from an atom.
Run from repository root: python3 scripts/import_data.py [--refresh]
The exact upstream downloads stay in .cache (not redistributed).
"""
import argparse, datetime, hashlib, json, pathlib, re, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
URLS = {
    'codata-2022.txt': 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
    'mass_1.mas20': 'https://amdc.impcas.ac.cn/masstables/Ame2020/mass_1.mas20',
}
PINNED_SHA256={'codata-2022.txt':'77fb90e66c40db3e6eb16630bc9c88e4c7c8beddbe5e71be406f2f26e3f67e67','mass_1.mas20':'e8599c6d7f724fac91934e59f1b9de8fb8f63e820f4b39456b790665ed2a3307'}
def parse_number(s):
    return float(s.replace(' ', '').replace('...', ''))
def main():
    args = argparse.ArgumentParser(); args.add_argument('--refresh', action='store_true'); opt=args.parse_args()
    cache=ROOT/'.cache'; cache.mkdir(exist_ok=True)
    date=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    manifests=[]
    for name,url in URLS.items():
        path=cache/name
        if opt.refresh or not path.exists():
            with urllib.request.urlopen(url, timeout=60) as resp: path.write_bytes(resp.read())
        if hashlib.sha256(path.read_bytes()).hexdigest()!=PINNED_SHA256[name]: raise ValueError('Upstream file changed; review edition and update pinned hash explicitly before import: '+name)
        manifests.append({'file':name,'url':url,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'retrievalDate':date})
    c={}
    for line in (cache/'codata-2022.txt').read_text().splitlines():
        cols=re.split(r'\s{2,}',line.strip())
        if len(cols)>=3:
            try: c[cols[0]]={'value':parse_number(cols[1]),'uncertainty':0 if cols[2]=='(exact)' else parse_number(cols[2]),'unit':cols[3] if len(cols)>3 else '', 'sourceValueText':cols[1], 'displayTruncated':'...' in cols[1], 'exactDefinition':cols[2]=='(exact)'}
            except ValueError: pass
    constants={k:c[k] for k in ['atomic mass constant energy equivalent in MeV','electron mass energy equivalent in MeV','fine-structure constant','speed of light in vacuum','reduced Planck constant times c in MeV fm','elementary charge','Planck constant']}
    records=[]
    for id,sym,name,z,a,key in [('p','p','Proton',1,1,'proton'),('n','n','Neutron',0,1,'neutron'),('d','d','Deuteron',1,2,'deuteron'),('t','t','Triton',1,3,'triton'),('h','³He','Helion',2,3,'helion'),('alpha','α','Alpha particle',2,4,'alpha particle')]:
        v=c[key+' mass energy equivalent in MeV']
        records.append({'id':id,'symbol':sym,'name':name,'Z':z,'A':a,'mass':v['value'],'massUnit':'MeV/c²','massUncertainty':v['uncertainty'],'massType':'bare-nucleus','source':'CODATA2022','sourceVersion':'2022 (published May 2024)','referenceUrl':URLS['codata-2022.txt'],'dataStatus':'evaluated','retrievalDate':date,'usableForKinematics':True,'notes':'Direct bare-particle rest mass; correlations not imported.'})
    selected={(1,1),(1,2),(1,3),(2,3),(2,4),(3,6),(3,7),(4,7),(6,12),(6,13),(7,14),(8,16)}
    for index,line in enumerate((cache/'mass_1.mas20').read_text().splitlines(),1):
        if len(line)<125: continue
        try: z=int(line[9:14]); a=int(line[14:19])
        except ValueError: continue
        if (z,a) not in selected: continue
        symbol=line[20:23].strip(); whole=int(line[106:109]); micro=line[110:123].strip(); unc=line[123:135].strip()
        if '#' in micro or '*' in micro: raise ValueError('Subset must contain evaluated, not extrapolated, masses')
        mass=whole+float(micro)*1e-6
        records.append({'id':f'{symbol}-{a}-atom','symbol':f'{a}{symbol}','name':f'Neutral {symbol}-{a} atom','Z':z,'A':a,'mass':mass,'massUnit':'u','massUncertainty':float(unc)*1e-6,'massType':'neutral-atom','source':'AME2020','sourceVersion':'AME2020 mass_1.mas20, 3 March 2021','referenceUrl':URLS['mass_1.mas20'],'dataStatus':'evaluated','retrievalDate':date,'usableForKinematics':False,'sourceLine':index,'originalRecord':line,'notes':'Catalog only. No verified isotope-specific total electron binding correction imported. Do not use as a bare-nucleus mass.'})
    if len(records)!=18: raise ValueError(f'Expected 18 curated records, got {len(records)}')
    data={'version':'AME2020-CODATA2022-subset1','retrievalDate':date,'constants':constants,'upstreamFiles':manifests,'records':records,'uncertaintyPolicy':'Individual standard uncertainties retained. No joint uncertainty propagated without covariance. Atomic records are explicitly disabled for bare-nucleus kinematics.'}
    out=ROOT/'src/data/nuclear-data.json'; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'records':len(records),'usableBareNuclei':6,'atomicCatalogOnly':12,'output':str(out)}))
if __name__=='__main__': main()
