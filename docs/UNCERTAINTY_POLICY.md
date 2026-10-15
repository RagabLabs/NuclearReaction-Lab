# Uncertainty policy

Four different notions are separated:

| Category | What is stored or displayed | What is not claimed |
|---|---|---|
| Reference data uncertainty | Individual evaluated mass standard uncertainties and source/version | Joint result uncertainty without covariance |
| Physical approximation error | Exact-vs-NR difference for recoil/threshold; explicitly named Coulomb models and validity policy | A measured confidence interval for an assumed radius or WKB factor |
| Numerical error | Energy/momentum residuals, scale-based vector tolerance, conditioning guards and independent comparisons | Exact symbolic arithmetic or universal worst-case error bounds |
| Presentation rounding | Six significant digits and scientific notation | Extra physical precision merely because many digits can be printed |

CODATA mass values are correlated through the adjusted constants and underlying measurement network. AME covariance may also matter. Although AMDC offers a primary-nuclide covariance archive, this release has not imported, matched or validated it. **We do not assume independent masses** when propagating uncertainty: no combined kinematic uncertainty is currently computed.

A zero standard uncertainty for neutral12C in u reflects its defining atomic-mass convention; it does not make a derived MeV bare-nucleus mass exact. The u↔MeV conversion itself has an evaluated uncertainty. Custom masses and excitation inputs have no assumed standard uncertainty, no verified source and no hidden zero covariance.

Results near thresholds or angular folds can be highly sensitive to input mass/energy uncertainty. The numerical root count reflects nominal values only. A small numerical residual proves nominal computational consistency; it does not prove that the nominal reaction branch can be experimentally resolved. CSV/PDF carry this policy with the actual source masses, input values and warnings.
