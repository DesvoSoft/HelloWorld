/**
 * Mapa de calor del teclado.
 *
 * Colorea por TASA de fallo (fallos / intentos), nunca por fallos brutos. El
 * conteo crudo solo dice qué letras salen más: la `e` acumula más fallos que la
 * `q` porque aparece veinte veces más, no porque se te dé peor. Con el
 * denominador, una tecla que fallas 3 de 4 veces se ve peor que una que fallas
 * 30 de 900, que es la que de verdad hay que practicar.
 *
 * Se expone en `window` en vez de exportarse como módulo para que la página del
 * test y la del historial compartan una única implementación sin que ninguna de
 * las dos dependa del orden de carga: quien no lo encuentre, no pinta el mapa.
 */
(function () {
  const ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ];

  // Un fallo en `?` es un fallo en la tecla de la barra: al mapa le interesa el
  // dedo, no el glifo.
  const UNSHIFT = {
    "!": "1", "@": "2", "#": "3", "$": "4", "%": "5",
    "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
    ":": ";", '"': "'", "<": ",", ">": ".", "?": "/",
    "_": "-", "+": "=", "~": "`"
  };

  function baseKey(ch) {
    if (!ch) return null;
    if (UNSHIFT[ch]) return UNSHIFT[ch];
    const lower = ch.toLowerCase();
    return lower;
  }

  /** Agrega los mapas por carácter a mapas por tecla física. */
  function foldToKeys(mistakes, presses) {
    const folded = {};
    const bump = (map, ch, n, field) => {
      const key = baseKey(ch);
      if (key === null) return;
      if (!folded[key]) folded[key] = { mistakes: 0, presses: 0 };
      folded[key][field] += n;
    };
    for (const [ch, n] of Object.entries(mistakes || {})) bump(folded, ch, n, "mistakes");
    for (const [ch, n] of Object.entries(presses || {})) bump(folded, ch, n, "presses");
    return folded;
  }

  const LABELS = { " ": "espacio" };

  function render(container, data) {
    if (!container) return;
    const folded = foldToKeys(data && data.mistakes, data && data.presses);

    const totalPresses = Object.values(folded).reduce((s, k) => s + k.presses, 0);
    if (totalPresses === 0) {
      container.innerHTML = '<p class="kb-empty">Completa una partida para ver tu mapa de teclado.</p>';
      return;
    }

    // Escala relativa a tu propia peor tecla: un 8% de fallo puede ser lo peor
    // que tienes, y una escala fija lo pintaría todo en verde.
    let worst = 0;
    for (const k of Object.values(folded)) {
      if (k.presses < 4) continue;
      worst = Math.max(worst, k.mistakes / k.presses);
    }
    if (worst <= 0) worst = 0.01;

    const keyHtml = (ch) => {
      const stats = folded[ch];
      const label = LABELS[ch] || ch;
      if (!stats || stats.presses === 0) {
        return `<span class="kb-key kb-key-empty" title="${label}: sin datos">${label}</span>`;
      }
      const rate = stats.mistakes / stats.presses;
      // Por debajo de 4 intentos el porcentaje es ruido; se muestra la tecla
      // como usada pero sin calor.
      const reliable = stats.presses >= 4;
      const heat = reliable ? Math.min(1, rate / worst) : 0;
      const pct = Math.round(rate * 100);
      const cls = reliable && rate === 0 ? "kb-key kb-key-clean" : "kb-key";
      return `<span class="${cls}" style="--heat:${heat.toFixed(3)}"` +
        ` title="${label}: ${pct}% de fallo (${stats.mistakes} de ${stats.presses})">${label}</span>`;
    };

    const rowsHtml = ROWS
      .map((row) => `<div class="kb-row">${row.map(keyHtml).join("")}</div>`)
      .join("");

    container.innerHTML = `
      <div class="kb-board">
        ${rowsHtml}
        <div class="kb-row">${keyHtml(" ")}</div>
      </div>
      <div class="kb-scale">
        <span>sin fallos</span>
        <span class="kb-gradient" aria-hidden="true"></span>
        <span>tu peor tecla (${Math.round(worst * 100)}%)</span>
      </div>
    `;
  }

  window.RaptorKeyboard = { render, foldToKeys, baseKey };
})();
