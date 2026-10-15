import {Angle,degrees} from './units';
import {State,fromCM,atLabAngle,allowedLabLimit} from './kinematics';
export function transformAngle(state:State,angle:Angle,from:'cm'|'lab'){
 if(state.atThreshold)return {solutions:[],defined:false,reason:'CM outgoing momentum is zero at threshold; emission direction is undefined.',maxLabAngle:allowedLabLimit(state)};
 const solutions=from==='cm'?[fromCM(state,angle)]:atLabAngle(state,angle);
 const defined=solutions.some(s=>s.thetaCM!==null&&s.thetaLab!==null);
 return {solutions,defined,reason:defined?'':'No nonzero physical outgoing momentum with a defined direction in both frames.',maxLabAngle:allowedLabLimit(state)};
}
