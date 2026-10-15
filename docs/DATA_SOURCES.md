# Data sources and import evidence

Audit date: 2026-10-14. The original AMDC evaluation page lists AME2020; NIST states CODATA2022 is its latest completed recommended adjustment and identifies2026 as the next scheduled adjustment. PDG's current2026 kinematics review was also checked. These are verified editions on this retrieval date, not a promise of automatic updates.

| Source | Version / publication | Imported content | Verification / distribution |
|---|---|---|---|
| NIST CODATA | 2022; May2024 constants table | Six bare nuclear rest energies, individual uncertainties, u↔MeV, α, h,c,e and electron constant | Original official ASCII table fetched; SHA256 stored; selected numerical facts distributed |
| AMDC Atomic Mass Evaluation | AME2020; March2021 | Twelve evaluated neutral atomic masses and uncertainties | Original `mass_1.mas20` rows, line numbers and SHA256 retained; atomic masses catalog-only |
| PDG | 2026 edition; kinematics reviewed August2021 | Lorentz/invariant/two-body methods | Official review inspected; independently implemented formulas |
| IAEA LEXFOR | IAEA-NDS-208 Rev2015/08 §A.7 | Gamow exponential versus S-factor distinction | Primary definitions consulted; no experimental rows imported |
| Catchen, Husain & Zare | Journal of Chemical Physics,1978 | Multivalued CM/lab scattering context | Original author-hosted PDF consulted; does not supply our nuclear masses |
| Hwang et al. | arXiv2302.10102,2023 | Limits of conventional Gamow interpretation | Primary paper consulted; model integral independently derived |
| EXFOR / NNDC | No numerical import | None | No experimental cross section or evaluated excitation level attributed to these sources |

The six directly evaluated values are in MeV/c²:

| Species | Rest mass | Individual standard uncertainty |
|---|---:|---:|
| proton |938.27208943|0.00000029|
| neutron |939.56542194|0.00000048|
| deuteron |1875.61294500|0.00000058|
| triton |2808.92113668|0.00000088|
| helion |2808.39161112|0.00000088|
| alpha |3727.3794118|0.0000012|

Neutral atoms:1H,2H,3H,3He,4He,6Li,7Li,7Be,12C,13C,14N,16O. Each has source version, URL, retrieval date, data status, Z,A, mass type, original AME record and uncertainty. These **12 are complete atomic records** but deliberately have no usable bare-nucleus mass. The missing electron correction is not encoded as zero. Dataset:18 documented records,6 usable bare masses,12 restricted atomic records,0 incomplete metadata records.

## Electron handling

For a neutral atom, m_nucleus=m_atom−Z me+Be/c². Omitting Be is not an exact conversion. No verified isotope-specific total electronic binding/covariance correction is bundled; therefore the corresponding bare mass is withheld. Light bare masses come directly from CODATA. User custom input is clearly marked unverified and must itself represent a bare nucleus.

## Reproducible import

Run `python3 scripts/import_data.py`, or `--refresh` to refetch both original tables. The script parses the published AME fixed-column format, rejects extrapolated '#' records in the curated subset, requires exactly18 selected records, and stores hashes. A change to a pinned official file requires review and an explicit importer update. Complete upstream files stay in `.cache/` and are excluded from the ZIP. `npm run data:validate` checks required metadata, finite positive masses, nonnegative uncertainties, IDs and atomic restrictions.

The imported values are factual numerical selections, attributed to the evaluation. Cite Huang et al., Chinese Physics C45 030002(2021), and Wang et al., CPC45 030003(2021), as AMDC requests. No blanket MIT relicensing of scientific data is asserted. No permission to copy a full protected database is inferred. NIST source usage follows its official content policy; dependencies retain their own licenses.

Official URLs are retained in `src/data/sourceRegistry.ts`. Source download hashes and actual validation output are in `reports/data-validation.json`.
