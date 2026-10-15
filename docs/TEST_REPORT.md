# Executed test report - v1.0.0

Generated UTC: 2026-10-14T15:17:08.148882+00:00. Final executed evidence: `reports/vitest-results.json`, `reports/playwright-results.json`, `reports/data-validation.json`, `reports/calculation-validation.json`.

## Actual totals

| Check | Executed | Passed | Failed | Not executed / skipped |
|---|---:|---:|---:|---:|
| Physics, units, data, independent oracle and export tests | 124 | 124 | 0 | 0 |
| React UI tests | 9 | 9 | 0 | 0 |
| Browser end-to-end tests | 6 | 6 | 0 | 0 |
| Total formal tests | 139 | 139 | 0 | 0 |

Data: 18 records; 18 documented; 0 incomplete metadata; 6 usable evaluated bare masses; 12 atomic records deliberately blocked for bare-nucleus kinematics.

Typecheck, pinned-data validation, production build, portable build and DOM build checks were executed successfully. Browser tests used Chromium153 via Playwright1.58.2. GitHub CI/deployment workflows and external institutional scientific review were not executed. Those are separate activities, not unexecuted assertions hidden inside the test totals. No deployment occurred.

## Comparison for all ten calculations

Values below are nominal arithmetic comparisons. Exactly specified mathematical masses and supplied model densities are synthetic references, not fabricated nuclear data. Independent expected values come from closed forms and the separate Decimal80 oracle.

| ID / calculation | Main equation | Data / methods source | Test case | Independent reference | Application | Absolute difference | Status | Limits |
|---|---|---|---|---:|---:|---:|---|---|
| 01 Reaction threshold | max(0, (Mf−Mi)(Mf+Mi)/(2mA)) | PDG2026; exact synthetic masses; Decimal80 oracle | m=2,3→3,3 | 1.8333333333333 MeV | 1.8333333333333 MeV | 0 MeV | PASS | Stationary target; no dynamics or Coulomb-accessibility claim. |
| 02 CM energy | KCM=√s−ma−mA (factorized implementation) | PDG2026; exact synthetic masses; Decimal80 oracle | m=1,1; projectile T=1; target stationary | 0.44948974278318 MeV | 0.44948974278318 MeV | 0 MeV | PASS | Massive on-shell incident particles; moving target supported. |
| 03 Nuclear recoil | Tf=pf²/(√(m²+pf²)+m) | PDG2026; exact 3-4-5 identity | m=4, initial p=0, transfer=(3,0,0) | 1 MeV | 1 MeV | 0 MeV | PASS | Specified frame and initial momentum; no impulse dynamics. |
| 04 Two-body kinematics | p*=√λ(s,mb²,mB²)/(2√s), Lorentz boost | PDG2026; exact equal-mass symmetry; Decimal80 | all masses=1000; T=600; CM90° | 300 MeV | 300 MeV | 0 MeV | PASS | Stationary target; labelled two-body products; fixed masses. |
| 05 Angle transformation | atan2(p* sinθ*, γ(p* cosθ*+βEb*)) | PDG2026 Lorentz boost; independent exact inverse-root algebra | m=4,1 elastic; T=3; lab asin(1/8), high branch | 41.066248911138 deg | 41.066248911138 deg | 7.105427357601e-15 deg | PASS | Multiple preimages retained; zero-momentum directions undefined. |
| 06 Outgoing detector energy | Etot√(p²+mb²)−Pp cosθ=(s+mb²−mB²)/2 | PDG2026; independent equal-mass lab45 closed form | all masses=1000; T=600; lab45° | 260.86956521739 MeV | 260.86956521739 MeV | 1.1368683772162e-13 MeV | PASS | Lab detector angle; all directed physical roots, no detector response. |
| 07 Momentum transfer | q=pi−pf; t=(Ei−Ef)²−q² | PDG2026 four-vectors; independent vector geometry | pi=(0,0,5), pf=(4,0,3), Ei=Ef=10 | 4.4721359549996 MeV/c | 4.4721359549996 MeV/c | 0 MeV/c | PASS | Same frame; t requires total energies, not just kinetic energies. |
| 08 Momentum balance | Δp=Σpin−Σpout; scale-aware floating-point tolerance | Independent vector sums; exact deliberate perturbation | (2,4,2) initial vs (2+1e−8,4,2) final | 1e-08 MeV/c | 9.9999999392253e-09 MeV/c | 6.0774709918447e-17 MeV/c | PASS | Floating-point closure; not an experimental confidence test. |
| 09 Differential cross-section transformation | J=D³/(γ\|1+r cosθ*\|); flab=ΣfCM,k Jk | PDG2026 boost, independent derivative; supplied synthetic densities | m=4,1 elastic; T=3; lab0; supplied values1,1 mb/sr | 38.258064516129 mb/sr | 38.258064516129 mb/sr | 7.105427357601e-15 mb/sr | PASS | Supplied angular densities only; branch-resolved inverse; singular folds withheld. |
| 10 Coulomb barrier & penetration model | VC=Z1 Z2 α ħc/R; PG=exp(−2πη) | CODATA2022 α; exact SI h,c,e; IAEA LEXFOR; synthetic R,m | Z1=Z2=1, m1=m2=1000, Erel=.01, R=5fm | 0.28799290937205 MeV | 0.28799290937205 MeV | 0 MeV | PASS | Classical contact barrier; nonrelativistic l=0 model, not reaction probability. |

Acceptance bounds are recorded numerically per row in the JSON. Additional tests cover all calculation-specific valid/invalid inputs, boundary cases, unit constructors, physical laws and nominal physical reaction benchmarks; test titles in the execution JSON are the authoritative cases.

## Browser cases actually executed

- desktop overview, navigation, data and computed charts work without console errors - PASS
- two branches, threshold state, invalid reaction, and empty input guarded - PASS
- cross-section values are explicit and PNG, CSV, PDF downloads are real - PASS
- mobile layout supports Arabic, theme toggle, and collapsible navigation - PASS
- Coulomb model inputs and moving target CM calculator work - PASS
- standalone HTML operates without any network requests - PASS

## Failures found and resolved

- A unit roundtrip used1J outside the declared nuclear-energy numerical range; the test was corrected to a valid in-range SI energy.
- Independent review found threshold snapping, small-energy cancellation, ghost roots, ill-conditioned invariant/gamma and extreme Coulomb nonfinite values. Numerical methods were corrected and regression cases incorporated.
- React tests caught a null-radius chart dereference and missing symbol search; these were fixed. A test expectation was aligned to the first explicitly required input.
- Browser setup initially encountered an unavailable/truncated Chrome download and Vite network-interface enumeration restrictions. A complete local Chromium distribution and loopback host resolved the environment issues.
- Browser offline test caught JavaScript replacement-string expansion when embedding a bundle. Functional replacement fixed the standalone file; final offline test passed without network requests.
- A structural regex falsely matched a script tag inside bundled JavaScript text. DOM parsing now checks actual HTML script and stylesheet elements.
- Visual QA caught a sidebar transition crossing the mobile RTL viewport and overly long raw result text. Closed mobile navigation is hidden; displayed numbers are consistently rounded, while CSV result columns preserve snapshot values.

Final assertion failure count is zero; development failures are not concealed. See `docs/KNOWN_LIMITATIONS.md` for remaining scope restrictions, unavailable covariance, atomic-mass conversion limits and missing external review.

Reproduce with the commands in README. The JSON records and independently generated references are included in the source ZIP.
