"""Independent numerical reference generation for Nuclear Reaction Lab.

This script uses only Python's standard library. It does not import or call the
application engine. Decimal arithmetic uses 80 significant digits. Synthetic
examples use exactly specified mathematical masses; they are NOT nuclear data.
Physical examples use nominal CODATA 2022 rest energies verified in NIST's
allascii.txt. The long output digits are an arithmetic oracle, not a statement of
physical accuracy or an uncertainty propagation result.
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json

getcontext().prec = 80
PI = D('3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628')
EPS = D('1e-75')
ZERO = D(0)
ONE = D(1)
TWO = D(2)


def sincos(x):
    x = D(x) % (2 * PI)
    if x > PI:
        x -= 2 * PI
    s = term_s = x
    c = term_c = ONE
    n = 1
    while abs(term_s) > EPS or abs(term_c) > EPS:
        term_s *= -x * x / D((2*n) * (2*n+1))
        term_c *= -x * x / D((2*n-1) * (2*n))
        s += term_s
        c += term_c
        n += 1
    return s, c


def atan(x):
    x = D(x)
    if x < 0:
        return -atan(-x)
    if x > 1:
        return PI/2 - atan(1/x)
    multiplier = ONE
    while x > D('0.1'):
        x = x / (ONE + (ONE + x*x).sqrt())
        multiplier *= 2
    term = x
    result = x
    n = 1
    while abs(term) > EPS:
        term *= -x*x
        result += term / D(2*n+1)
        n += 1
    return result * multiplier


def atan2(y, x):
    y, x = D(y), D(x)
    if x > 0:
        return atan(y/x)
    if x < 0:
        return atan(y/x) + (PI if y >= 0 else -PI)
    if y > 0:
        return PI/2
    if y < 0:
        return -PI/2
    return None  # direction of a zero vector is undefined


def asin(x):
    x = D(x)
    return atan2(x, (ONE - x*x).sqrt())


def acos(x):
    x = D(x)
    return atan2((ONE-x*x).sqrt(), x)


def deg(x):
    return None if x is None else x*180/PI


def rad(x):
    return D(x)*PI/180


def threshold(ma, mA, mb, mB):
    initial, final = ma+mA, mb+mB
    return max(ZERO, (final-initial)*(final+initial)/(2*mA))


def context(ma, mA, mb, mB, T):
    ma, mA, mb, mB, T = map(D, (ma, mA, mb, mB, T))
    E = ma+mA+T
    P = (T*(T+2*ma)).sqrt()
    s = (ma+mA)**2 + 2*mA*T
    W = s.sqrt()
    delta_s = (ma+mA-mb-mB)*(ma+mA+mb+mB)+2*mA*T
    if delta_s < -D('1e-65'):
        return dict(status='below threshold', s=s, W=W)
    if delta_s < 0:
        delta_s = ZERO
    psq = delta_s*(delta_s+4*mb*mB)/(4*s)
    ps = psq.sqrt()
    ebs = (s+mb**2-mB**2)/(2*W)
    eBs = W-ebs
    return dict(status='allowed', ma=ma, mA=mA, mb=mb, mB=mB,
                T=T, E=E, P=P, s=s, W=W, beta=P/E, gamma=E/W,
                ps=ps, ebs=ebs, eBs=eBs,
                r=None if ps == 0 else P*ebs/(E*ps))


def branch_from_u(ctx, u):
    u = D(u)
    ps, beta, gamma = ctx['ps'], ctx['beta'], ctx['gamma']
    st = max(ZERO, ONE-u*u).sqrt()
    perp = ps*st
    pz = gamma*(ps*u+beta*ctx['ebs'])
    eb = gamma*(ctx['ebs']+beta*ps*u)
    pBz = gamma*(-ps*u+beta*ctx['eBs'])
    eB = gamma*(ctx['eBs']-beta*ps*u)
    p = (perp*perp+pz*pz).sqrt()
    pB = (perp*perp+pBz*pBz).sqrt()
    theta_lab = atan2(perp, pz)
    theta_B = atan2(perp, pBz)
    # Explicit semantic limits. Threshold has no CM direction and no angular J.
    if ps == 0 or p <= D('1e-65'):
        J = None
    else:
        d = gamma*ps*ps*abs(ps+beta*ctx['ebs']*u)
        J = None if d < D('1e-65') else p**3/d
    return dict(u=u,
                theta_cm_deg=None if ps == 0 else deg(acos(u)),
                theta_lab_deg=deg(theta_lab),
                outgoing_energy=eb, outgoing_kinetic=eb-ctx['mb'],
                outgoing_momentum=p, outgoing_p=[perp, ZERO, pz],
                recoil_energy=eB, recoil_kinetic=eB-ctx['mB'],
                recoil_momentum=pB, recoil_p=[-perp, ZERO, pBz],
                recoil_theta_lab_deg=deg(theta_B),
                J_cm_over_lab=J,
                energy_residual=ctx['E']-eb-eB,
                momentum_residual=[ZERO, ZERO, ctx['P']-pz-pBz],
                outgoing_mass_shell_residual=eb*eb-p*p-ctx['mb']**2,
                recoil_mass_shell_residual=eB*eB-pB*pB-ctx['mB']**2)


def independent_lab_roots(ctx, theta):
    if ctx['status'] != 'allowed':
        return []
    st, ct = sincos(theta)
    E, P, s, mb, mB = (ctx[k] for k in ('E', 'P', 's', 'mb', 'mB'))
    C = (s+mb*mb-mB*mB)/2
    A = s+P*P*st*st
    disc = s*ctx['ps']**2 - mb*mb*P*P*st*st
    if disc < -D('1e-65'):
        return []
    disc = max(ZERO, disc)
    roots = [(C*P*ct+sgn*E*disc.sqrt())/A for sgn in (ONE,-ONE)]
    accepted = []
    for p in roots:
        if p <= D('1e-65'):
            continue
        eb = (p*p+mb*mb).sqrt()
        if abs(E*eb-P*p*ct-C) > D('1e-60'):
            continue
        if E-eb < mB-D('1e-60'):
            continue
        if any(abs(p-b['outgoing_momentum']) < D('1e-60') for b in accepted):
            continue
        u = ctx['gamma']*(p*ct-ctx['beta']*eb)/ctx['ps']
        u = max(-ONE, min(ONE,u))
        b = branch_from_u(ctx,u)
        assert abs(b['outgoing_momentum']-p) < D('1e-60')
        accepted.append(b)
    return accepted


def serialize(x):
    if isinstance(x, D):
        return format(x, '.50g')
    if isinstance(x, dict):
        return {k: serialize(v) for k, v in x.items()}
    if isinstance(x, (list,tuple)):
        return [serialize(v) for v in x]
    return x


def build_references():
    equal = context('1000','1000','1000','1000','600')
    equal90 = branch_from_u(equal,ZERO)
    # Independent closed forms for this symmetry, rather than engine outputs.
    assert abs(equal90['outgoing_kinetic']-300) < D('1e-60')
    assert abs(equal90['outgoing_momentum']-100*D(69).sqrt()) < D('1e-60')
    heavy = context('4','1','4','1','3')
    heavy0 = [branch_from_u(heavy,ONE), branch_from_u(heavy,-ONE)]
    angle_lab = asin(ONE/8)
    heavy_small = independent_lab_roots(heavy,angle_lab)
    assert len(heavy_small) == 2
    for b, sign in zip(heavy_small, (ONE,-ONE)):
        assert abs(b['outgoing_kinetic']-(D(3708)+sign*396*D(21).sqrt())/2017) < D('1e-60')
        assert abs(b['u']-(-D(184)+sign*372*D(21).sqrt())/2017) < D('1e-60')
    assert abs(heavy0[0]['J_cm_over_lab']-31) < D('1e-60')
    assert abs(heavy0[1]['J_cm_over_lab']-D(225)/31) < D('1e-60')
    fold = branch_from_u(heavy, -D(8)/23)
    assert fold['J_cm_over_lab'] is None
    assert abs(fold['theta_lab_deg']-deg(asin(ONE/4))) < D('1e-60')
    assert abs(fold['outgoing_kinetic']-D(36)/23) < D('1e-60')
    at45 = independent_lab_roots(equal,PI/4)
    assert len(at45) == 1
    assert abs(at45[0]['outgoing_kinetic']-D(6000)/23) < D('1e-60')
    # Analytic derivative checked independently using symmetric differences.
    derivative_checks = []
    h = D('1e-20')
    for b in heavy_small:
        u = b['u']
        def lab_cos(uu):
            v = branch_from_u(heavy,uu)
            return v['outgoing_p'][2]/v['outgoing_momentum']
        deriv = (lab_cos(u+h)-lab_cos(u-h))/(2*h)
        derivative_J = ONE/abs(deriv)
        assert abs(derivative_J-b['J_cm_over_lab']) < D('1e-35')
        derivative_checks.append(dict(u=u, J_analytic=b['J_cm_over_lab'],
                                       J_finite_difference=derivative_J,
                                       absolute_difference=abs(derivative_J-b['J_cm_over_lab'])))
    # Constants: h, c and e are exact SI. alpha is nominal CODATA 2022.
    alpha = D('0.0072973525643')
    hbarc = D('6.62607015e-34')*D('299792458')/(2*PI*D('1.602176634e-19'))*D('1e9')
    coulomb = alpha*hbarc
    R, mu, relative_energy = D(5), D(500), D('0.01')
    Vc = coulomb/R
    v_rel = (2*relative_energy/mu).sqrt()
    eta = alpha/v_rel
    gamow_exponent = 2*PI*eta
    x = relative_energy/Vc
    finite_exponent = 4*eta*(acos(x.sqrt())-(x*(1-x)).sqrt())
    synthetic = {
        'calculation01': {
            'name':'Endothermic threshold and exact-threshold state',
            'input':{'masses':[2,3,3,3], 'frame':'stationary-target lab'},
            'expected':{'threshold_mev':D(11)/6, 'Q_mev':-1,
                        'threshold_nonrel_mev':D(5)/3,
                        'exact_threshold_W':6,
                        'exact_threshold_cm_momentum':0,
                        'exact_threshold_product_kinetic_each':D(5)/12,
                        'exact_threshold_product_momentum_each':D(385).sqrt()/12,
                        'cm_direction_defined':False,'angular_jacobian_defined':False},
            'exactExpressions':'Tth=[(3+3)^2-(2+3)^2]/(2*3)=11/6; product T=5/12',
            'additional_exothermic_input':{'masses':[2,3,2,2],'T':0},
            'additional_exothermic_expected':{'threshold':0,'Q':1,'product_p_cm':D('1.5'),'product_T_each':D('0.5')}
        },
        'calculation02': {
            'name':'Stationary-target invariant and moving-target collider contrast',
            'input':{'masses':[1,1],'projectile_T':1,'target_T':0},
            'expected':{'s':6,'total_lab_energy':3,'total_cm_energy':D(6).sqrt(),
                        'cm_kinetic_available':D(6).sqrt()-2,
                        'beta_cm':ONE/D(3).sqrt(),'gamma_cm':D('1.5').sqrt()},
            'moving_target_input':{'masses':[1,1],'T_each':1,'beam_relative_angle_deg':180},
            'moving_target_expected':{'s':16,'total_cm_energy':4,'cm_kinetic_available':2,'beta_cm':0},
            'exactExpressions':'W=sqrt(6) stationary; W=4 for equal opposite p=sqrt(3)'
        },
        'calculation03': {
            'name':'Exact recoil and a moving-nucleus energy change',
            'input':{'mass':4,'initial_p':[0,0,0],'transfer_p':[3,0,0]},
            'expected':{'kinetic':1,'total_energy':5,'beta':D('0.6'),'gamma':D('1.25'),'nonrel_kinetic':D('1.125')},
            'moving_input':{'mass':4,'initial_p':[3,0,0],'transfer_p':[-3,4,0]},
            'moving_expected':{'final_p':[0,4,0],'initial_kinetic':1,'final_kinetic':4*D(2).sqrt()-4,
                               'kinetic_energy_change':4*D(2).sqrt()-5,'beta_final':ONE/D(2).sqrt()},
            'deceleration_input':{'mass':4,'initial_p':[3,0,0],'transfer_p':[-3,0,0]},
            'deceleration_expected':{'final_kinetic':0,'kinetic_energy_change':-1},
            'exactExpressions':'sqrt(4^2+3^2)-4=1; moving delta K=4sqrt(2)-5'
        },
        'calculation04': {
            'name':'Equal-mass relativistic elastic scattering at CM 90 degrees',
            'input':{'masses':[1000,1000,1000,1000],'projectile_T':600,'theta_cm_deg':90},
            'context':equal,'expected':equal90,
            'exactExpressions':'s=5200000; p*=100sqrt(30); E*=100sqrt(130); product T=300; p_lab=100sqrt(69)'
        },
        'calculation05': {
            'name':'Exact two-branch angle mapping and turning point',
            'input':{'masses':[4,1,4,1],'projectile_T':3,'theta_lab_deg':deg(angle_lab)},
            'context':heavy,'expected_branches':heavy_small,
            'expected_fold':fold,
            'expected_zero_lab_branches':heavy0,
            'forbidden_above_lab_angle_deg':deg(asin(ONE/4)),
            'exactExpressions':'theta_lab=asin(1/8); u_pm=(-184 +/-372sqrt(21))/2017; fold theta_lab=asin(1/4), u=-8/23'
        },
        'calculation06': {
            'name':'Outgoing energy at specified laboratory angle',
            'input':{'masses':[1000,1000,1000,1000],'projectile_T':600,'theta_lab_deg':45},
            'expected_branches':at45,
            'exactExpressions':'T_b=6000/23; T_B=7800/23; theta*=2 atan(sqrt(1.3))',
            'theta_lab_90_and_180_expected':'no nonzero outgoing momentum; zero vector has no defined angle'
        },
        'calculation07': {
            'name':'Three-vector momentum transfer and Mandelstam t distinction',
            'input':{'initial_p':[0,0,5],'final_p':[4,0,3],'initial_energy':10,'final_energy':10,
                     'theta_deg':deg(acos(D(3)/5)),'frame':'specified frame'},
            'expected':{'q_vector':[-4,0,2],'q_magnitude':2*D(5).sqrt(),'energy_transfer':0,'t':-20,
                        'particle_rest_energy':5*D(3).sqrt()},
            'exactExpressions':'q=p_in-p_out=(-4,0,2); |q|=sqrt(20); t=(delta E)^2-|q|^2=-20'
        },
        'calculation08': {
            'name':'Known vector closure and a deliberate residual',
            'input':{'initial_vectors':[[3,4,0],[-1,0,2]],'final_vectors':[[1,3,2],[1,1,0]]},
            'expected':{'initial_total':[2,4,2],'final_total':[2,4,2],'residual_vector':[0,0,0],'residual_magnitude':0},
            'perturbed_input':{'final_vectors':[[1,3,2],[D('1.00000001'),1,0]]},
            'perturbed_expected':{'residual_vector':[D('-0.00000001'),0,0],'residual_magnitude':D('0.00000001')},
            'exactExpressions':'component-wise sum initial=final=(2,4,2); perturb one final x by 1e-8'
        },
        'calculation09': {
            'name':'Branch-resolved Jacobians and unresolved laboratory branch sum',
            'input':{'masses':[4,1,4,1],'projectile_T':3,'theta_lab_deg':0,
                     'synthetic_cross_section_cm_at_each_branch_mb_sr':1},
            'expected':{'J_high':D(31),'J_low':D(225)/31,'lab_sum_mb_sr':D(1186)/31,
                        'total_cross_section_for_cm_isotropic_one_mb_sr':4*PI,
                        'fold_status':'singular; do not emit Infinity',
                        'threshold_status':'undefined CM direction and angular Jacobian'},
            'finite_difference_derivative_checks':derivative_checks,
            'exactExpressions':'J_high=31; J_low=225/31; f_lab=1*31+1*225/31=1186/31'
        },
        'calculation10': {
            'name':'Specified mathematical contact barrier and model-only penetration',
            'input':{'Z1':1,'Z2':1,'masses':[1000,1000],'relative_energy_mev':relative_energy,'contact_radius_fm':R,
                     'alpha_nominal_codata2022':alpha},
            'expected':{'hbar_c_mev_fm':hbarc,'alpha_hbar_c_mev_fm':coulomb,
                        'reduced_mass_mev_c2':mu,'barrier_mev':Vc,'energy_barrier_ratio':x,
                        'nonrel_relative_speed_over_c':v_rel,'sommerfeld_eta':eta,
                        'gamow_exponent':gamow_exponent,'point_gamow_factor':(-gamow_exponent).exp(),
                        'finite_radius_s_wave_wkb_exponent':finite_exponent,'finite_radius_s_wave_wkb_factor':(-finite_exponent).exp()},
            'exactExpressions':'Vc=alpha*hbar*c/5; eta=alpha*sqrt(25000); P_G=exp(-2*pi*eta)',
            'interpretation':'Synthetic masses/radius; model factors only, no experimental cross section, no actual reaction probability'
        }
    }
    masses = { 'p':D('938.27208943'),'n':D('939.56542194'),'d':D('1875.61294500'),
               't':D('2808.92113668'),'h':D('2808.39161112'),'alpha':D('3727.3794118') }
    ma,mA,mb,mB = (masses[p] for p in ('p','t','n','h'))
    Tth = threshold(ma,mA,mb,mB)
    p_t = context(ma,mA,mb,mB,'1.1')
    p_t_lab30 = independent_lab_roots(p_t,rad(30))
    physical = {
        'source':'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
        'source_version':'CODATA 2022', 'mass_type':'bare particle/nucleus rest-energy equivalent',
        'mass_nominal_values_mev':masses,
        'interpretation':'These are theoretical kinematic results using nominal reference masses, NOT experimentally measured reaction energies. Uncertainties not propagated because covariance is not supplied here.',
        'p_t_to_n_h':{'Q':ma+mA-mb-mB,'threshold':Tth,
                      'threshold_exact_state':context(ma,mA,mb,mB,Tth),
                      'near_threshold_T_plus_1e_minus_6_context':context(ma,mA,mb,mB,Tth+D('1e-6')),
                      'T_1p1_context':p_t,'T_1p1_theta_lab_30_branches':p_t_lab30},
        'd_t_to_n_alpha':{},
        'n_p_elastic':{},
        'p_p_relativistic_elastic':{},
        'alpha_p_inverse_elastic':{}
    }
    for Ta in (ZERO,D('0.1')):
        c = context(masses['d'],masses['t'],masses['n'],masses['alpha'],Ta)
        physical['d_t_to_n_alpha'][f'projectile_T_{Ta}'] = {'context':c,'cm_angles':{
            '0':branch_from_u(c,ONE),'90':branch_from_u(c,ZERO),'180':branch_from_u(c,-ONE)}}
    c = context(masses['n'],masses['p'],masses['n'],masses['p'],'2')
    physical['n_p_elastic']={'projectile_T':2,'context':c,'cm_90':branch_from_u(c,ZERO)}
    c = context(masses['p'],masses['p'],masses['p'],masses['p'],'1000')
    physical['p_p_relativistic_elastic']={'projectile_T':1000,'context':c,'cm_90':branch_from_u(c,ZERO)}
    c = context(masses['alpha'],masses['p'],masses['alpha'],masses['p'],'10')
    physical['alpha_p_inverse_elastic']={'projectile_T':10,'context':c,
                                        'theta_lab_10_branches':independent_lab_roots(c,rad(10)),
                                        'max_lab_angle':deg(asin(masses['p']/masses['alpha']))}
    for family in synthetic.values():
        pass
    assert len(p_t_lab30) == 2
    return {
        'metadata':{'purpose':'Independent arithmetic and analytical reference fixtures',
                    'generated_by':'independent-review.py, Python standard library Decimal',
                    'precision_decimal_digits':80,
                    'displayed_oracle_significant_digits':50,
                    'not_experimental_data':True,
                    'does_not_import_application_engine':True,
                    'source_urls':[
                        'https://pdg.lbl.gov/2026/reviews/rpp2026-rev-kinematics.pdf',
                        'https://www-leland.stanford.edu/group/Zarelab/publinks/151.pdf',
                        'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
                        'https://www-nds.iaea.org/nrdc/nrdc_doc/iaea-nds-0208-201508.pdf']},
        'syntheticBenchmarks':synthetic,'physicalBenchmarks':physical}


if __name__ == '__main__':
    result = serialize(build_references())
    path = Path(__file__).resolve().parents[1] / 'tests' / 'independent-reference.json'
    path.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    print(f'Wrote {path.name}: {len(result["syntheticBenchmarks"])} independent calculation families.')
    print('p+t -> n+h threshold:',result['physicalBenchmarks']['p_t_to_n_h']['threshold'])
    for name in ('calculation05','calculation10'):
        item = result['syntheticBenchmarks'][name]
        print(name, json.dumps(item.get('expected',item.get('expected_branches')),indent=2))
