import {Angle,nonnegative,PhysicsError} from './units';
import {State,atLabAngle} from './kinematics';
export function angularJacobian(state:State,thetaCM:Angle){
 if(state.pStar===0)return {status:'undefined' as const,jacobian:null,reason:'Zero outgoing CM momentum at threshold.'};
 const r=state.cm.beta[2]*state.EbStar/state.pStar,u=Math.cos(thetaCM),gamma=state.cm.gamma;
 const D=Math.sqrt(Math.max(0,1-u*u)+gamma*gamma*(u+r)*(u+r));
 if(D<1e-12)return {status:'undefined' as const,jacobian:null,reason:'Outgoing particle is at rest in lab; direction undefined.'};
 const d=gamma*Math.abs(1+r*u);
 if(d<=1e-10*Math.max(1,gamma,Math.abs(r)))return {status:'singular' as const,jacobian:null,reason:'Angular fold: pointwise solid-angle Jacobian diverges. Use finite detector-bin integration with a supplied angular distribution.'};
 return {status:'regular' as const,jacobian:D*D*D/d,reason:'dΩ_cm / dΩ_lab; axisymmetric stationary-target boost.'};
}
export function transformCrossSection(state:State,angleLab:Angle,values:readonly number[],direction:'cm-to-lab'|'lab-to-cm'='cm-to-lab'){
 values.forEach(v=>nonnegative(v,'Differential cross section'));
 const branches=atLabAngle(state,angleLab);if(!branches.length)throw new PhysicsError('No physical branch at this lab angle.');
 if(values.length!==branches.length)throw new PhysicsError(`Supply ${branches.length} branch-resolved input value(s). Each belongs to a different CM angle; no equality is assumed.`);
 const result=branches.map((s,i)=>{const j=s.thetaCM===null?{status:'undefined' as const,jacobian:null,reason:'CM direction undefined.'}:angularJacobian(state,s.thetaCM);const output=j.jacobian===null?null:direction==='cm-to-lab'?values[i]*j.jacobian:values[i]/j.jacobian;if(output!==null&&!Number.isFinite(output))throw new PhysicsError('Cross-section result exceeds finite numerical range.');return {...j,branch:s.branch,thetaCM:s.thetaCM,input:values[i],output};});
 return {direction,branches:result,totalLab:direction==='cm-to-lab'&&result.every(x=>x.output!==null)?result.reduce((s,x)=>s+(x.output??0),0):null,model:'Solid-angle density transformation of explicitly supplied values; no absolute cross-section prediction.'};
}
