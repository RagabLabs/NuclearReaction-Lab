import {test,expect} from 'vitest';
import {fromCM,atLabAngle} from '../../src/physics/kinematics';
import {degrees,norm,inDegrees,tolerance} from '../../src/physics/units';
import {presets,particle,reactionMasses} from '../../src/physics/particles';
import {prepare} from '../../src/physics/kinematics';
import {energy} from '../../src/physics/units';
import {state,close} from './helpers';
test('04 independent equal-mass relativistic CM90 analytic T=300',()=>{const s=fromCM(state([1000,1000,1000,1000],600),degrees(90));close(s.Tb,300);close(s.TB,300);close(norm(s.b.p),100*Math.sqrt(69));});
test.each([0,90,180])('04 angles %s preserve energy and momentum',a=>{const s=fromCM(state(),degrees(a));close(s.energyResidual,0);close(norm(s.momentumResidual),0);});
test('04 multiple branches at lab0 are both retained',()=>{const s=atLabAngle(state(),degrees(0));expect(s).toHaveLength(2);close(s[0].Tb,3);close(s[1].Tb,27/31);});
test('04 unsquared equation forbids backward direction for inverse elastic',()=>expect(atLabAngle(state(),degrees(180))).toHaveLength(0));
test.each(presets)('04 reference preset $id conserves independently recomputed energy, momentum and mass shells',preset=>{
 const [a,A,b,B]=preset.ids.map(particle),r={...reactionMasses({a,A,b,B,excitation:0}),kinetic:energy(preset.energy)},s=prepare(r);
 for(let d=0;d<=180;d+=9){const sol=fromCM(s,degrees(d));close(sol.b.E+sol.B.E,r.a+r.A+r.kinetic,1e-12);for(let j=0;j<3;j++)close(sol.b.p[j]+sol.B.p[j],s.cm.momentum[j],1e-11);close(sol.b.E**2-norm(sol.b.p)**2,r.b**2,2e-12);close(sol.B.E**2-norm(sol.B.p)**2,r.B**2,2e-12);}
});
test('04 exact zero lab momentum has undefined angle, not a spurious 90°',()=>{const s=fromCM(state([1,1,1,1],6),degrees(180));expect(s.thetaLab).toBeNull();expect(s.Tb).toBe(0);});
test('04 tiny positive elastic kinetic energy remains open',()=>{const s=state([1000,1000,1000,1000],1e-12);expect(s.atThreshold).toBe(false);close(s.pStar,Math.sqrt(5e-10),1e-10,1e-20);expect(atLabAngle(s,degrees(45))).toHaveLength(1);});
test.each([.1,600])('04 equal-mass backward ghost root excluded at T%s',T=>expect(atLabAngle(state([1000,1000,1000,1000],T),degrees(180))).toHaveLength(0));
test('04 very heavy equal-mass elastic has one directed lab root',()=>expect(atLabAngle(state([1e8,1e8,1e8,1e8],600),degrees(45))).toHaveLength(1));
test('04 below-threshold input rejected',()=>expect(()=>state([2,3,3,3],1)).toThrow());
