/**
 * Historial de Raptor.
 *
 * Lee lo que el test ya guarda en localStorage; no escribe nada salvo cuando el
 * usuario borra. Todo el agrupado replica la clave de comparación del motor: un
 * 100 wpm a 15 s y otro a 120 s no son el mismo número, y mezclarlos en una
 * línea produce dientes de sierra que no dicen nada de la progresión.
 */
(function () {
  const HISTORY_KEY = "raptor_history_v2";
  const MISTAKES_KEY = "raptor_mistakes_v1";
  const PRESSES_KEY = "raptor_presses_v1";
  const BIGRAMS_KEY = "raptor_bigrams_v1";
  const BIGRAM_MIN_SAMPLES = 4;

  const MODE_LABELS = {
    random: "random",
    terry: "Terry Davis (en)",
    prompts: "prompts IA (en)",
    practice: "mis errores"
  };

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  /** Misma clave que usa el motor para decidir si una partida bate un récord. */
  function configKey(r) {
    const testMode = r.testMode || "time";
    const target = r.target ?? r.duration;
    return `${r.mode}|${testMode}:${target}:${r.punctuation ? 1 : 0}${r.numbers ? 1 : 0}`;
  }

  function configLabel(r) {
    const testMode = r.testMode || "time";
    const target = r.target ?? r.duration;
    const unit = testMode === "time" ? `${target} s` : `${target} palabras`;
    const flags = [];
    if (r.punctuation) flags.push("puntuación");
    if (r.numbers) flags.push("números");
    const suffix = flags.length > 0 ? ` · ${flags.join(" + ")}` : "";
    return `${MODE_LABELS[r.mode] || r.mode} · ${unit}${suffix}`;
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const displayChar = (ch) => (ch === " " ? "␣" : ch);

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function init() {
    const emptyEl = document.getElementById("histEmpty");
    const bodyEl = document.getElementById("histBody");
    const statusEl = document.getElementById("histStatus");
    const exportBtn = document.getElementById("histExportBtn");
    const clearBtn = document.getElementById("histClearBtn");

    const history = read(HISTORY_KEY, []);

    const setStatus = (msg) => {
      if (statusEl) statusEl.textContent = msg;
    };

    if (history.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      if (bodyEl) bodyEl.hidden = true;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      if (bodyEl) bodyEl.hidden = false;
      renderAll(history);
    }

    exportBtn?.addEventListener("click", () => exportJson(history, setStatus));
    clearBtn?.addEventListener("click", () => clearAll(setStatus));
  }

  function renderAll(history) {
    renderSummary(history);
    renderBests(history);
    renderRuns(history);
    renderKeyboard();
    renderBigrams();
    setupChart(history);
  }

  // ---------- Resumen ----------
  function renderSummary(history) {
    const box = document.getElementById("histSummary");
    if (!box) return;
    const best = history.reduce((m, r) => Math.max(m, r.wpm || 0), 0);
    const last10 = history.slice(-10);
    const avg = Math.round(last10.reduce((s, r) => s + (r.wpm || 0), 0) / last10.length);
    // Los registros de modo palabras guardan la duración real, así que el total
    // sale bien sin distinguir por tipo de test.
    const totalSec = history.reduce((s, r) => s + (r.duration || 0), 0);
    const minutes = Math.round(totalSec / 60);
    const bestAcc = history.reduce((m, r) => Math.max(m, r.accuracy || 0), 0);

    const cell = (label, value) =>
      `<span class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></span>`;

    box.innerHTML =
      cell("Partidas", history.length) +
      cell("Mejor WPM", best) +
      cell("Media últimas 10", Number.isFinite(avg) ? avg : 0) +
      cell("Mejor precisión", `${bestAcc}%`) +
      cell("Tiempo tecleado", `${minutes} min`);
  }

  // ---------- Récords por configuración ----------
  function groupByConfig(history) {
    const groups = new Map();
    for (const r of history) {
      const key = configKey(r);
      if (!groups.has(key)) groups.set(key, { key, label: configLabel(r), runs: [] });
      groups.get(key).runs.push(r);
    }
    return [...groups.values()];
  }

  function renderBests(history) {
    const table = document.getElementById("histBests");
    if (!table) return;
    const rows = groupByConfig(history)
      .map((g) => {
        const best = g.runs.reduce((m, r) => Math.max(m, r.wpm || 0), 0);
        const bestRun = g.runs.find((r) => r.wpm === best);
        const avg = Math.round(g.runs.reduce((s, r) => s + (r.wpm || 0), 0) / g.runs.length);
        return { label: g.label, best, avg, n: g.runs.length, date: bestRun?.date };
      })
      .sort((a, b) => b.best - a.best);

    table.innerHTML =
      `<thead><tr><th>Configuración</th><th>Mejor</th><th>Media</th><th>Partidas</th><th>Récord el</th></tr></thead>` +
      `<tbody>${rows.map((r) => `<tr>
        <td>${esc(r.label)}</td>
        <td class="hist-num hist-strong">${r.best}</td>
        <td class="hist-num">${r.avg}</td>
        <td class="hist-num">${r.n}</td>
        <td>${formatDate(r.date)}</td>
      </tr>`).join("")}</tbody>`;
  }

  // ---------- Últimas partidas ----------
  const RUNS_SHOWN = 25;

  function renderRuns(history) {
    const table = document.getElementById("histRuns");
    if (!table) return;
    const recent = history.slice(-RUNS_SHOWN).reverse();
    const note = document.getElementById("histRunsNote");
    if (note) {
      note.textContent = history.length > RUNS_SHOWN
        ? `${RUNS_SHOWN} de ${history.length}`
        : `${history.length} en total`;
    }

    table.innerHTML =
      `<thead><tr><th>Fecha</th><th>Configuración</th><th>WPM</th><th>Bruto</th><th>Precisión</th><th>Consistencia</th></tr></thead>` +
      `<tbody>${recent.map((r) => `<tr>
        <td>${formatDate(r.date)}</td>
        <td>${esc(configLabel(r))}</td>
        <td class="hist-num hist-strong">${r.wpm ?? "—"}</td>
        <td class="hist-num">${r.rawWpm ?? "—"}</td>
        <td class="hist-num">${r.accuracy ?? "—"}%</td>
        <td class="hist-num">${r.consistency ?? "—"}%</td>
      </tr>`).join("")}</tbody>`;
  }

  // ---------- Teclado y bigramas ----------
  function renderKeyboard() {
    window.RaptorKeyboard?.render(document.getElementById("kbHeat"), {
      mistakes: read(MISTAKES_KEY, {}),
      presses: read(PRESSES_KEY, {})
    });
  }

  function renderBigrams() {
    const box = document.getElementById("histBigrams");
    const block = document.getElementById("histBigramBlock");
    if (!box) return;
    const pairs = Object.entries(read(BIGRAMS_KEY, {}))
      .filter(([, s]) => s && s.n >= BIGRAM_MIN_SAMPLES)
      .map(([pair, s]) => ({ pair, ms: Math.round(s.totalMs / s.n), n: s.n }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 10);
    if (pairs.length === 0) return;
    if (block) block.hidden = false;
    box.innerHTML = pairs.map(({ pair, ms, n }) =>
      `<span class="bigram-chip" title="${n} muestras">${esc(displayChar(pair[0]) + displayChar(pair[1]))}<b>${ms}ms</b></span>`
    ).join("");
  }

  // ---------- Gráfica de progresión ----------
  function setupChart(history) {
    const select = document.getElementById("histFilter");
    const canvas = document.getElementById("histChart");
    const note = document.getElementById("histChartNote");
    if (!select || !canvas) return;

    // Solo configuraciones con al menos dos partidas: una sola no es progresión,
    // es un punto.
    const groups = groupByConfig(history)
      .filter((g) => g.runs.length >= 2)
      .sort((a, b) => b.runs.length - a.runs.length);

    if (groups.length === 0) {
      select.innerHTML = '<option>sin datos</option>';
      select.disabled = true;
      if (note) note.textContent = "Hacen falta al menos dos partidas con la misma configuración.";
      return;
    }

    select.innerHTML = groups
      .map((g) => `<option value="${esc(g.key)}">${esc(g.label)} (${g.runs.length})</option>`)
      .join("");

    const draw = () => {
      const group = groups.find((g) => g.key === select.value) || groups[0];
      drawChart(canvas, group.runs);
      if (note) {
        const first = group.runs[0].wpm || 0;
        const last = group.runs[group.runs.length - 1].wpm || 0;
        const delta = last - first;
        const sign = delta > 0 ? "+" : "";
        note.textContent = `De ${first} a ${last} wpm (${sign}${delta}) en ${group.runs.length} partidas.`;
      }
    };

    select.addEventListener("change", draw);
    draw();
  }

  function drawChart(canvas, runs) {
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const padL = 38;
    const padR = 12;
    const padT = 14;
    const padB = 24;

    ctx.clearRect(0, 0, W, H);

    const wpms = runs.map((r) => r.wpm || 0);
    // La escala arranca en 0 a propósito: recortarla al mínimo convierte una
    // mejora de 3 wpm en una montaña y da una sensación de progreso falsa.
    const max = Math.max(10, Math.ceil(Math.max(...wpms) / 10) * 10);
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const x = (i) => padL + (runs.length === 1 ? plotW / 2 : (i / (runs.length - 1)) * plotW);
    const y = (v) => padT + plotH - (v / max) * plotH;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#4ecdc4";
    const muted = "rgba(255, 255, 255, 0.28)";

    // Rejilla y etiquetas del eje.
    ctx.strokeStyle = muted;
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i;
      const yy = Math.round(y(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(W - padR, yy);
      ctx.stroke();
      ctx.fillText(String(Math.round(v)), padL - 6, yy);
    }

    // Media, para saber si el último punto es una racha o el nivel real.
    const avg = wpms.reduce((s, v) => s + v, 0) / wpms.length;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255, 176, 84, 0.7)";
    ctx.beginPath();
    ctx.moveTo(padL, y(avg));
    ctx.lineTo(W - padR, y(avg));
    ctx.stroke();
    ctx.restore();

    // Línea de progresión.
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    wpms.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
    ctx.stroke();

    // Puntos, con el récord marcado.
    const best = Math.max(...wpms);
    wpms.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(x(i), y(v), v === best ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = v === best ? "#ffb054" : accent;
      ctx.fill();
    });
  }

  // ---------- Exportar y borrar ----------
  function exportJson(history, setStatus) {
    const payload = {
      exportedAt: new Date().toISOString(),
      history,
      mistakes: read(MISTAKES_KEY, {}),
      presses: read(PRESSES_KEY, {}),
      bigrams: read(BIGRAMS_KEY, {})
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raptor-historial-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`Exportadas ${history.length} partidas.`);
  }

  function clearAll(setStatus) {
    // Borrar el historial tira también el mapa de errores y los tiempos: son la
    // misma sesión de datos, y dejar unos sin otros da estadísticas que no
    // cuadran con ninguna partida listada.
    if (!window.confirm("Se borrarán todas las partidas, el mapa de fallos y los tiempos. No se puede deshacer.")) {
      setStatus("Cancelado.");
      return;
    }
    for (const key of [HISTORY_KEY, MISTAKES_KEY, PRESSES_KEY, BIGRAMS_KEY]) {
      localStorage.removeItem(key);
    }
    setStatus("Historial borrado.");
    document.getElementById("histBody")?.setAttribute("hidden", "");
    document.getElementById("histEmpty")?.removeAttribute("hidden");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
