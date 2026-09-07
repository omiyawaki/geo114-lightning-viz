/**
 * Lightning ingredients viewer — real ERA5 + Blitzortung + Natural Earth coasts.
 * Gated steps, open-ended field menu. Multiply unlocks after ≥2 distinct singles.
 */

const FIELD_ORDER = ["cape", "precip", "cin", "pw", "rh700", "t2m"];

const STEPS = [
  {
    id: "lightning",
    title: "Lightning",
    ask: "Look at the lightning map for 30 September 2025 at 00 UTC. Where is lightning active?",
    evidence: [
      "Look over the lightning map for this date and time.",
      "Name a few regions where strikes cluster, and a few where it looks quiet.",
      "Open the interactive historical maps link and confirm Date = 30 Sep 2025, Time = 00:00 UTC.",
      "Jot a short description in the box below before you move on.",
    ],
    claim: "Where is lightning most active at this time? Why might that make sense?",
    mode: "lightning-only",
  },
  {
    id: "single-1",
    title: "Try one field",
    ask: "Pick any field from the menu. Before you show it, predict whether it should line up with the lightning pattern you just saw.",
    evidence: [
      "Choose one field — any field. The menu does not rank them for you.",
      "Predict: should this field match lightning well, partly, or poorly?",
      "Turn the field on. Note where it matches lightning marks and where it misses.",
    ],
    claim: "Which field did you try? What matched, and what didn’t?",
    mode: "single",
  },
  {
    id: "single-2",
    title: "Try another",
    ask: "Pick a different field than last time. Same routine: predict, show, then note the misses. You need two different fields before combinations unlock.",
    evidence: [
      "Choose a second field you have not already leaned on.",
      "Predict how it should relate to lightning, then show it.",
      "Compare this field’s story to your first try. Still no combining yet.",
    ],
    claim: "Second field: what lined up, and what failed?",
    mode: "single",
  },
  {
    id: "combos",
    title: "Combinations",
    ask: "Now you can put two fields together. Show A, show B, or multiply them. Still no script for which pair is “correct.”",
    evidence: [
      "Pick field A and field B from the menu.",
      "Try A only, B only, A × B, and A × B where both are high.",
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
  coasts: null,
  strikes: [],
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

function normalizeField(key) {
  const arr = state.flat[key];
  let min = Infinity,
    max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min)) {
    min = 0;
    max = 1;
  }
  if (max <= min) max = min + 1;
  return { min, max, span: max - min };
}

function colorRamp(t, kind) {
  t = Math.max(0, Math.min(1, t));
  if (kind === "lightning") {
    const r = Math.round(20 + 235 * t);
    const g = Math.round(24 + 200 * t * t);
    const b = Math.round(40 + 80 * (1 - t));
    return [r, g, b, 255];
  }
  if (kind === "diverging") {
    if (t < 0.5) {
      const u = t * 2;
      return [Math.round(40 + 180 * u), Math.round(70 + 150 * u), Math.round(160 + 60 * u), 255];
    }
    const u = (t - 0.5) * 2;
    return [Math.round(220 + 20 * u), Math.round(160 - 80 * u), Math.round(80 - 40 * u), 255];
  }
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
  const available = FIELD_ORDER.filter((k) => state.grids.fields[k]);
  const opts = available
    .map((k) => `<option value="${k}">${state.grids.fields[k].name} (${state.grids.fields[k].units})</option>`)
    .join("");
  $("fieldA").innerHTML = opts;
  $("fieldB").innerHTML = opts;
  if (available.length > 1) $("fieldB").selectedIndex = 1;
}

function currentOp() {
  const r = document.querySelector('input[name="op"]:checked');
  return r ? r.value : "a";
}

function buildDisplay() {
  const g = state.grids;
  const step = STEPS[state.step];
  if (step.mode === "lightning-only") {
    $("layerLabel").textContent = "Blitzortung lightning (historical)";
    $("legendUnits").textContent = "";
    return;
  }

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

  if (step.mode === "single" || (step.mode === "combo" && (op === "a" || !combosUnlocked()))) {
    if (!combosUnlocked() && step.mode === "combo") op = "a";
    for (let i = 0; i < out.length; i++) out[i] = state.flat[keyA][i];
    ({ min, max } = normalizeField(keyA));
    label = g.fields[keyA].name;
    units = g.fields[keyA].units;
    kind = keyA === "cin" ? "diverging" : "seq";
    markTried(keyA);
  } else {
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
  const dlat = g.resolution_deg[0];
  const dlon = g.resolution_deg[1];
  let ix = Math.round((lon - g.lon_min) / dlon);
  let iy = Math.round((lat - g.lat_min) / dlat);
  ix = ((ix % g.nx) + g.nx) % g.nx;
  iy = Math.max(0, Math.min(g.ny - 1, iy));
  return [iy, ix];
}

function drawLegend() {
  const canvas = $("legendBar");
  if (!canvas || !state.display) return;
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

function drawCoastlines(ctx, w, h) {
  if (!state.coasts) return;
  ctx.save();
  ctx.strokeStyle = "rgba(245, 240, 230, 0.85)";
  ctx.lineWidth = 1.1;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (const feat of state.coasts.features) {
    const g = feat.geometry;
    if (!g) continue;
    const lines =
      g.type === "LineString"
        ? [g.coordinates]
        : g.type === "MultiLineString"
          ? g.coordinates
          : g.type === "Polygon"
            ? g.coordinates
            : g.type === "MultiPolygon"
              ? g.coordinates.flat()
              : [];
    for (const ring of lines) {
      if (!ring || ring.length < 2) continue;
      let started = false;
      let prevX = null;
      for (const pt of ring) {
        const [lon, lat] = pt;
        const [x, y] = lonLatToPixel(lon, lat, w, h);
        // break path on dateline jumps
        if (started && prevX != null && Math.abs(x - prevX) > w * 0.4) {
          started = false;
        }
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
        prevX = x;
      }
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawStrikes(ctx, w, h) {
  if (!state.strikes.length) return;
  ctx.save();
  ctx.fillStyle = "rgba(255, 230, 120, 0.9)";
  ctx.strokeStyle = "rgba(255, 180, 40, 0.55)";
  ctx.lineWidth = 0.75;
  for (const s of state.strikes) {
    const [x, y] = lonLatToPixel(s.lon, s.lat, w, h);
    if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
    const r = Math.min(3.2, 1.1 + 0.35 * Math.sqrt(s.n || 1));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMap() {
  const canvas = $("map");
  if (!canvas || !state.display) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 960;
  const cssH = Math.max(360, canvas.clientHeight || 480);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = cssW,
    h = cssH;

  ctx.fillStyle = "#0a1a2a";
  ctx.fillRect(0, 0, w, h);

  const g = state.grids;
  const { out, min, max, kind, showOutlines } = state.display;
  const span = max - min || 1;

  // Pseudocolor field (nearest neighbor)
  const img = ctx.createImageData(Math.round(w), Math.round(h));
  const data = img.data;
  const iw = img.width,
    ih = img.height;

  for (let py = 0; py < ih; py++) {
    for (let px = 0; px < iw; px++) {
      const [lon, lat] = pixelToLonLat(px + 0.5, py + 0.5, w, h);
      if (lat < g.lat_min || lat > g.lat_max) {
        const i = (py * iw + px) * 4;
        data[i] = 10;
        data[i + 1] = 26;
        data[i + 2] = 42;
        data[i + 3] = 255;
        continue;
      }
      const [iy, ix] = nearestCell(lon, lat);
      const v = out[flatIndex(iy, ix)];
      const t = (v - min) / span;
      const [r, gg, b, a] = colorRamp(t, kind);
      const i = (py * iw + px) * 4;
      data[i] = r;
      data[i + 1] = gg;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Real Natural Earth coastlines (not a fake land-mask sketch)
  drawCoastlines(ctx, w, h);

  // Digitized Blitzortung strike marks
  if (showOutlines) drawStrikes(ctx, w, h);

  // Equator + prime meridian
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
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

function setMapMode(lightningOnly) {
  $("blitzStage").hidden = !lightningOnly;
  $("era5Stage").hidden = lightningOnly;
  $("legendRow").hidden = lightningOnly;
  $("era5Hint").hidden = lightningOnly;
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
  const lightningOnly = spec.mode === "lightning-only";
  setMapMode(lightningOnly);

  if (lightningOnly) {
    controls.hidden = true;
    $("lockBadge").textContent = "Blitzortung";
    $("lockBadge").classList.remove("open");
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

  $("btnPrev").disabled = state.step === 0;
  const last = state.step === STEPS.length - 1;
  $("btnNext").disabled = false;
  $("btnNext").textContent = last ? "Done" : "Next";

  updateTriedStatus();
  refreshDots();
  buildDisplay();
  $("stepScroll").scrollTop = 0;
  history.replaceState(null, "", `#step-${n}`);
}

function canEnterStep(i) {
  if (i <= 3) return true;
  return combosUnlocked();
}

function enterStep(i) {
  i = Math.max(0, Math.min(STEPS.length - 1, i));
  if (!canEnterStep(i)) {
    $("triedStatus").textContent =
      "Try at least two different fields (singles) before combinations unlock.";
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
      if (!state.display) return;
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
      $("cursorReadout").hidden = false;
      $("cursorReadout").textContent = `${lat.toFixed(1)}°, ${lon.toFixed(1)}° · ${state.display.label}: ${fmt(v)}`;
      return;
    }
    const dx = e.clientX - state.drag.x;
    const rect = canvas.getBoundingClientRect();
    state.view.lon0 = state.drag.lon0 - ((dx / rect.width) * 360) / state.view.scale;
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
  const [res, coastRes] = await Promise.all([
    fetch("data/grids.json"),
    fetch("data/ne_110m_coastline.json"),
  ]);
  if (!res.ok) throw new Error("Could not load data/grids.json");
  if (!coastRes.ok) throw new Error("Could not load Natural Earth coastlines");
  const grids = await res.json();
  state.grids = grids;
  state.coasts = await coastRes.json();
  state.strikes = grids.strikes || [];

  for (const key of Object.keys(grids.fields)) {
    state.flat[key] = Float32Array.from(grids.fields[key].data);
  }

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
  window.addEventListener("resize", () => {
    if (STEPS[state.step].mode !== "lightning-only") drawMap();
  });

  const m = location.hash.match(/step-(\d+)/i);
  const start = m ? Math.max(0, Math.min(STEPS.length - 1, Number(m[1]) - 1)) : 0;
  enterStep(start);
}

boot().catch((err) => {
  console.error(err);
  $("stepAsk").textContent = "Could not load the map. Refresh the page or tell your instructor.";
});
