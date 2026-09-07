# Lightning ingredients

Student lab tool for GEO 114 Lab 5. Explore which atmospheric fields line up with lightning — and learn that **one ingredient alone is usually not enough**.

**Live:** https://omiyawaki.github.io/geo114-lightning-viz/

## Case
**30 September 2025, 00 UTC**, global view. Step 1 uses a **real Blitzortung** historical earth map; later steps overlay **real ERA5** fields on a map with **Natural Earth 110m** coastlines.

## How to run locally
No build step. From this folder:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/

Or serve `index.html` via any static file server (fetch needs http(s), not `file://`).

## What students do
Gated steps on the right; map always visible:

1. Describe where lightning is active on the **Blitzortung** historical map  
2–4. Try **single** ERA5 fields from an open-ended menu (predict → show → note misses)  
5. Unlock **combinations** (A, B, A×B, optional both-high mask) after ≥2 distinct singles  
6. Write the best story — and why one ingredient fails  

Early step text says “pick a field” / “try another field.” It does **not** prescribe CAPE or precip.

## Fields in the menu
All choosable; none prescribed by the wizard copy:

| Key | Field | Units | Source |
|-----|--------|--------|--------|
| — | Lightning (step 1) | Blitzortung historical image | limaps.org History 2025-09-30 00:00 |
| cape | CAPE | J/kg | ERA5 `convective_available_potential_energy` |
| precip | Total precipitation | mm (00Z hour) | ERA5 `total_precipitation` (m→mm) |
| cin | CIN | J/kg | ERA5 `convective_inhibition` (non‑negative in this extract) |
| pw | Precipitable water (TCWV) | kg/m² ≈ mm | ERA5 `total_column_water_vapour` |
| rh700 | Mid-level RH (~700 hPa) | % | Computed from ERA5 `temperature` + `specific_humidity` at 700 hPa |
| t2m | 2 m temperature | °C | ERA5 `2m_temperature` |

Strike **marks** on later steps are digitized from the same Blitzortung historical overlay (not a synthetic lightning model).

Operations (late): show A, show B, normalized A×B, or product only where both exceed student-tunable thresholds.

## Data path
**Real ERA5** for **2025-09-30 00 UTC**, coarsened to ~1°, baked in `data/grids.json`.

- Public ARCO raw NetCDF (no auth), e.g.  
  `https://storage.googleapis.com/gcp-public-data-arco-era5/raw/date-variable-single_level/2025/09/30/<variable>/surface.nc`  
  and pressure-level `.../date-variable-pressure_level/2025/09/30/<variable>/700.nc`.
- **Lightning:** Blitzortung/LiMaps historical earth image composited at `data/blitzortung-20250930-00z.png`, plus link to  
  https://www.blitzortung.org/en/historical_maps.php?map=0 (set 30 Sep 2025 · 00:00 UTC).  
  **Not** a participant API dump; **not** a synthetic lightning grid.
- **Coastlines:** Natural Earth 110m (`data/ne_110m_coastline.json`). The old fake land-mask edge sketch is gone.

Raw NetCDF downloads used for baking live under `data/raw/` (gitignored).

## Handout
`Lab5-lightning-handout.md` — Name/Date, Nexus turn-in, open-ended blanks (“which field did you try?”).

## Sister tool
Tone / wizard chrome patterns: https://omiyawaki.github.io/geo114-cape-viz/
