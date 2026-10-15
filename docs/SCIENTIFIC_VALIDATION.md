# Scientific validation strategy

Expected values come from three independent sources: exact elementary algebra/geometric symmetry, an independent Python Decimal80 arithmetic implementation, and direct nominal evaluated CODATA masses. The Python script imports no application code. Its exact-mass examples are explicitly synthetic mathematical examples; none is presented as measured nuclear data.

`tests/physics/01` to`10` test the ten distinct functions separately. Shared `units-data`, `benchmarks`, `report` and `validation-table` cover dimensions, source restrictions, quantum numbers, nominal physical benchmarks and export consistency. Conservation tests independently recompute E and momentum component sums and product mass shells rather than merely reading the engine's reported pass status.

Examples include neutron-proton, neutron-alpha, proton-alpha, alpha-neutron inverse kinematics, D+T and both D+D exit channels, endothermic p+t→n+3He, alpha-alpha and relativistic proton-proton elastic scattering. Exact test cases cover heavy-to-light synthetic inverse kinematics, equal masses, forward/90/backward directions, below/at/above threshold, moving incident target, zero/very small momentum, multiple branches, forbidden angles, invalid/missing data, units and numerical conditioning.

Selected physical nominal-input references:

- p+t→n+3He threshold:1.0190474528620662MeV.
- Same reaction at Tp1.1MeV, lab30deg: neutron T=0.15642497068043320 and0.0035630691225446210MeV.
- D+T at Td0.1MeV, CM90deg: neutron T=14.084300187641987MeV; alpha T=3.6049477523580127MeV.
- Equal-mass relativistic p+p at Tp1000MeV, CM90deg: each product kinetic energy500MeV.

These long digits are **nominal arithmetic oracle values**, not measured uncertainties or experimental reaction energies. Their actual application differences and acceptance thresholds are in `reports/calculation-validation.json`, and the complete executed comparison table is generated in `docs/TEST_REPORT.md`.

An independent read-only computational review identified low-energy cancellation/ghost roots, invalid threshold snapping, undefined endpoint status, extreme Coulomb nonfinite outputs and unresolved-invariant gamma issues. Corrected regression tests were incorporated into the main suite. Additional ad hoc probes are not counted as Vitest tests and do not substitute for formal evidence.

No external institutional scientific validation was performed. Tests demonstrate correctness on defined cases and conservation within stated numerical policies; they do not guarantee universal physical completeness or experimental prediction accuracy.
