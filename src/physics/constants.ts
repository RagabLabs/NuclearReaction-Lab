import data from '../data/nuclear-data.json';
import {EV_J,C} from './units';
export {C,EV_J};
export const ALPHA=data.constants['fine-structure constant'].value;
// Exact SI h, c, e imply hbar*c. Do not use truncated ASCII ellipsis as exact.
export const HBAR_C=data.constants['Planck constant'].value*C/(2*Math.PI*EV_J)*1e9;
export const COULOMB_MEV_FM=ALPHA*HBAR_C;
export const DATA_VERSION=data.version;
