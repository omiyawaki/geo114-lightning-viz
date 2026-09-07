# Build GEO 114 Lab 5 lightning ingredients viewer (v1)

Repo: /workspace/geo114-lightning-viz
GitHub Pages: https://omiyawaki.github.io/geo114-lightning-viz/
Branch: main. You MUST implement, commit, and push. Do not stop after reading/planning.

Sister tool (tone + wizard UX patterns to learn from, not copy jargon): https://omiyawaki.github.io/geo114-cape-viz/ and if present on disk /workspace/geo114-cape-viz/

## Read first (required)
Read ALL files in `voice-examples/` (real GEO 114 lab/activity text). Match that student-facing voice: relaxed, direct, full sentences — not artificially sparse, not a technical manual, not internal pedagogy jargon.

Ban as student-visible labels: Orient, Ask, Evidence, Claim, Observe, Notice, Scaffold, Wizard, Beat.

## Pedagogical goal
Students explore which atmospheric quantities line up with lightning and learn that **one ingredient alone is usually not enough**. They should have room to pick poorly, see mismatches, and explain why. The lab is about thinking what matters — not following a script that names the “right” variables up front.

## CRITICAL: open-ended variable choice
Do **NOT** tell students specifically to look at CAPE or precip in early steps.
- CAPE, precip, CIN, precipitable water, mid-level RH (and any other sensible fields you include) are **equal options in a menu**.
- Step copy should say things like “pick a field” / “try another field” — never “now look at CAPE” or “now look at precip.”
- Multi-field operations unlock later; still do not prescribe which pair to multiply.

## Wizard spine (gated)
Map always visible. Controls unlock per step.

1. **Lightning** — Where is lightning active on this map / at this time? Describe regions. (Lightning density layer on; other fields off or dim.)
2. **Try one field** — Pick any single field from the menu. Predict whether it should line up with lightning, then show it. Write what matches and what doesn’t.
3. **Try another single** — Pick a *different* field. Same: predict → show → note misses. (Still no multiply.)
4. **One more single (optional feel, still gated)** — Or merge into step 3 as “try at least two different singles before unlocking combos.” Prefer requiring ≥2 distinct singles tried before step 5 unlocks.
5. **Unlock combinations** — Now A + B + operation: show A, show B, or A×B (optional: simple threshold so product only where both are “high”). Explore freely. Document attempts that fail.
6. **Best story** — Which single or combo lined up best? Which failed and why? Why isn’t one ingredient enough?

Progress dots / Next-Prev like the CAPE tool. Keep chrome minimal: title like “Lightning” or “Ingredients” — no GEO 114 / course banner.

## Shared case (bake into the app)
**30 September 2025, 00 UTC**, global (or nearly global) map, centered near 0° lon so it pairs with Blitzortung-style views from the old lab.

Bake grids as static assets in the repo (JSON / binary / tiles — keep payload reasonable; coarsen to ~1–2° if needed). Prefer real ERA5 if you can fetch from public ARCO/GCS (`gcp-public-data-arco-era5`) for that date; otherwise generate **pedagogically honest synthetic** fields where:
- Lightning clusters in a few regions (e.g. tropics / afternoon continents)
- Some high-CAPE regions lack lightning; some precip regions lack lightning
- A product of instability-like × moisture/precip-like fields aligns better than either alone
Document in README which data path you used.

Minimum fields in the menu (all choosable, none prescribed by the wizard text):
- CAPE (or similar instability)
- Total precipitation or precip rate
- CIN
- Precipitable water
- Mid-level relative humidity (~700 hPa)
- Lightning density (truth layer; always available for comparison)

Optional extras if easy: 2m temperature, surface pressure, wind speed — only if they don’t clutter.

## Operations (unlock late)
- Show field A only
- Show field B only  
- A × B (normalize or use sensible units; document)
- Optional: mask/product only where A and B exceed simple student-tunable thresholds

## Handout stub
Add `Lab5-lightning-handout.md` mirroring the steps with answer blanks (Name/Date, Nexus turn-in note). Open-ended: “which field did you try?” not “plot CAPE.”

## Implementation notes
- Static site: HTML/CSS/JS (Canvas or similar). No build step required if possible; or minimal Vite if you prefer — Pages must work.
- Mobile-ish usable but desktop-first (lab laptops).
- Color scales with units; legend; coastline or land mask for geographic reading.
- README: how to run locally, Pages URL, case time, field list, open-ended pedagogy note.

## Finish checklist
1. Working site on `main` pushed to origin
2. Enable/fix GitHub Pages if needed (static from root or `/docs`)
3. No student-visible framework jargon; no prescribed CAPE/precip in step prompts
4. Multiply gated until after singles exploration
5. Commit with a clear message; print commit hash + how to open the site

If you catch yourself only reading files — stop and IMPLEMENT.
