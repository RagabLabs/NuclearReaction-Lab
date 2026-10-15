# Scientific methods

All internal formulas use c=1, with numerical mass values in MeV/c², energy in MeV and momentum in MeV/c. These numerical equivalences never allow a typed energy argument to be passed where a mass or momentum is required. Public constructors convert u, kg, joules, keV, GeV, SI momentum and degrees explicitly.

The Lorentz metric is (+---). For on-shell incident particles, E=m+T and p=√[T(T+2m)]. Stationary target: s=(ma+mA)²+2mA T and W=√s. Initial CM kinetic energy is **W−ma−mA**, while the final-state kinetic energy available is **W−mb−mB**. Neither is the total energy W. See PDG2026 Kinematics Eqs49.1-49.7 and49.16-49.17.

1. **Threshold.** The lowest allowed final invariant mass is Mf=sum(final rest masses). Requiring s>=Mf² yields Tth=max[0,(Mf−Mi)(Mf+Mi)/(2mA)]. This includes collective lab recoil at threshold. The nonrelativistic comparison omits the δm²/(2mA) term, and its fractional discrepancy with the exact threshold is reported. No reaction strength or barrier crossing is inferred.
2. **CM energy.** Arbitrary initial target kinetic energy and the opening polar angle are accepted. s=(pa+pA)². Stable excess invariant is 4ma mA sinh²[(ya−yA)/2]+4pa pA sin²(ψ/2), where y=asinh(p/m). Divide this excess by W+ma+mA for KCM. A stationary target routes directly to the factorized formula.
3. **Recoil.** Apply the explicit transfer vector to the initial nucleus momentum. Compute final T by p²/[√(m²+p²)+m]; subtract initial T using compensated addition. A signed energy change may be negative. NR T=p²/(2m) is a comparison whose relative difference is computed.
4. **Two-body final state.** In CM, products have opposite momenta of magnitude √λ/(2W). Boost both products to the lab. The residual vector is reconstructed from total lab momentum and independently checked with on-shell energy; product kinetic energies and conservation residuals are reported.
5. **Angle transformation.** Use atan2 of boosted transverse and longitudinal momentum. Invert by the full lab-angle root equation, retaining every physically directed solution. Undefined directions are marked explicitly, including a product at rest in the lab.
6. **Detector energy.** At fixed lab angle, solve Etot√(p²+mb²)−Pp cosθ=C where C=W Eb*. Stable roots of the quadratic are validated in the unsquared equation, on-shell residual state, nonnegative momentum and energy closure. A detector observation may have two energies or no solution.
7. **Momentum transfer.** q=pi−pf is a three-vector, frame-dependent, in MeV/c. t=(Ei−Ef)²−q² is Lorentz-invariant, in MeV² when c=1. Both total energies must be explicitly supplied or derived from the reaction state. Kinetic energies alone cannot replace total energies.
8. **Momentum closure.** Sum independent vectors component by component with compensated sums, then subtract. The tolerance depends on total individual vector magnitudes, arithmetic operation count and machine epsilon. It measures numerical closure, not statistical agreement of measurements.
9. **Angular density.** In an axisymmetric two-body stationary-target boost, dσ is unchanged while dΩ transforms. Derive J=|dΩCM/dΩlab| as described below. Supplied angular densities at each preimage are kept distinct. Unresolved branches sum in lab; inverse transformation requires branch-resolved values.
10. **Coulomb estimates.** User supplies a contact R (or r0 model). VC=Z1 Z2 α ħc/R; η=Z1 Z2 α√[μ/(2Erel)] and PG=exp(−2πη). This leading suppression is not a cross section: an S-factor/nuclear dynamics is still missing. Finite-radius l=0 WKB integrates only the Coulomb tail outside R. No potential inside contact is assumed.

## Relativistic angular Jacobian derivation

Let u=cosθ*, r=β Eb*/p*, g=γ and D²=1−u²+g²(u+r)². The lab cosine is g(u+r)/D. Differentiation gives d cosθlab/du=g(1+ru)/D³. Axisymmetry preserves azimuth, so J=D³/[g|1+ru|]. The absolute value is necessary on both branches. If r>1, the fold lies at u=−1/r and θmax=atan2(1,g√(r²−1)). J is singular there; no finite pointwise value is fabricated. At p*=0, the CM direction itself is undefined. At D=0, the lab direction is undefined.

## Finite-radius Coulomb WKB derivation

For V(r)=k/r, k=Z1 Z2 α ħc, and 0<E<VC, the turning point is rt=k/E. The radial leading WKB factor is exp[-2∫R^rt √(2μ[V(r)−E]) dr/(ħc)]. Substitution r=rt sin²φ gives exponent −4η[acos√x−√(x(1−x))], x=E/VC. As R approaches zero it tends to the point-Coulomb Gamow exponential. Close to x=1, turning points coalesce and leading WKB is not quantitatively reliable; it is an indicative model only. Above contact barrier this sub-barrier estimate is withheld.

Penetration is disabled for E/μ>=0.01 as a **software model policy**, not a universal theorem of validity. Below 10^-12 MeV nonzero penetration values are withheld to avoid numerical extremes; the explicit E=0 limit is separately labelled. Neutral entrance channels have no repulsive Coulomb-barrier estimate.

References: PDG2026 Kinematics; IAEA LEXFOR2015/08 §A.7; Hwang et al., arXiv2302.10102 for limits of the Gamow interpretation. The Jacobian and finite-radius integral are derivations in this project, not claims of an experimentally evaluated cross-section table.
