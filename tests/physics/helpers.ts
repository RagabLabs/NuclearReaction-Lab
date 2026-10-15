import {expect} from 'vitest';
import {mass,energy} from '../../src/physics/units';
import {prepare} from '../../src/physics/kinematics';
export const close=(actual:number,expected:number,relative=2e-10,absolute=2e-11)=>expect(Math.abs(actual-expected)).toBeLessThanOrEqual(absolute+relative*Math.abs(expected));
export const state=(ms:number[]=[4,1,4,1],T=3)=>prepare({a:mass(ms[0]),A:mass(ms[1]),b:mass(ms[2]),B:mass(ms[3]),kinetic:energy(T)});
