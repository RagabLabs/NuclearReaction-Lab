import {test,expect} from 'vitest';
import {writeFileSync,mkdirSync} from 'node:fs';
import reference from '../independent-reference.json';
import {mass,energy,degrees,inDegrees,vec} from '../../src/physics/units';
import {threshold} from '../../src/physics/thresholds';
import {centerOfMass} from '../../src/physics/relativity';
import {recoil} from '../../src/physics/recoil';
import {fromCM,atLabAngle} from '../../src/physics/kinematics';
import {transformAngle} from '../../src/physics/angles';
import {momentumTransfer,momentumBalance} from '../../src/physics/momentum';
import {transformCrossSection} from '../../src/physics/crossSections';
import {coulomb} from '../../src/physics/coulomb';
import {state} from './helpers';
const q=reference.syntheticBenchmarks;
const rows=[
 {id:'01',name:'Reaction threshold',formula:'max(0, (Mf−Mi)(Mf+Mi)/(2mA))',source:'PDG2026; exact synthetic masses; Decimal80 oracle',case:'m=2,3→3,3',expected:Number(q.calculation01.expected.threshold_mev),actual:threshold(mass(2),mass(3),[mass(3),mass(3)]).exact,unit:'MeV',limit:'Stationary target; no dynamics or Coulomb-accessibility claim.'},
 {id:'02',name:'CM energy',formula:'KCM=√s−ma−mA (factorized implementation)',source:'PDG2026; exact synthetic masses; Decimal80 oracle',case:'m=1,1; projectile T=1; target stationary',expected:Number(q.calculation02.expected.cm_kinetic_available),actual:centerOfMass(mass(1),mass(1),energy(1)).kinetic,unit:'MeV',limit:'Massive on-shell incident particles; moving target supported.'},
 {id:'03',name:'Nuclear recoil',formula:'Tf=pf²/(√(m²+pf²)+m)',source:'PDG2026; exact 3-4-5 identity',case:'m=4, initial p=0, transfer=(3,0,0)',expected:1,actual:recoil(mass(4),vec(3,0,0)).finalKinetic,unit:'MeV',limit:'Specified frame and initial momentum; no impulse dynamics.'},
 {id:'04',name:'Two-body kinematics',formula:'p*=√λ(s,mb²,mB²)/(2√s), Lorentz boost',source:'PDG2026; exact equal-mass symmetry; Decimal80',case:'all masses=1000; T=600; CM90°',expected:300,actual:fromCM(state([1000,1000,1000,1000],600),degrees(90)).Tb,unit:'MeV',limit:'Stationary target; labelled two-body products; fixed masses.'},
 {id:'05',name:'Angle transformation',formula:'atan2(p* sinθ*, γ(p* cosθ*+βEb*))',source:'PDG2026 Lorentz boost; independent exact inverse-root algebra',case:'m=4,1 elastic; T=3; lab asin(1/8), high branch',expected:Number(q.calculation05.expected_branches[0].theta_cm_deg),actual:inDegrees(transformAngle(state(),degrees(Number(q.calculation05.input.theta_lab_deg)),'lab').solutions[0].thetaCM!),unit:'deg',limit:'Multiple preimages retained; zero-momentum directions undefined.'},
 {id:'06',name:'Outgoing detector energy',formula:'Etot√(p²+mb²)−Pp cosθ=(s+mb²−mB²)/2',source:'PDG2026; independent equal-mass lab45 closed form',case:'all masses=1000; T=600; lab45°',expected:6000/23,actual:atLabAngle(state([1000,1000,1000,1000],600),degrees(45))[0].Tb,unit:'MeV',limit:'Lab detector angle; all directed physical roots, no detector response.'},
 {id:'07',name:'Momentum transfer',formula:'q=pi−pf; t=(Ei−Ef)²−q²',source:'PDG2026 four-vectors; independent vector geometry',case:'pi=(0,0,5), pf=(4,0,3), Ei=Ef=10',expected:Math.sqrt(20),actual:momentumTransfer(vec(0,0,5),vec(4,0,3),'lab',energy(10),energy(10)).magnitude,unit:'MeV/c',limit:'Same frame; t requires total energies, not just kinetic energies.'},
 {id:'08',name:'Momentum balance',formula:'Δp=Σpin−Σpout; scale-aware floating-point tolerance',source:'Independent vector sums; exact deliberate perturbation',case:'(2,4,2) initial vs (2+1e−8,4,2) final',expected:1e-8,actual:momentumBalance([vec(3,4,0),vec(-1,0,2)],[vec(1,3,2),vec(1+1e-8,1,0)]).magnitude,unit:'MeV/c',limit:'Floating-point closure; not an experimental confidence test.'},
 {id:'09',name:'Differential cross-section transformation',formula:'J=D³/(γ|1+r cosθ*|); flab=ΣfCM,k Jk',source:'PDG2026 boost, independent derivative; supplied synthetic densities',case:'m=4,1 elastic; T=3; lab0; supplied values1,1 mb/sr',expected:1186/31,actual:transformCrossSection(state(),degrees(0),[1,1]).totalLab!,unit:'mb/sr',limit:'Supplied angular densities only; branch-resolved inverse; singular folds withheld.'},
 {id:'10',name:'Coulomb barrier & penetration model',formula:'VC=Z1 Z2 α ħc/R; PG=exp(−2πη)',source:'CODATA2022 α; exact SI h,c,e; IAEA LEXFOR; synthetic R,m',case:'Z1=Z2=1, m1=m2=1000, Erel=.01, R=5fm',expected:Number(q.calculation10.expected.barrier_mev),actual:coulomb(1,1,5,energy(.01),mass(1000),mass(1000)).barrier,unit:'MeV',limit:'Classical contact barrier; nonrelativistic l=0 model, not reaction probability.'},
].map(r=>({...r,absoluteDifference:Math.abs(r.actual-r.expected),relativeDifference:r.expected===0?0:Math.abs((r.actual-r.expected)/r.expected),acceptedDifference:2e-11+2e-9*Math.abs(r.expected),passed:Math.abs(r.actual-r.expected)<=2e-11+2e-9*Math.abs(r.expected)}));
test.each(rows)('reference comparison $id $name',row=>expect(row.passed).toBe(true));
test('write auditable ten-calculation numerical comparison',()=>{mkdirSync('reports',{recursive:true});writeFileSync('reports/calculation-validation.json',JSON.stringify({generatedAt:new Date().toISOString(),model:'Nominal-input arithmetic validation; synthetic examples are explicitly nonexperimental.',rows},null,2)+'\n');expect(rows).toHaveLength(10);});
