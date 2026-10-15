import {test,expect} from 'vitest';
import {momentumBalance} from '../../src/physics/momentum';
import {vec} from '../../src/physics/units';
import {close} from './helpers';
test('08 independent vector sums both (2,4,2)',()=>{const r=momentumBalance([vec(3,4,0),vec(-1,0,2)],[vec(1,3,2),vec(1,1,0)]);expect(r.passed).toBe(true);expect(r.incoming).toEqual([2,4,2]);expect(r.residual).toEqual([0,0,0]);});
test('08 deliberate 1e-8 residual fails machine consistency',()=>{const r=momentumBalance([vec(3,4,0),vec(-1,0,2)],[vec(1,3,2),vec(1+1e-8,1,0)]);expect(r.passed).toBe(false);close(r.magnitude,1e-8,1e-6,1e-16);});
test('08 acceptance tolerance scales with vector magnitudes',()=>{const small=momentumBalance([vec(1,0,0)],[vec(1,0,0)]),big=momentumBalance([vec(1e6,0,0)],[vec(1e6,0,0)]);expect(big.tolerance).toBeGreaterThan(small.tolerance*1e5);});
test('08 compensated sums preserve small cancellation residual',()=>{const r=momentumBalance([vec(1e9,0,0),vec(.001,0,0),vec(-1e9,0,0)],[vec(.001,0,0)]);close(r.incoming[0],.001,1e-12);expect(r.passed).toBe(true);});
test('08 invalid empty vectors or tolerance rejected',()=>{expect(()=>momentumBalance([],[])).toThrow();expect(()=>momentumBalance([vec(0,0,0)],[vec(0,0,0)],-1)).toThrow();});
