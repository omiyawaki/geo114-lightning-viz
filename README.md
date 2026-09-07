# Lightning ingredients

Student lab tool for GEO 114 Lab 5. Explore which atmospheric fields line up with lightning — and learn that **one ingredient alone is usually not enough**.

**Live:** https://omiyawaki.github.io/geo114-lightning-viz/

## Case
**30 September 2025, 00 UTC**, global map centered near 0° longitude (pairs with Blitzortung-style views from the old lab).

## How to run locally
No build step. From this folder:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/

Or just open `index.html` via any static file server (fetch needs http(s), not `file://`).

## What students do
Gated steps on the right; map always visible:

1. Describe where lightning is active  
2–4. Try **single** fields from an open-ended menu (predict → show → note misses)  
5. Unlock **combinations** (A, B, A×B, optional both-high mask) after ≥2 distinct singles  
6. Write the best story — and why one ingredient fails  

Early step text says “pick a field” / “try another field.” It does **not** prescribe CAPE or precip.

## Fields in the menu
All choosable; none prescribed by the wizard copy:

| Key | Field | Units |
|-----|--------|--------|
| lightning | Lightning density (truth layer) | relative |
| cape | CAPE | J/kg |
| precip | Total precipitation | mm |
| cin | CIN | J/kg |
| pw | Precipitable water | mm |
| rh700 | Mid-level RH (~700 hPa) | % |

Operations (late): show A, show B, normalized A×B, or product only where both exceed student-tunable percentile-ish thresholds.

## Data path
**Synthetic pedagogically honest grids** baked in `data/grids.json` (~2°). Not ERA5 for v1.

Design intent:
- Lightning clusters in classic tropical / afternoon-continent regions  
- Some high-CAPE regions (e.g. arid interiors) lack lightning  
- Some precip regions (e.g. midlatitude / ocean storm track) lack lightning  
- A product of instability-like × moisture/precip-like fields aligns better than either alone  

See `source` in `data/grids.json` for the same note.

## Handout
`Lab5-lightning-handout.md` — Name/Date, Nexus turn-in, open-ended blanks (“which field did you try?”).

## Sister tool
Tone / wizard chrome patterns: https://omiyawaki.github.io/geo114-cape-viz/
