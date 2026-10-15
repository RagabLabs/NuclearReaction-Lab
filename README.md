# Nuclear Reaction Lab v1.0.0

An independent, browser-local nuclear collision workspace by RagabLabs. Ten calculators cover thresholds, CM energy, recoil, complete two-body final states, angle transformations, detector energies, momentum transfer, vector closure, differential-density frame conversion and Coulomb model estimates.

This is a **review release**, with executed scientific, interface and browser evidence in `reports/`. It is educational/research support, not externally certified operational software. See the actual final counts in `docs/TEST_REPORT.md`; a production build alone does not establish scientific correctness.

## Use immediately

Open **`dist-portable/NuclearReaction-Lab.html`** by double-clicking it in a modern desktop browser. It embeds the application, evaluated data, chart library, formula fonts and styles. It needs no server or internet connection. Source and GitHub Pages output are included separately.

For development, Node >=22.12, npm, Python3 and a browser are needed:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite; the base path is `/NuclearReaction-Lab/`. Select a documented example in Complete Analysis. D+T is initially loaded as an explicitly labelled teaching example. Cross-section values and contact radii remain blank until entered. The Coulomb example loader labels its radius as an assumption, not a measurement.

## Reproduce validation

```bash
npm run data:validate
npm run typecheck
npm test
python3 scripts/independent_reference.py
npm run build
npm run verify:build
npx playwright install --with-deps chromium
npm run test:e2e
```

`npm test` runs **all** Vitest files in a single process invocation. The independent Decimal80 oracle does not import the application; its long digits are arithmetic references, not physical uncertainty estimates. `npm run test:science` and `npm run test:ui` are optional subsets. Keep the complete-run JSON evidence when reporting totals.

## Scientific scope

- Exact relativistic two-body calculations use **stationary bare-nucleus targets**. Moving targets are supported in the CM-energy calculator; recoil accepts an arbitrary initial vector. Full moving-target angle and density mapping is outside v1.
- Six evaluated CODATA2022 bare masses: proton, neutron, deuteron, triton, helion and alpha. Twelve AME2020 neutral-atom masses are catalog-only. No electron binding correction or approximate mass substitution is invented. Custom bare masses are explicit, unverified user inputs.
- Product excitation is entered in MeV and added to residual rest energy. Nuclear charge and baryon number must balance. No spin, parity, reaction rate or channel dynamics are inferred.
- Both physical lab-angle branches are retained. Zero outgoing momentum has no direction. CM directions at threshold and singular pointwise Jacobians are withheld.
- Cross-section transformation requires supplied values for each branch. An inclusive unresolved lab density cannot uniquely be inverted; branch-resolved inverse input is required. No EXFOR experimental cross sections are bundled.
- Contact barrier and penetration factors are model estimates, not fusion probabilities. Joint mass uncertainty is not propagated without covariance.
- CSV and English scientific PDF reports use a shared current-result snapshot. PNG captures the displayed computed chart. English output avoids unreliable PDF rendering of Arabic with built-in fonts; the application itself supports Arabic and RTL.

## Source layout

`src/physics/` contains a typed, independently testable engine. `src/data/nuclear-data.json` holds sources, uncertainties, original AME record lines and source-file SHA256 hashes. `scripts/import_data.py` fetches and validates the pinned official editions; upstream complete tables stay in ignored `.cache/`, while only the selected numerical facts are distributed. `src/data/sourceRegistry.ts` records methods sources and reuse notes.

`tests/physics/` holds independent references, conservation, units, boundaries, numerical regressions and export checks. `tests/ui/` checks actual React behavior. `tests/e2e/` checks desktop/mobile, downloads and offline operation. `docs/` describes formulas, precision, limits, uniqueness and results. `dist/` is the static GitHub Pages build; `dist-portable/` contains the embedded HTML and a relative-path build.

## GitHub Pages

No repository has been created or published. Create **NuclearReaction-Lab** in your own account when you decide to publish. Upload the **contents** of this source directory (including `.github/`, lockfile, data and tests), excluding `node_modules`, `.cache` and prebuilt `dist` directories if you prefer builds in CI. In repository Settings -> Pages, choose **GitHub Actions**. Then run the **Publish GitHub Pages (manual only)** workflow. It validates data, typechecks, runs scientific/UI/browser tests, builds and deploys `dist/`.

Deployment is deliberately **manual**, via `workflow_dispatch`, to preserve the requested review before publication. Ordinary pushes run CI only. Expected URL: `https://<your-username>.github.io/NuclearReaction-Lab/`. If the repository name changes, change `base` in `vite.config.ts` and regenerate the build. The workflow was authored and inspected locally, but has not been executed on GitHub in this session.

## License and references

Application code: MIT, see `LICENSE`. Evaluated numerical facts retain source attribution; the software license does not relicense third-party scientific content or bundled dependency licenses. See `THIRD_PARTY_NOTICES.md`, `docs/DATA_SOURCES.md` and `src/data/sourceRegistry.ts`. No API keys or paid service are required.
