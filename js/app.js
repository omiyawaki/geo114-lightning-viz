/**
 * Lightning ingredients viewer — gated steps, open-ended field menu.
 * Multiply unlocks only after ≥2 distinct singles tried.
 */

const FIELD_ORDER = ["cape", "precip", "cin", "pw", "rh700"];
const FIELD_KEYS_ALL = ["lightning", ...FIELD_ORDER];

const STEPS = [
  {
    id: "lightning",
    title: "Lightning",
    ask: "Look at the map for 30 September 2025 at 00 UTC. Where is lightning active right now?",
    evidence: [
      "Scan the globe (centered near 0° longitude — same framing as Blitzortung-style maps).",
      "Name a few regions where lightning density looks high, and a few where it looks quiet.",
      "Jot a short description in the box below before you move on.",
    ],
    claim: "Where is lightning most active at this time? Why might that make sense?",
    mode: "lightning-only",
  },
  {
    id: "single-1",
    title: "Try one field",
    ask: "Pick any single field from the menu. Before you show it, predict whether it should line up with the lightning pattern.",
    evidence: [
      "Choose one field — any field. The menu does not rank them for you.",
      "Predict: should this field match lightning well, partly, or poorly?",
      "Turn the field on. Note where it matches lightning and where it misses.",
    ],
    claim: "Which field did you try? What matched, and what didn’t?",
    mode: "single",
  },
  {
    id: "single-2",
    title: "Try another",
    ask: "Pick a different field than last time. Same routine: predict, show, then note the misses.",
    evidence: [
      "Choose a second field you have not already leaned on.",
      "Predict how it should relate to lightning, then show it.",
      "Compare this field’s story to your first try. Still no combining yet.",
    ],
    claim: "Second field: what lined up, and what failed?",
    mode: "single",
  },
  {
    id: "single-3",
    title: "One more single",
    ask: "Optional but useful: try one more single field, or revisit an earlier one with a sharper eye. Combinations stay locked until you have tried at least two different singles.",
    evidence: [
      "If you have only tried one field so far, pick a second now — that unlocks combinations.",
      "If you already tried two, you can explore a third or press Next.",
      "Keep asking: is one ingredient enough?",
    ],
    claim: "Anything new after another single look?",
    mode: "single",
  },
  {
    id: "combos",
    title: "Combinations",
    ask: "Now you can put two fields together. Show A, show B, or multiply them. Still no script for which pair is “correct.”",
    evidence: [
      "Pick field A and field B from the menu.",
      "Try A only, B only, then A × B (and optionally “both high”).",
      "Document attempts that fail as carefully as ones that look good.",
    ],
    claim: "Which combo did you try? Did the product beat either field alone?",
    mode: "combo",
  },
  {
    id: "story",
    title: "Best story",
    ask: "Which single or combination lined up best with lightning? Which failed, and why isn’t one ingredient enough?",
    evidence: [
      "Look back at your notes from earlier steps.",
      "Name your best story in plain words — and one that looked promising but fell apart.",
      "Finish the handout blanks if you have them open.",
    ],
    claim: "Best single or combo: ______. Why one ingredient is not enough:",
    mode: "combo",
  },
];

const state = {
  step: 0,
  grids: null,
  flat: {},
  triedSingles: new Set(),
  memory: STEPS.map(() => ({ claim: "" })),
  view: { lon0: 0, scale: 1 },
  drag: null,
  display: null,
};

const $ = (id) => document.getElementById(id);

function flatIndex(iy, ix) {
  return iy * state.grids.nx + ix;
}

function valueAt(key, iy, ix) {
  return state.flat[key][flatIndex(iy, ix)];
}

function normalizeField(key) {
  const arr = state.flat[key];
  let min = Infinity,
    max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max <= min) max = min + 1;
  return { min, max, span: max - min };
}

function colorRamp(t, kind) {
  t = Math.max(0, Math.min(1, t));
  if (kind === "lightning") {
    // dark → gold → white
    const r = Math.round(20 + 235 * t);
    const g = Math.round(24 + 200 * t * t);
    const b = Math.round(40 + 80 * (1 - t));
    return [r, g, b, 255];
  }
  if (kind === "diverging") {
    // blue → pale → orange (for CIN-ish)
    if (t < 0.5) {
      const u = t * 2;
      return [Math.round(40 + 180 * u), Math.round(70 + 150 * u), Math.round(160 + 60 * u), 255];
    }
    const u = (t - 0.5) * 2;
    return [Math.round(220 + 20 * u), Math.round(160 - 80 * u), Math.round(80 - 40 * u), 255];
  }
  // sequential: deep navy → teal → yellow
  const stops = [
    [8, 29, 58],
    [29, 88, 120],
    [40, 140, 130],
    [180, 190, 80],
    [250, 230, 120],
  ];
  const x = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  const a = stops[i],
    b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
    255,
  ];
}

function combosUnlocked() {
  return state.triedSingles.size >= 2;
}

function markTried(key) {
  if (!key || key === "lightning") return;
  state.triedSingles.add(key);
  updateTriedStatus();
  refreshDots();
}

function updateTriedStatus() {
  const n = state.triedSingles.size;
  const el = $("triedStatus");
  if (!el) return;
  if (n === 0) el.textContent = "Tried so far: none yet.";
  else
    el.textContent =
      `Tried so far: ${[...state.triedSingles].map((k) => state.grids.fields[k].name).join(", ")}.` +
      (combosUnlocked() ? " Combinations unlocked." : " Try at least two different singles to unlock combinations.");
}

function populateSelects() {
  const opts = FIELD_ORDER.map(
    (k) => `<option value="${k}">${state.grids.fields[k].name} (${state.grids.fields[k].units})</option>`
  ).join("");
  $("fieldA").innerHTML = opts;
  $("fieldB").innerHTML = opts;
  $("fieldB").selectedIndex = 1;
}

function currentOp() {
  const r = document.querySelector('input[name="op"]:checked');
  return r ? r.value : "a";
}

function buildDisplay() {
  const g = state.grids;
  const step = STEPS[state.step];
  const showOutlines = $("showLightning").checked;
  let keyA = $("fieldA").value;
  let keyB = $("fieldB").value;
  let op = currentOp();
  let label = "";
  let units = "";
  let kind = "seq";
  const ny = g.ny,
    nx = g.nx;
  const out = new Float32Array(ny * nx);
  let min = 0,
    max = 1;

  if (step.mode === "lightning-only") {
    keyA = "lightning";
    op = "a";
    for (let i = 0; i < out.length; i++) out[i] = state.flat.lightning[i];
    ({ min, max } = normalizeField("lightning"));
    label = g.fields.lightning.name;
    units = g.fields.lightning.units;
    kind = "lightning";
  } else if (step.mode === "single" || (step.mode === "combo" && (op === "a" || !combosUnlocked()))) {
    if (!combosUnlocked() && step.mode === "combo") op = "a";
    for (let i = 0; i < out.length; i++) out[i] = state.flat[keyA][i];
    ({ min, max } = normalizeField(keyA));
    label = g.fields[keyA].name;
    units = g.fields[keyA].units;
    kind = keyA === "cin" ? "diverging" : "seq";
    markTried(keyA);
  } else {
    // combo ops
    const na = normalizeField(keyA);
    const nb = normalizeField(keyB);
    if (op === "b") {
      for (let i = 0; i < out.length; i++) out[i] = state.flat[keyB][i];
      ({ min, max } = nb);
      label = g.fields[keyB].name;
      units = g.fields[keyB].units;
      kind = keyB === "cin" ? "diverging" : "seq";
      markTried(keyB);
    } else if (op === "product" || op === "mask") {
      const ta = $("threshA").value / 100;
      const tb = $("threshB").value / 100;
      let pmin = Infinity,
        pmax = -Infinity;
      for (let i = 0; i < out.length; i++) {
        const an = (state.flat[keyA][i] - na.min) / na.span;
        const bn = (state.flat[keyB][i] - nb.min) / nb.span;
        let v = an * bn;
        if (op === "mask") v = an >= ta && bn >= tb ? v : 0;
        out[i] = v;
        if (v < pmin) pmin = v;
        if (v > pmax) pmax = v;
      }
      min = pmin;
      max = pmax <= pmin ? pmin + 1e-6 : pmax;
      label = `${g.fields[keyA].name} × ${g.fields[keyB].name}${op === "mask" ? " (both high)" : ""}`;
      units = "normalized product";
      kind = "seq";
      markTried(keyA);
      markTried(keyB);
    } else {
      for (let i = 0; i < out.length; i++) out[i] = state.flat[keyA][i];
      ({ min, max } = na);
      label = g.fields[keyA].name;
      units = g.fields[keyA].units;
      kind = keyA === "cin" ? "diverging" : "seq";
      markTried(keyA);
    }
  }

  state.display = { out, min, max, label, units, kind, showOutlines, keyA, keyB, op };
  $("layerLabel").textContent = label;
  $("legendUnits").textContent = units;
  drawLegend();
  drawMap();
}

function lonLatToPixel(lon, lat, w, h) {
  // equirectangular, centered on view.lon0
  let xlon = ((lon - state.view.lon0 + 540) % 360) - 180;
  const scale = state.view.scale;
  const x = ((xlon + 180) / 360) * w * scale + (w * (1 - scale)) / 2;
  const y = ((90 - lat) / 180) * h * scale + (h * (1 - scale)) / 2;
  return [x, y];
}

function pixelToLonLat(px, py, w, h) {
  const scale = state.view.scale;
  const x = (px - (w * (1 - scale)) / 2) / (w * scale);
  const y = (py - (h * (1 - scale)) / 2) / (h * scale);
  let lon = x * 360 - 180 + state.view.lon0;
  lon = ((lon + 540) % 360) - 180;
  const lat = 90 - y * 180;
  return [lon, lat];
}

function nearestCell(lon, lat) {
  const g = state.grids;
  let ix = Math.round((lon - g.lon_min) / g.resolution_deg[1]);
  let iy = Math.round((lat - g.lat_min) / g.resolution_deg[0]);
  ix = ((ix % g.nx) + g.nx) % g.nx;
  iy = Math.max(0, Math.min(g.ny - 1, iy));
  return [iy, ix];
}

function drawLegend() {
  const canvas = $("legendBar");
  const ctx = canvas.getContext("2d");
  const { kind, min, max, units } = state.display;
  const w = canvas.width,
    h = canvas.height;
  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    const [r, g, b] = colorRamp(t, kind);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, 0, 1, h);
  }
  $("legendUnits").textContent = `${fmt(min)} – ${fmt(max)} ${units}`;
}

function fmt(v) {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function drawMap() {
  const canvas = $("map");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 960;
  const cssH = Math.max(360, canvas.clientHeight || 480);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = cssW,
    h = cssH;

  ctx.fillStyle = "#071320";
  ctx.fillRect(0, 0, w, h);

  const g = state.grids;
  const { out, min, max, kind, showOutlines } = state.display;
  const span = max - min || 1;

  // Sample grid into image via nearest neighbor in lon/lat space
  const img = ctx.createImageData(Math.round(w), Math.round(h));
  const data = img.data;
  const iw = img.width,
    ih = img.height;

  for (let py = 0; py < ih; py++) {
    for (let px = 0; px < iw; px++) {
      const [lon, lat] = pixelToLonLat(px + 0.5, py + 0.5, w, h);
      if (lat < g.lat_min || lat > g.lat_max) {
        const i = (py * iw + px) * 4;
        data[i] = 7;
        data[i + 1] = 19;
        data[i + 2] = 32;
        data[i + 3] = 255;
        continue;
      }
      const [iy, ix] = nearestCell(lon, lat);
      const v = out[flatIndex(iy, ix)];
      const t = (v - min) / span;
      const land = state.flat.land[flatIndex(iy, ix)] > 0.5;
      let [r, gg, b, a] = colorRamp(t, kind);
      if (!land) {
        // darken oceans slightly so continents read
        r = Math.round(r * 0.72);
        gg = Math.round(gg * 0.78);
        b = Math.round(b * 0.9);
      }
      const i = (py * iw + px) * 4;
      data[i] = r;
      data[i + 1] = gg;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Coastline-ish: draw land mask edges
  ctx.strokeStyle = "rgba(240, 235, 220, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let iy = 1; iy < g.ny - 1; iy++) {
    for (let ix = 0; ix < g.nx; ix++) {
      const L = state.flat.land[flatIndex(iy, ix)];
      const Ln = state.flat.land[flatIndex(iy - 1, ix)];
      if ((L > 0.5) !== (Ln > 0.5)) {
        const lat = g.lats[iy];
        const lon = g.lons[ix];
        const [x0, y0] = lonLatToPixel(lon - 1, lat, w, h);
        const [x1, y1] = lonLatToPixel(lon + 1, lat, w, h);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
      }
    }
  }
  ctx.stroke();

  // Lightning contour outlines when overlay on
  if (showOutlines && STEPS[state.step].mode !== "lightning-only") {
    const ln = normalizeField("lightning");
    const thr = ln.min + 0.35 * ln.span;
    ctx.strokeStyle = "rgba(255, 230, 120, 0.75)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let iy = 1; iy < g.ny - 1; iy++) {
      for (let ix = 0; ix < g.nx; ix++) {
        const v = state.flat.lightning[flatIndex(iy, ix)];
        const vn = state.flat.lightning[flatIndex(iy - 1, ix)];
        if ((v >= thr) !== (vn >= thr)) {
          const lat = g.lats[iy];
          const lon = g.lons[ix];
          const [x0, y0] = lonLatToPixel(lon - 1, lat, w, h);
          const [x1, y1] = lonLatToPixel(lon + 1, lat, w, h);
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
        }
      }
    }
    ctx.stroke();
  }

  // Equator + prime meridian
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  {
    const [x0, y0] = lonLatToPixel(-180, 0, w, h);
    const [x1, y1] = lonLatToPixel(180, 0, w, h);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  {
    const [x0, y0] = lonLatToPixel(0, 90, w, h);
    const [x1, y1] = lonLatToPixel(0, -90, w, h);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderStep() {
  const spec = STEPS[state.step];
  const n = state.step + 1;
  $("stepTitle").textContent = `${n} ${spec.title}`;
  $("labPanel").dataset.step = String(n);
  $("stepAsk").textContent = spec.ask;
  $("stepClaim").textContent = spec.claim;
  $("claimBox").value = state.memory[state.step].claim || "";

  const ol = $("stepEvidence");
  ol.innerHTML = spec.evidence.map((t) => `<li>${t}</li>`).join("");

  const controls = $("fieldControls");
  const combo = $("comboBlock");
  if (spec.mode === "lightning-only") {
    controls.hidden = true;
  } else {
    controls.hidden = false;
    const unlocked = combosUnlocked();
    combo.hidden = !(spec.mode === "combo" && unlocked);
    $("fieldBlurb").textContent =
      spec.mode === "combo" && unlocked
        ? "Pick any pair. Multiply is available — still your choice which fields."
        : "Pick any field. Nothing here tells you which one is “right.”";
    $("lockBadge").textContent = unlocked ? "Combos open" : "Singles only";
    $("lockBadge").classList.toggle("open", unlocked);
  }

  if (spec.mode === "lightning-only") {
    $("lockBadge").textContent = "Lightning layer";
    $("lockBadge").classList.remove("open");
  }

  $("btnPrev").disabled = state.step === 0;
  const last = state.step === STEPS.length - 1;
  $("btnNext").disabled = false;
  $("btnNext").textContent = last ? "Done" : "Next";

  // Gate Next from step 3 (index 3) into combos if <2 tried — soft: allow stay, but disable entering combo via Next from single-3 if not ready
  updateTriedStatus();
  refreshDots();
  buildDisplay();
  $("stepScroll").scrollTop = 0;
  history.replaceState(null, "", `#step-${n}`);
}

function canEnterStep(i) {
  if (i <= 3) return true; // lightning + three single steps
  // combo and story require ≥2 singles
  return combosUnlocked();
}

function enterStep(i) {
  i = Math.max(0, Math.min(STEPS.length - 1, i));
  if (!canEnterStep(i)) {
    $("triedStatus").textContent =
      "Try at least two different fields (singles) before combinations unlock.";
    // bounce to last single step
    i = 3;
  }
  state.step = i;
  renderStep();
}

function refreshDots() {
  const ol = $("progressDots");
  if (!ol.dataset.ready) {
    ol.innerHTML = STEPS.map(
      (s, i) =>
        `<li><button type="button" data-step="${i}" title="${i + 1} ${s.title}" aria-label="${i + 1} ${s.title}">${i + 1}</button></li>`
    ).join("");
    ol.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-step]");
      if (b) enterStep(Number(b.dataset.step));
    });
    ol.dataset.ready = "1";
  }
  [...ol.querySelectorAll("button")].forEach((b, i) => {
    b.classList.toggle("current", i === state.step);
    b.classList.toggle("visited", i < state.step && i !== state.step);
    b.disabled = !canEnterStep(i);
    b.setAttribute("aria-current", i === state.step ? "step" : "false");
  });
}

function onOpChange() {
  const op = currentOp();
  $("threshRow").hidden = op !== "mask";
  buildDisplay();
}

function wireMap() {
  const canvas = $("map");
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    state.drag = { x: e.clientX, lon0: state.view.lon0 };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!state.drag) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const [lon, lat] = pixelToLonLat(px, py, rect.width, rect.height);
      if (lat < state.grids.lat_min || lat > state.grids.lat_max) {
        $("cursorReadout").hidden = true;
        return;
      }
      const [iy, ix] = nearestCell(lon, lat);
      const v = state.display.out[flatIndex(iy, ix)];
      const lv = state.flat.lightning[flatIndex(iy, ix)];
      $("cursorReadout").hidden = false;
      $("cursorReadout").textContent = `${lat.toFixed(1)}°, ${lon.toFixed(1)}° · ${state.display.label}: ${fmt(v)} · lightning: ${fmt(lv)}`;
      return;
    }
    const dx = e.clientX - state.drag.x;
    const rect = canvas.getBoundingClientRect();
    state.view.lon0 = state.drag.lon0 - (dx / rect.width) * 360 / state.view.scale;
    drawMap();
  });
  canvas.addEventListener("pointerup", () => {
    state.drag = null;
  });
  canvas.addEventListener("pointerleave", () => {
    if (!state.drag) $("cursorReadout").hidden = true;
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      state.view.scale = Math.max(1, Math.min(4, state.view.scale * factor));
      drawMap();
    },
    { passive: false }
  );
}

async function boot() {
  const res = await fetch("data/grids.json");
  if (!res.ok) throw new Error("Could not load data/grids.json");
  const grids = await res.json();
  state.grids = grids;
  for (const key of FIELD_KEYS_ALL) {
    state.flat[key] = Float32Array.from(grids.fields[key].data);
  }
  // land is top-level array
  state.flat.land = Float32Array.from(grids.land);

  $("caseLine").textContent = grids.case;
  populateSelects();

  $("fieldA").addEventListener("change", () => buildDisplay());
  $("fieldB").addEventListener("change", () => buildDisplay());
  document.querySelectorAll('input[name="op"]').forEach((el) => el.addEventListener("change", onOpChange));
  $("threshA").addEventListener("input", () => {
    $("threshAOut").textContent = `${$("threshA").value}%`;
    buildDisplay();
  });
  $("threshB").addEventListener("input", () => {
    $("threshBOut").textContent = `${$("threshB").value}%`;
    buildDisplay();
  });
  $("showLightning").addEventListener("change", () => buildDisplay());
  $("claimBox").addEventListener("input", (e) => {
    state.memory[state.step].claim = e.target.value;
  });
  $("btnPrev").addEventListener("click", () => {
    if (state.step > 0) {
      enterStep(state.step - 1);
      $("stepAsk").focus();
    }
  });
  $("btnNext").addEventListener("click", () => {
    if (state.step >= STEPS.length - 1) return;
    const next = state.step + 1;
    if (!canEnterStep(next)) {
      updateTriedStatus();
      $("triedStatus").textContent =
        "Pick and show at least two different fields from the menu before combinations unlock.";
      return;
    }
    enterStep(next);
    $("stepAsk").focus();
  });

  wireMap();
  window.addEventListener("resize", () => drawMap());

  const m = location.hash.match(/step-(\d+)/i);
  const start = m ? Math.max(0, Math.min(STEPS.length - 1, Number(m[1]) - 1)) : 0;
  enterStep(start);
}

boot().catch((err) => {
  console.error(err);
  $("stepAsk").textContent = "Could not load map data. Check data/grids.json.";
});
