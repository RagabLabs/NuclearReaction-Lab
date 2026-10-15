import {Mass,Vec3,vec,add,norm,energy,compensatedSum} from './units';
import {kineticForMomentum,onShell} from './relativity';
export function recoil(m:Mass,transfer:Vec3,initial:Vec3=vec(0,0,0)){
 const final=add(initial,transfer),pi=norm(initial),pf=norm(final),Ti=kineticForMomentum(pi,m),Tf=kineticForMomentum(pf,m);
 const delta=compensatedSum([Tf,-Ti]);const nr=pf*(pf/(2*m));
 return {initial,transfer,final,initialKinetic:Ti,finalKinetic:Tf,energyChange:delta,beta:pf/onShell(m,final).E,nonrelativistic:energy(nr),approximationRelativeError:Tf===0?0:(nr-Tf)/Tf,initiallyAtRest:pi===0};
}
