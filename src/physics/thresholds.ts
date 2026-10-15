import {Mass,energy,compensatedSum,positive} from './units';
export function threshold(a:Mass,A:Mass,final:readonly Mass[]){
 if(final.length===0)throw new Error('At least one final mass is required.');final.forEach(m=>positive(m,'Final mass'));
 const mf=compensatedSum(final),mi=a+A,delta=compensatedSum([...final,-a,-A]);
 const exact=energy(Math.max(0,delta*(mf+mi)/(2*A)));const nr=energy(Math.max(0,delta*(1+a/A)));
 return {exact,nonrelativistic:nr,approximationRelativeError:exact===0?0:Math.abs(nr-exact)/exact,projectileRestEnergyRatio:exact/a,model:'Exact relativistic, stationary target',assumption:'Minimum final invariant mass equals the sum of final rest masses; no additional constraints or barriers included.'};
}
