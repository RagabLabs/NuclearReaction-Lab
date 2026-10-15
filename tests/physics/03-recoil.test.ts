import {test,expect} from 'vitest';
import {recoil} from '../../src/physics/recoil';
import {mass,vec,momentum} from '../../src/physics/units';
import {close} from './helpers';
test('03 exact 3-4-5 recoil: T=1, beta=.6, NR=1.125',()=>{const r=recoil(mass(4),vec(3,0,0));close(r.finalKinetic,1);close(r.beta,.6);close(r.nonrelativistic,1.125);});
test('03 moving target initial p is not discarded',()=>{const r=recoil(mass(4),vec(-3,4,0),vec(3,0,0));close(r.initialKinetic,1);close(r.finalKinetic,4*Math.sqrt(2)-4);close(r.energyChange,4*Math.sqrt(2)-5);});
test('03 recoil transfer can slow the nucleus',()=>{const r=recoil(mass(4),vec(-3,0,0),vec(3,0,0));close(r.finalKinetic,0);close(r.energyChange,-1);});
test('03 tiny recoil stable; no negative final kinetic',()=>close(recoil(mass(1e6),vec(1e-5,0,0)).finalKinetic,5e-17,1e-10,1e-26));
test('03 invalid mass and missing numeric transfer rejected',()=>{expect(()=>mass(0)).toThrow();expect(()=>vec(NaN,0,0)).toThrow();expect(()=>momentum(Infinity)).toThrow();});
