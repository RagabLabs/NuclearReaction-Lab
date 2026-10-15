import {ReactionInput} from './particles';
import {Angle,Energy,Mass,Momentum,Vec3,energy,vec,norm,degrees,radians,sub,PhysicsError,tolerance,compensatedSum} from './units';
import {FourVector,stationaryCM,kineticForMomentum,momentumForKinetic} from './relativity';
export interface State {r:ReactionInput;cm:ReturnType<typeof stationaryCM>;available:Energy;pStar:Momentum;EbStar:Energy;EBStar:Energy;atThreshold:boolean;}
export interface Solution {branch:string;b:FourVector;B:FourVector;Tb:Energy;TB:Energy;thetaCM:Angle|null;thetaLab:Angle|null;thetaResidual:Angle|null;betaB:number;betaResidual:number;energyResidual:number;momentumResidual:Vec3;}
export function prepare(r:ReactionInput):State {
 const cm=stationaryCM(r.a,r.A,r.kinetic),delta=compensatedSum([r.a,r.A,-r.b,-r.B]),mf=r.b+r.B,mi=r.a+r.A;
 const th=delta<0?-delta*(mi+mf)/(2*r.A):0;
 if(r.kinetic<th)throw new PhysicsError('Below the relativistic reaction threshold. No physical final state.', 'BELOW_THRESHOLD');
 const ds=delta<0?2*r.A*(r.kinetic-th):delta*(mi+mf)+2*r.A*r.kinetic;
 const W=cm.total,av=Math.max(0,ds/(W+mf)),p2=ds*(ds+4*r.b*r.B)/(4*cm.s),ps=Math.sqrt(Math.max(0,p2)) as Momentum;
 return {r,cm,available:energy(av),pStar:ps,EbStar:energy(Math.hypot(r.b,ps)),EBStar:energy(Math.hypot(r.B,ps)),atThreshold:av===0};
}
const direction=(p:Vec3):Angle|null=>norm(p)===0?null:radians(Math.atan2(Math.hypot(p[0],p[1]),p[2]));
function solution(state:State,p:Vec3,thetaCM:Angle|null,branch:string):Solution{
 const {r,cm}=state,pB=sub(cm.momentum,p),Tb=kineticForMomentum(norm(p),r.b),TB=kineticForMomentum(norm(pB),r.B);
 const b={E:energy(r.b+Tb),p},B={E:energy(r.B+TB),p:pB};
 return {branch,b,B,Tb,TB,thetaCM,thetaLab:direction(p),thetaResidual:direction(pB),betaB:norm(p)/b.E,betaResidual:norm(pB)/B.E,energyResidual:compensatedSum([r.a,r.A,r.kinetic,-r.b,-r.B,-Tb,-TB]),momentumResidual:sub(cm.momentum,vec(p[0]+pB[0],p[1]+pB[1],p[2]+pB[2]))};
}
export function fromCM(state:State,angle:Angle):Solution{
 const {pStar:ps,EbStar:E,cm}=state,beta=cm.beta[2],gamma=cm.gamma;
 const sine=angle===0||angle===Math.PI?0:Math.sin(angle);
 const px=ps*sine,pz=gamma*(ps*Math.cos(angle)+beta*E);
 const p=Math.hypot(px,pz)<=tolerance(Math.max(ps,gamma*beta*E),32)?vec(0,0,0):vec(px,0,pz);
 return solution(state,p,ps===0?null:angle,'cm-selected');
}
export function atLabAngle(state:State,angle:Angle):Solution[]{
 const {r,cm}=state,Et=cm.totalLab,P=cm.momentum[2],c=Math.cos(angle),sine=Math.sin(angle);
 if(state.atThreshold){const sol=fromCM(state,degrees(0));return sol.thetaLab!==null&&Math.abs(sol.thetaLab-angle)<1e-10?[{...sol,branch:'threshold'}]:[];}
 const max=allowedLabLimit(state);if(max!==null&&angle*180/Math.PI>max+1e-10)return [];
 const equalElastic=r.a===r.A&&r.a===r.b&&r.a===r.B;
 const Wps=cm.total*state.pStar,mP=r.b*P;
 const D=cm.total*state.EbStar,A=cm.s+P*P*sine*sine,B=-2*D*P*c,C=equalElastic?0:(mP-Wps)*(mP+Wps);
 let det=(Wps-mP*sine)*(Wps+mP*sine);const detEps=128*Number.EPSILON*Math.max(Wps*Wps,mP*mP*sine*sine,Number.MIN_VALUE);
 if(det < -detEps)return [];if(det<0||(max!==null&&max<90&&Math.abs(angle*180/Math.PI-max)<=1e-10))det=0;
 const sqrtDisc=2*Et*Math.sqrt(Math.max(0,det));const q=-0.5*(B+(B>=0?sqrtDisc:-sqrtDisc));
 const roots=det===0||q===0?[-B/(2*A)]:[q/A,C/q];const accepted:Solution[]=[];
 for(const p of roots){
   if(!Number.isFinite(p)||p<=tolerance(Math.max(P,state.pStar),16))continue;
   if(accepted.some(sol=>Math.abs(norm(sol.b.p)-p)<=tolerance(Math.max(p,P),512)))continue;
   const E=Math.hypot(r.b,p),lhs=Et*E-P*c*p;
   if(Math.abs(lhs-D)>tolerance(Math.max(D,Et*E,P*p),1024))continue; // Unsquared equation rejects extraneous roots.
   if(Et-E<r.B-tolerance(Et,128))continue;
   const pcZ=cm.gamma*(p*c-cm.beta[2]*E),pcX=p*sine;
   const theta=radians(Math.atan2(Math.abs(pcX),pcZ));const sol=solution(state,vec(pcX,0,p*c),theta,'');
   if(Math.abs(sol.energyResidual)>tolerance(cm.totalLab,2048))continue;
   accepted.push(sol);
 }
 accepted.sort((a,b)=>b.Tb-a.Tb);return accepted.map((sol,i)=>({...sol,branch:accepted.length===1?'unique':i===0?'high-energy':'low-energy'}));
}
export function allowedLabLimit(state:State):number|null{
 if(state.pStar===0)return null;const beta=state.cm.beta[2],r=beta*state.EbStar/state.pStar;
 if(r<1-1e-12)return 180;if(Math.abs(r-1)<=1e-12)return 90;
 return Math.atan2(1,state.cm.gamma*Math.sqrt((r-1)*(r+1)))*180/Math.PI;
}
export function outgoingAtAngle(state:State,angle:Angle){const solutions=atLabAngle(state,angle);return {angle,solutions,energyRange:solutions.length?[energy(Math.min(...solutions.map(s=>s.Tb))),energy(Math.max(...solutions.map(s=>s.Tb)))]:null,allowed:solutions.length>0};}
