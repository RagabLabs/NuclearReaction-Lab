import {mass,energy,vec,degrees,compensatedSum} from './units';
import {Reaction,ReactionInput,validateReaction,reactionMasses,quantumBalance} from './particles';
import {threshold} from './thresholds';
import {stationaryCM,momentumForKinetic} from './relativity';
import {prepare,fromCM,atLabAngle,outgoingAtAngle,allowedLabLimit} from './kinematics';
import {momentumTransfer,momentumBalance} from './momentum';
import {recoil} from './recoil';
export function analyze(r:Reaction,kinetic:ReturnType<typeof energy>,angle:number,frame:'cm'|'lab'){
 validateReaction(r);const input:ReactionInput={...reactionMasses(r),kinetic};
 const th=threshold(input.a,input.A,[input.b,input.B]),cm=stationaryCM(input.a,input.A,kinetic);
 const basic={input,threshold:th,cm,quantum:quantumBalance(r),reaction:r,angle,frame,model:'Exact relativistic, stationary bare-nucleus target',warnings:['A kinematically open channel does not establish a nonzero cross section.','Joint reference-mass uncertainty is not propagated: required covariance is not imported.'],qAuxiliary:compensatedSum([input.a,input.A,-input.b,-input.B])};
 let state;try{state=prepare(input);}catch(e){return {...basic,status:'closed' as const,reason:(e as Error).message,solutions:[],state:null,maxLabAngle:null};}
 const solutions=frame==='cm'?[fromCM(state,degrees(angle))]:atLabAngle(state,degrees(angle));
 return {...basic,status:solutions.length?'open' as const:'no-angle-solution' as const,reason:solutions.length?'':'No nonzero outgoing particle at this lab angle.',state,maxLabAngle:allowedLabLimit(state),solutions:solutions.map(s=>({...s,transfer:momentumTransfer(cm.momentum,s.b.p,'lab',energy(input.a+kinetic),s.b.E),balance:momentumBalance([cm.momentum],[s.b.p,s.B.p]),recoil:recoil(input.B,s.B.p)}))};
}
export type Analysis=ReturnType<typeof analyze>;
export function scan(state:ReturnType<typeof prepare>){
 const points=[];for(let deg=0;deg<=180;deg++){
 const s=fromCM(state,degrees(deg)),q=momentumTransfer(state.cm.momentum,s.b.p,'lab');
 points.push({thetaCM:deg,thetaLab:s.thetaLab===null?null:s.thetaLab*180/Math.PI,energy:s.Tb,recoil:s.TB,transfer:q.magnitude});}
 return points;
}
