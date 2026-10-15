import data from '../data/nuclear-data.json';
import {mass,Mass,PhysicsError,nonnegative} from './units';
export interface Particle {id:string;symbol:string;name:string;Z:number;A:number;mass:Mass;uncertainty:number|null;source:string;massType:'bare-nucleus'|'user-supplied';}
export const records=data.records;
export const particles:Particle[]=records.filter(r=>r.usableForKinematics).map(r=>({id:r.id,symbol:r.symbol,name:r.name,Z:r.Z,A:r.A,mass:mass(r.mass),uncertainty:r.massUncertainty,source:r.source,massType:'bare-nucleus'}));
export function particle(id:string):Particle {const p=particles.find(p=>p.id===id);if(!p)throw new PhysicsError(`No verified bare-nucleus mass for ${id}. Atomic catalog records cannot be substituted.`, 'MISSING_MASS');return p;}
export interface Reaction {a:Particle;A:Particle;b:Particle;B:Particle;excitation: number;}
export interface ReactionInput {a:Mass;A:Mass;b:Mass;B:Mass;kinetic:import('./units').Energy;}
export function reactionMasses(r:Reaction):Omit<ReactionInput,'kinetic'>{nonnegative(r.excitation,'Residual excitation');return {a:r.a.mass,A:r.A.mass,b:r.b.mass,B:mass(r.B.mass+r.excitation)};}
export function quantumBalance(r:Reaction){const charge=r.a.Z+r.A.Z-r.b.Z-r.B.Z;const baryon=r.a.A+r.A.A-r.b.A-r.B.A;return {charge,baryon,passed:charge===0&&baryon===0};}
export function validateReaction(r:Reaction):void {if(!quantumBalance(r).passed)throw new PhysicsError('Reaction violates electric-charge or baryon-number conservation.', 'QUANTUM_BALANCE');reactionMasses(r);}
export const presets=[
 {id:'dt',label:'D–T fusion',ar:'اندماج الديوتيريوم والتريتيوم',ids:['d','t','n','alpha'],energy:0.1,description:'Exothermic two-body example; kinematics only, no fusion rate.'},
 {id:'np',label:'Neutron–proton elastic',ar:'تشتت نيوترون–بروتون مرن',ids:['n','p','n','p'],energy:2,description:'Nearly equal masses; the backward CM endpoint needs care.'},
 {id:'na',label:'Neutron–alpha elastic',ar:'تشتت نيوترون–ألفا مرن',ids:['n','alpha','n','alpha'],energy:2,description:'Light projectile on a heavier target.'},
 {id:'pa',label:'Proton–alpha elastic',ar:'تشتت بروتون–ألفا مرن',ids:['p','alpha','p','alpha'],energy:5,description:'Elastic charged-particle example.'},
 {id:'an',label:'Alpha–neutron elastic',ar:'تشتت ألفا–نيوترون مرن',ids:['alpha','n','alpha','n'],energy:10,description:'Inverse kinematics: two lab-energy branches below the maximum angle.'},
 {id:'pt',label:'³H(p,n)³He',ar:'تفاعل تريتيوم مع بروتون',ids:['p','t','n','h'],energy:1.5,description:'Endothermic charge-exchange reaction, close to threshold.'},
 {id:'ddn',label:'²H(d,n)³He',ar:'ديوتيريوم إلى نيوترون وهيليوم-3',ids:['d','d','n','h'],energy:0.2,description:'Exothermic neutron-production channel; no cross section supplied.'},
 {id:'ddp',label:'²H(d,p)³H',ar:'ديوتيريوم إلى بروتون وتريتيوم',ids:['d','d','p','t'],energy:0.2,description:'Exothermic proton-production channel.'},
 {id:'pp',label:'Proton–proton elastic',ar:'تشتت بروتون–بروتون مرن',ids:['p','p','p','p'],energy:1000,description:'Relativistic equal-mass example; products labelled, no identical-particle rate factor.'},
 {id:'aa',label:'Alpha–alpha elastic',ar:'تشتت ألفا–ألفا مرن',ids:['alpha','alpha','alpha','alpha'],energy:10,description:'Identical species; this tool tracks labelled outgoing momenta.'},
];
