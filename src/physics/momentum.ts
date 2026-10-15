import {Vec3,Energy,Frame,sub,norm,vec,tolerance,compensatedSum,PhysicsError} from './units';
export function momentumTransfer(initial:Vec3,final:Vec3,frame:Frame,initialE?:Energy,finalE?:Energy){
 const q=sub(initial,final),magnitude=norm(q);
 if((initialE===undefined)!==(finalE===undefined))throw new PhysicsError('Both total energies are required for invariant t.');
 const deltaE=initialE!==undefined&&finalE!==undefined?initialE-finalE:null;
 return {frame,q,magnitude,deltaE,t:deltaE===null?null:deltaE*deltaE-magnitude*magnitude,definition:'q = p_in − p_out; t = (E_in − E_out)² − |q|² with c=1'};
}
export function momentumBalance(initial:readonly Vec3[],final:readonly Vec3[],relativeTolerance=128*Number.EPSILON){
 if(initial.length===0||final.length===0)throw new PhysicsError('Both sides need at least one vector.');
 if(!Number.isFinite(relativeTolerance)||relativeTolerance<0||relativeTolerance>0.01)throw new PhysicsError('Relative tolerance must lie between zero and 0.01.');
 const sum=(vs:readonly Vec3[])=>vec(...[0,1,2].map(i=>compensatedSum(vs.map(v=>v[i]))) as [number,number,number]);
 const incoming=sum(initial),outgoing=sum(final),residual=sub(incoming,outgoing),magnitude=norm(residual);
 const scale=[...initial,...final].reduce((s,v)=>s+norm(v),0);const limit=relativeTolerance*scale+32*Number.EPSILON*([...initial,...final].length+1)*scale;
 return {incoming,outgoing,residual,magnitude,scale,tolerance:limit,passed:magnitude<=limit,relativeResidual:scale===0?0:magnitude/scale,policy:'Floating-point consistency tolerance scales with the sum of individual vector magnitudes, operation count, and machine epsilon; this is not an experimental-error test.'};
}
