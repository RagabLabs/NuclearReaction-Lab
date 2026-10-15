import {test,expect} from 'vitest';
import {outgoingAtAngle} from '../../src/physics/kinematics';
import {degrees,energyFrom} from '../../src/physics/units';
import {state,close} from './helpers';
test('06 equal-mass lab45 T=6000/23, independent closed form',()=>{const r=outgoingAtAngle(state([1000,1000,1000,1000],600),degrees(45));expect(r.solutions).toHaveLength(1);close(r.solutions[0].Tb,6000/23);});
test('06 both detector-energy branches have explicit range',()=>{const r=outgoingAtAngle(state(),degrees(0));expect(r.energyRange).not.toBeNull();close(r.energyRange![0],27/31);close(r.energyRange![1],3);});
test('06 forbidden detector angle is empty, not zero energy',()=>{const r=outgoingAtAngle(state(),degrees(90));expect(r.allowed).toBe(false);expect(r.energyRange).toBeNull();});
test('06 energy input units agree',()=>close(outgoingAtAngle(state([1,1,1,1],energyFrom(6000,'keV')),degrees(60)).solutions[0].Tb,6/13));
test('06 invalid detector angle rejected',()=>expect(()=>degrees(NaN)).toThrow());
