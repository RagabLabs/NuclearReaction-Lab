import data from '../data/nuclear-data.json';
type Quantity<T extends string> = number & {readonly __unit:T};
export type Energy = Quantity<'MeV'>;
export type Mass = Quantity<'MeV/c²'>;
export type Momentum = Quantity<'MeV/c'>;
export type Angle = Quantity<'rad'>;
export type Invariant = Quantity<'MeV²'>;
export type Frame='lab'|'cm';
export type Vec3=readonly [Momentum,Momentum,Momentum];
export class PhysicsError extends Error { constructor(message:string,public readonly code='INVALID_INPUT'){super(message);this.name='PhysicsError';} }
export function finite(n:number,label:string):number {if(!Number.isFinite(n))throw new PhysicsError(`${label} must be finite.`);return n;}
export function nonnegative(n:number,label:string):number {finite(n,label);if(n<0)throw new PhysicsError(`${label} cannot be negative.`);return n;}
export function positive(n:number,label:string):number {nonnegative(n,label);if(n===0)throw new PhysicsError(`${label} must be positive.`);return n;}
export function energy(n:number):Energy {nonnegative(n,'Energy');if(n>1e9)throw new PhysicsError('Energy exceeds the validated 10⁹ MeV numerical range.');return n as Energy;}
export function mass(n:number):Mass {positive(n,'Mass');if(n<1e-9||n>1e8)throw new PhysicsError('Mass outside validated numerical range.');return n as Mass;}
export function momentum(n:number):Momentum {finite(n,'Momentum');if(Math.abs(n)>1e10)throw new PhysicsError('Momentum outside validated numerical range.');return n as Momentum;}
export function radians(n:number):Angle {finite(n,'Angle');if(n<0||n>Math.PI+1e-14)throw new PhysicsError('Polar angle must be between 0 and π radians.');return Math.min(n,Math.PI) as Angle;}
export function degrees(n:number):Angle {return radians(n*Math.PI/180);}
export const inDegrees=(a:Angle):number=>a*180/Math.PI;
export const vec=(x:number,y:number,z:number):Vec3=>[momentum(x),momentum(y),momentum(z)];
export const norm=(v:Vec3):Momentum=>momentum(Math.hypot(...v));
export const dot=(a:Vec3,b:Vec3):number=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const add=(a:Vec3,b:Vec3):Vec3=>vec(a[0]+b[0],a[1]+b[1],a[2]+b[2]);
export const sub=(a:Vec3,b:Vec3):Vec3=>vec(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export const U_MEV=data.constants['atomic mass constant energy equivalent in MeV'].value;
export const C=data.constants['speed of light in vacuum'].value;
export const EV_J=data.constants['elementary charge'].value;
export type EnergyUnit='MeV'|'keV'|'GeV'|'J';
export function energyFrom(n:number,u:EnergyUnit):Energy {return energy(n*({MeV:1,keV:1e-3,GeV:1e3,J:1/(EV_J*1e6)}[u]));}
export function energyTo(n:Energy,u:EnergyUnit):number {return n/({MeV:1,keV:1e-3,GeV:1e3,J:1/(EV_J*1e6)}[u]);}
export type MassUnit='MeV/c²'|'u'|'kg';
export function massFrom(n:number,u:MassUnit):Mass {return mass(n*({'MeV/c²':1,u:U_MEV,kg:C*C/(EV_J*1e6)}[u]));}
export function massTo(n:Mass,u:MassUnit):number{return n/({'MeV/c²':1,u:U_MEV,kg:C*C/(EV_J*1e6)}[u]);}
export type MomentumUnit='MeV/c'|'GeV/c'|'kg·m/s';
export function momentumFrom(n:number,u:MomentumUnit):Momentum{return momentum(n*({'MeV/c':1,'GeV/c':1e3,'kg·m/s':C/(EV_J*1e6)}[u]));}
export function momentumTo(n:Momentum,u:MomentumUnit):number{return n/({'MeV/c':1,'GeV/c':1e3,'kg·m/s':C/(EV_J*1e6)}[u]);}
export function compensatedSum(values:readonly number[]):number {let sum=0,correction=0;for(const v of values){const next=sum+v;correction+=Math.abs(sum)>=Math.abs(v)?(sum-next)+v:(v-next)+sum;sum=next;}return sum+correction;}
export const tolerance=(scale:number,operations=128):number=>operations*Number.EPSILON*Math.max(1,Math.abs(scale));
