# Reaction kinematics and supported frames

For a+A→b+B, input masses refer to bare nuclear ground states; optional user residual excitation increases mB by Ex/c². a points along +z, target A is stationary. The observed product lies in the x-z plane; unprovided azimuth is fixed to zero by rotational symmetry. A full out-of-plane moving-target final-state solver is not implemented.

At threshold, both products have zero relative CM momentum. In lab they can still carry the common CM boost, so a zero-CM-kinetic threshold is not a zero-lab-kinetic product condition. This is independently checked using mathematical masses2,3→3,3: Tth=11/6MeV, each final product T=5/12MeV.

## Stable inversion

Define W=√s, P=√[T(T+2ma)], E=ma+mA+T, C=W Eb*, A=s+P²sin²θ and d=s p*²−mb²P²sin²θ. The momentum equation yields p±=(CPcosθ±E√d)/A. Rather than subtracting nearly equal roots, use a stable quadratic q and obtain the other root through Cquadratic/q. The quadratic constant is (mbP−Wp*)(mbP+Wp*); for exact equal-mass elastic scattering it is identically zero.

Negative discriminants beyond the scale-dependent rounding bound indicate no solution. Directed angle limits are checked before root acceptance. Exact folds return one repeated root. Candidates with zero lab momentum have no detector direction; negative roots or those failing E√(p²+mb²)−Pp cosθ=C are rejected. Residual product E>=mB and an independent kinetic-energy closure check are required.

For elastic inverse kinematics with ma=mb=4 and mA=mB=1, T=3, lab0 has two branches: Tb=3 and27/31MeV. The maximum lab angle is asin(1/4)=14.477512...deg; lab15 is forbidden. For equal-mass elastic scattering, the CM180 endpoint has outgoing lab p=0 and no directed lab angle; it must not be assigned90deg.

## Scope by frame

| Operation | Stationary target | Moving target |
|---|---|---|
| CM invariant/initial kinetic energy | Supported | Supported with target T and opening angle |
| Threshold | Supported | Not implemented; no automatic NR substitution |
| Two-body lab final state | Supported | Not implemented |
| CM/lab angle and cross-section mapping | Supported | Not implemented |
| Recoil from explicit vectors | Supported | Supported initial nucleus momentum |
| Momentum transfer and closure | Any specified common frame | Any specified common frame |

The app does not assert channel dynamics, spin selection, interaction rates, detector efficiency, target energy loss or finite angular-bin integrals. Products of identical species are labelled for kinematics; no symmetrized amplitude or combinatorial cross-section correction is predicted.
