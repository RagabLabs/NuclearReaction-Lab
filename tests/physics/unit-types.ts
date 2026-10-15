import {energy,mass,momentum,degrees,Energy,Mass,Momentum,Angle} from '../../src/physics/units';
import {kineticForMomentum} from '../../src/physics/relativity';
declare const e:Energy,m:Mass,p:Momentum,a:Angle;
// @ts-expect-error Energy and momentum cannot be interchanged.
kineticForMomentum(e,m);
// @ts-expect-error Mass and energy are different dimensions.
const wrongMass:Mass=e;
// @ts-expect-error Degrees require explicit conversion to angle.
const wrongAngle:Angle=90;
