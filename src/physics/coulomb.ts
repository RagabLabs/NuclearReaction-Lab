import {Mass,Energy,positive,nonnegative,PhysicsError} from './units';
import {ALPHA,HBAR_C,COULOMB_MEV_FM} from './constants';
export function coulomb(z1:number,z2:number,R:number,E:Energy,m1:Mass,m2:Mass){
 if(!Number.isInteger(z1)||!Number.isInteger(z2)||z1<0||z2<0||z1>200||z2>200)throw new PhysicsError('Nuclear charges must be integers from 0 to 200.');positive(R,'Contact radius');
 if(R<1e-9||R>1e6)throw new PhysicsError('Contact radius outside the validated 10⁻⁹ to 10⁶ fm numerical range.');
 const k=COULOMB_MEV_FM*z1*z2,V=k/R,mu=m1*m2/(m1+m2),ratio=V===0?null:E/V;
 const validNonrel=E/mu<0.01;
 if(k===0)return {barrier:V,ratio,eta:null,logGamow:null,gamow:null,logWKB:null,wkb:null,turningRadius:null,model:'No repulsive Coulomb barrier for a neutral particle.',validNonrel};
 if(E===0)return {barrier:V,ratio:0,eta:null,logGamow:null,gamow:0,logWKB:null,wkb:0,turningRadius:null,model:'Zero-energy limiting model; logarithm tends to −∞, displayed as undefined.',validNonrel};
 if(E<1e-12)return {barrier:V,ratio,eta:null,logGamow:null,gamow:null,logWKB:null,wkb:null,turningRadius:null,model:'Penetration withheld below 10⁻¹² MeV numerical policy; use the explicit zero-energy limit or a separately reviewed numerical model.',validNonrel};
 if(!validNonrel)return {barrier:V,ratio,eta:null,logGamow:null,gamow:null,logWKB:null,wkb:null,turningRadius:k/E,model:'Penetration disabled: E/μ ≥ 0.01 outside this nonrelativistic implementation policy.',validNonrel};
 const eta=z1*z2*ALPHA*Math.sqrt(mu/(2*E)),logGamow=-2*Math.PI*eta;
 const x=Math.min(1,E/V);
 // Analytic l=0 radial WKB action for V(r)=k/r from R to k/E.
 const action=Math.acos(Math.sqrt(x))-Math.sqrt(Math.max(0,x*(1-x)));
 const logWKB=E>=V?null:-4*eta*action;
 return {barrier:V,ratio,eta,logGamow,gamow:Math.exp(logGamow),logWKB,wkb:logWKB===null?null:Math.exp(logWKB),turningRadius:k/E,model:E>=V?'Above contact barrier: sub-barrier WKB estimate withheld. Gamow factor is a point-Coulomb model, not a reaction probability.':'Nonrelativistic l=0, unscreened Coulomb tail, finite contact radius. WKB is indicative away from turning-point coalescence; no nuclear potential, spin, resonance or S-factor.',validNonrel};
}
export function contactRadius(a1:number,a2:number,r0:number):number{positive(a1,'Projectile A');positive(a2,'Target A');positive(r0,'Radius coefficient');return r0*(Math.cbrt(a1)+Math.cbrt(a2));}
