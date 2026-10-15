# Numerical precision

Arithmetic uses JavaScript IEEE754 binary64. Unit branding in TypeScript prevents dimensional mixing at compile time; runtime constructors reject nonfinite, negative or out-of-range values. A result is not made scientifically accurate by decimal formatting or by high-precision arithmetic alone.

The engine uses factorized threshold mass differences, compensated mass/vector summations, rationalized kinetic energies, positive Källén factors, rapidities for moving-beam relative energy, stable quadratic roots and unsquared physical-root checks. The rest-mass-scale subtraction that formerly erased small kinetic energy is not used.

For an endothermic channel, excess invariant is computed from T−Tth. For an elastic/exothermic channel it is (Mi−Mf)(Mi+Mf)+2mA T. Thus exactly specified positive elastic kinetic energies are not automatically snapped to threshold using a rest-energy-scale tolerance. Regression tests cover nuclear-scale T=10^-15 to10^-8MeV and inverse-kinematics branch energies with independent closed forms.

Momentum closure uses a scale S=sum of individual |p|, a relative bound128 epsilon*S, and an operation-count term32 epsilon*(n+1)*S. Numerical residuals and tolerance are displayed separately. This is a floating-point consistency estimate, not a user-independent fixed momentum cutoff or a propagated measurement error.

When reconstructing E²−p² from ultra-relativistic components, the rest invariant can fall below component rounding resolution. `invariant()` rejects that case; it does not report a fabricated zero mass. `velocity(v,knownMass)` uses E/m for gamma and marks when beta rounds to1. A known-mass gamma is distinct from an independently reconstructed invariant check.

## Numerical policy bounds

- Positive mass:10^-9 to10^8 MeV/c². Photons/massless species are outside v1.
- Energy constructor:0 to10^9MeV, including total quantities passed through it.
- Momentum component absolute value:<=10^10MeV/c.
- Polar angle:0..180deg, explicitly converted to radians.
- Coulomb radius:10^-9..10^6fm; charge integer0..200.
- Coulomb penetration: nonzero E>=10^-12MeV and E/μ<0.01; zero-energy limit is explicitly labelled. These are software validation policies, not physical discontinuities.
- Folds within10^-10deg of the computed maximum are treated as a repeated root; pointwise Jacobians close to a zero derivative are withheld. No finite angular detector-bin integration is claimed.

Display uses six significant digits and scientific notation for small/large values. Full reference values appear in the data explorer with their standard uncertainties. CSV preserves current raw numeric result values for reproducibility; those extra digits do not imply experimental accuracy. The separate Decimal80 oracle checks nominal-input arithmetic independently and is not used as an application computation backend.
