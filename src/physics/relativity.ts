import {Energy,Mass,Momentum,Angle,Vec3,vec,norm,dot,add,energy,momentum,positive,finite,Invariant,PhysicsError,tolerance,compensatedSum} from './units';
export interface FourVector {E:Energy;p:Vec3;}
export function momentumForKinetic(T:Energy,m:Mass):Momentum{return momentum(Math.sqrt(T)*Math.sqrt(T+2*m));}
export function kineticForMomentum(p:Momentum,m:Mass):Energy {const mag=Math.abs(p);return energy(mag*(mag/(Math.hypot(mag,m)+m)));}
export function onShell(m:Mass,p:Vec3):FourVector{return {E:energy(Math.hypot(m,norm(p))),p};}
export function invariant(v:FourVector):Invariant {const p=norm(v.p),value=(v.E-p)*(v.E+p);if(Math.abs(value)<=tolerance(v.E*v.E+p*p,32))throw new PhysicsError('Invariant is below the resolution of these double-precision four-vector components. Use the known rest mass or better-conditioned input.','ILL_CONDITIONED');return value as Invariant;}
export function boost(v:FourVector,beta:readonly [number,number,number]):FourVector {
 beta.forEach(n=>finite(n,'Boost velocity'));const b2=beta.reduce((s,n)=>s+n*n,0);if(b2>=1)throw new PhysicsError('Lorentz boost must have |β| < 1.');if(b2===0)return v;
 const gamma=1/Math.sqrt(1-b2),bp=beta[0]*v.p[0]+beta[1]*v.p[1]+beta[2]*v.p[2];const k=gamma*gamma/(gamma+1)*bp+gamma*v.E;
 return {E:energy(gamma*(v.E+bp)),p:vec(v.p[0]+k*beta[0],v.p[1]+k*beta[1],v.p[2]+k*beta[2])};
}
export function centerOfMass(a:Mass,A:Mass,T:Energy,targetT:Energy=energy(0),opening:Angle=0 as Angle){
 if(targetT===0)return stationaryCM(a,A,T);
 const pa=momentumForKinetic(T,a),pA=momentumForKinetic(targetT,A),Ea=a+T,EA=A+targetT;
 // Stable invariant even for nearly collinear relativistic beams.
 const dy=Math.asinh(pa/a)-Math.asinh(pA/A),excess=4*a*A*Math.sinh(dy/2)**2+4*pa*pA*Math.sin(opening/2)**2;
 const sum=a+A,s=(sum*sum+excess) as Invariant,W=Math.sqrt(s);
 const pTotal=vec(pA*Math.sin(opening),0,pa+pA*Math.cos(opening));const Et=Ea+EA;
 const kCM=excess/(W+sum);
 return {s,total:energy(W),kinetic:energy(Math.max(0,kCM)),labKinetic:energy(T+targetT),momentum:pTotal,beta:[pTotal[0]/Et,pTotal[1]/Et,pTotal[2]/Et] as const,gamma:Et/W,totalLab:energy(Et),targetMoving:targetT>0};
}
export function stationaryCM(a:Mass,A:Mass,T:Energy){
 const sum=a+A,s=(sum*sum+2*A*T) as Invariant,W=Math.sqrt(s),k=2*A*T/(W+sum);const p=momentumForKinetic(T,a),Et=sum+T;
 return {s,total:energy(W),kinetic:energy(k),labKinetic:T,momentum:vec(0,0,p),beta:[0,0,p/Et] as const,gamma:Et/W,totalLab:energy(Et),targetMoving:false};
}
export function velocity(v:FourVector,knownMass?:Mass){const m2=knownMass===undefined?invariant(v):knownMass*knownMass;if(m2<=0)throw new PhysicsError('A massive, timelike four-vector is required.');const beta=norm(v.p)/v.E;return {beta,gamma:v.E/Math.sqrt(m2),betaRoundingWarning:beta===1};}
