/**
 * Raptor — motor de test de mecanografía.
 *
 * Modelo de métricas alineado con Monkeytype:
 *
 *  - Precisión: pulsaciones correctas / pulsaciones totales. Es INMUTABLE: el
 *    backspace corrige el texto en pantalla pero no borra el error del
 *    historial. Solo cuentan teclas realmente pulsadas, así que las letras que
 *    te saltas al mandar una palabra a medias no la penalizan.
 *  - WPM neto: solo cuentan los caracteres de palabras 100% correctas, más su
 *    espacio separador. Es lo que castiga saltarse palabras.
 *  - WPM bruto: todas las pulsaciones, correctas o no, espacios incluidos.
 *  - Consistencia: coeficiente de variación del WPM bruto *instantáneo* de cada
 *    segundo (delta de caracteres), no del promedio acumulado. El promedio
 *    acumulado converge por construcción y daba siempre ~95%.
 *
 * El tiempo sale siempre de performance.now(), nunca de contar ticks, así que
 * no acumula drift ni se descuadra si el navegador estrangula los timers en una
 * pestaña en segundo plano.
 */
function initRaptor() {
  const wordsContainer = document.getElementById("words");
  const typingArea = document.getElementById("typingArea");
  const input = document.getElementById("raptorInput");
  const focusOverlay = document.getElementById("focusOverlay");
  const capsWarning = document.getElementById("capsWarning");
  const newGameBtn = document.getElementById("newGameBtn");
  const durationSelect = document.getElementById("durationSelect");
  const modeSelect = document.getElementById("modeSelect");
  const resultDisplay = document.getElementById("result");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const punctToggle = document.getElementById("punctToggle");
  const numbersToggle = document.getElementById("numbersToggle");
  const practiceHint = document.getElementById("practiceHint");
  const statTime = document.getElementById("statTime");
  const statTimeLabel = document.getElementById("statTimeLabel");
  const statWpm = document.getElementById("statWpm");
  const statAcc = document.getElementById("statAcc");

  if (!wordsContainer || !typingArea || !input || !newGameBtn || !durationSelect ||
      !modeSelect || !resultDisplay || !statTime || !statWpm || !statAcc) return;

  // ---------- Bancos de palabras ----------
  // Vocabulario general, no técnico: es el modo por defecto ("random"), lo
  // primero que teclea cualquiera que entra a la página, y no tenía ninguna
  // razón para estar en inglés ni limitado a jerga de programación.
  const baseWordBank = [
    "casa", "perro", "gato", "agua", "fuego", "tierra", "aire", "sol", "luna",
    "estrella", "cielo", "mar", "rio", "montaña", "bosque", "ciudad", "calle",
    "puerta", "ventana", "mesa", "silla", "libro", "papel", "lapiz", "tiempo",
    "semana", "mañana", "tarde", "noche", "amigo", "familia", "trabajo",
    "escuela", "comida", "fruta", "pan", "leche", "cafe", "musica", "arte",
    "color", "verde", "azul", "rojo", "negro", "blanco", "grande", "pequeño",
    "rapido", "lento", "feliz", "triste", "fuerte", "suave", "cerca", "lejos",
    "arriba", "abajo", "dentro", "fuera", "nuevo", "viejo", "mucho", "poco",
    "siempre", "nunca", "hoy", "ayer", "camino", "viaje", "historia", "idea",
    "palabra", "verdad", "mundo", "vida", "gente", "mano", "ojo", "corazon",
    "cabeza", "viento", "lluvia", "nieve", "playa", "arbol", "flor", "pajaro",
    "pez", "juego", "sueño", "risa", "silencio", "numero", "dinero", "año", "niño"
  ];

  // Modos de nicho en ingles por diseño (cultura meme de programacion): no se
  // traducen, pero se reescriben sin contracciones para no exigir el
  // apostrofe, que ya no hace falta pedirle al usuario.
  // Puntuacion real de la frase (solo . , ?), no la que inyecta el toggle de
  // puntuacion mas abajo: ese toggle mete comillas, parentesis y posesivos al
  // azar, que sobre un texto narrativo ya puntuado queda sin sentido. Por eso
  // el modo terry se saca del alcance de applyPunctuation en generateWords.
  const terryText = "What is reality? I do not know. When my bird was looking at my computer monitor, I thought, that bird has no idea what he is looking at. And yet, what does the bird do? Does he panic? No, he cannot really panic, he just does the best he can. Is he able to live in a world where he is so ignorant? Well, he does not really have a choice. The bird is okay, even though he does not understand the world. You are that bird looking at the monitor, and you are thinking to yourself, I can figure this out. Maybe you have some bird ideas. Maybe that is the best you can do.";
  const terryWords = terryText.split(" ");

  const promptPhrases = [
    "just make it work", "please do not break anything", "ignore all previous instructions",
    "make it pop", "ship it we are already late", "why is this not working",
    "it works on my machine", "have you tried turning it off and on again",
    "add more logs", "wrap it in try catch", "delete node modules and reinstall",
    "todo fix this later", "this is temporary i promise", "one more console log will not hurt",
    "chatgpt wrote this do not judge me", "we will refactor later", "just use a global variable",
    "copy paste from stack overflow", "works in dev breaks in prod", "add a comment nobody will read",
    "commit message fix stuff", "force push and pray", "delete everything and hope for the best",
    "blame the intern", "it is not a bug it is a feature", "cache is the problem it is always cache",
    "as an ai language model i cannot", "can you fix this real quick", "trust me it is fine",
    "it works on my machine shrug", "act as a senior developer", "make it more professional",
    "can you make it better", "why does this only break in production", "who wrote this code",
    "git blame says it was me"
  ];

  /** Fisher-Yates. `sort(() => Math.random() - 0.5)` no produce una permutación
   *  uniforme: los comparadores inconsistentes sesgan el resultado según el
   *  algoritmo de ordenación del motor. */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generatePromptWords(count) {
    let out = [];
    while (out.length < count) {
      out = out.concat(shuffle(promptPhrases).join(" ").split(" "));
    }
    return out.slice(0, count);
  }

  function generateRandomWords(count, bank) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(bank[Math.floor(Math.random() * bank.length)]);
    return out;
  }

  /** El texto de Terry se recorre en bucle con un cursor persistente. Antes cada
   *  recarga reinyectaba el texto entero, así que el DOM crecía sin límite. */
  let terryCursor = 0;
  function generateTerryWords(count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(terryWords[terryCursor % terryWords.length]);
      terryCursor++;
    }
    return out;
  }

  // ---------- Puntuación y números ----------
  // Ambos se aplican DESPUÉS de generar el banco, así que respetan el modo
  // elegido y no alteran el número de palabras: el modo por palabras sigue
  // contando lo que promete.
  const PUNCT_KEY = "raptor_punct";
  const NUMBERS_KEY = "raptor_numbers";
  let punctuationOn = localStorage.getItem(PUNCT_KEY) === "1";
  let numbersOn = localStorage.getItem(NUMBERS_KEY) === "1";

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Los signos de fin de frase van repetidos a propósito: el punto debe salir
  // mucho más que la exclamación, igual que en texto real.
  const SENTENCE_ENDERS = [".", ".", ".", ".", "!", "?"];
  const INNER_MARKS = [",", ",", ",", ";", ":"];

  // El estado de frase sobrevive entre llamadas: en modo tiempo el banco se
  // recarga a mitad de partida y, sin esto, cada recarga metía una mayúscula
  // suelta detrás de una coma.
  let pendingSentenceStart = true;

  function applyPunctuation(list) {
    const out = list.slice();

    for (let i = 0; i < out.length; i++) {
      let w = out[i];
      if (!w) continue;

      if (pendingSentenceStart) {
        w = w[0].toUpperCase() + w.slice(1);
        pendingSentenceStart = false;
      }

      const r = Math.random();
      if (r < 0.13) {
        w += pick(SENTENCE_ENDERS);
        pendingSentenceStart = true;
      } else if (r < 0.24) {
        w += pick(INNER_MARKS);
      } else if (r < 0.28) {
        w = `"${w}"`;
      } else if (r < 0.31) {
        w = `(${w})`;
      } else if (r < 0.34) {
        w += "'s";
      }
      out[i] = w;
    }
    return out;
  }

  /** Longitudes mezcladas: teclear 7 siempre es mucho más fácil que teclear
   *  4096, y la fila superior solo se entrena de verdad con números largos. */
  function applyNumbers(list) {
    return list.map((w) => {
      if (Math.random() >= 0.16) return w;
      const digits = 1 + Math.floor(Math.random() * 4);
      let n = "";
      for (let i = 0; i < digits; i++) n += Math.floor(Math.random() * 10);
      return n;
    });
  }

  function decorate(list) {
    let out = list;
    if (numbersOn) out = applyNumbers(out);
    if (punctuationOn) out = applyPunctuation(out);
    return out;
  }

  // ---------- Sonido (WebAudio sintetizado) ----------
  const SOUND_KEY = "raptor_muted";
  let audioCtx = null;
  let muted = localStorage.getItem(SOUND_KEY) === "1";

  function getAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, durationMs, type, gainValue) {
    if (muted) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  const playCorrectSound = () => playTone(760, 30, "sine", 0.05);
  const playIncorrectSound = () => playTone(150, 80, "square", 0.06);
  const playWordSound = () => playTone(500, 45, "triangle", 0.05);
  const playFinishSound = () => {
    [523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => playTone(f, 150, "sine", 0.07), i * 110));
  };

  // El emoji de altavoz rompia la estetica monocromo del chasis CRT; el boton
  // usa el mismo patron de texto + aria-pressed que CRT, no un glifo a color.
  function updateSoundBtn() {
    if (!soundToggleBtn) return;
    soundToggleBtn.setAttribute("aria-pressed", String(muted));
    soundToggleBtn.title = muted ? "Activar sonido" : "Silenciar sonido";
  }
  updateSoundBtn();

  soundToggleBtn?.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem(SOUND_KEY, muted ? "1" : "0");
    updateSoundBtn();
    if (!muted) getAudioCtx();
  });

  // ---------- Tratamiento CRT ----------
  // Las scanlines y el brillo de fósforo son decoración: a quien le molesten
  // para leer, las apaga y la preferencia queda guardada. El motor del test no
  // depende de ninguna de las dos.
  const crtEl = document.getElementById("raptorCrt");
  const crtToggleBtn = document.getElementById("crtToggleBtn");
  const CRT_KEY = "raptor_crt";
  let crtOn = localStorage.getItem(CRT_KEY) !== "0";

  function updateCrt() {
    crtEl?.classList.toggle("crt-off", !crtOn);
    if (!crtToggleBtn) return;
    crtToggleBtn.setAttribute("aria-pressed", String(crtOn));
    crtToggleBtn.title = crtOn ? "Desactivar efecto CRT" : "Activar efecto CRT";
  }
  updateCrt();

  crtToggleBtn?.addEventListener("click", () => {
    crtOn = !crtOn;
    localStorage.setItem(CRT_KEY, crtOn ? "1" : "0");
    updateCrt();
  });

  // ---------- Persistencia ----------
  // v2: las métricas guardadas en v1 se calculaban con otro modelo (precisión
  // reversible por backspace, WPM sin espacios) y no son comparables. Se deja
  // v1 intacto en localStorage en vez de migrarlo con números inventados.
  const HISTORY_KEY = "raptor_history_v2";
  const MISTAKES_KEY = "raptor_mistakes_v1";
  const WORD_STATS_KEY = "raptor_word_stats_v1";
  const HISTORY_LIMIT = 100;

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_LIMIT)));
  }
  function loadMistakeMap() {
    try {
      return JSON.parse(localStorage.getItem(MISTAKES_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveMistakeMap(map) {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(map));
  }
  function mergeMistakes(sessionMistakes) {
    const cumulative = loadMistakeMap();
    for (const [char, count] of Object.entries(sessionMistakes)) {
      cumulative[char] = (cumulative[char] || 0) + count;
    }
    saveMistakeMap(cumulative);
  }

  // Palabra tal como se ve, sin la puntuacion que le pega decorate() alrededor
  // (comillas, parentesis, puntos) ni las cifras del toggle de numeros: sin
  // esto "casa" y "casa," fragmentan el conteo en dos entradas distintas.
  const WORD_STAT_RE = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+$/;
  function normalizeWordForStats(raw) {
    const stripped = raw.replace(/^[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+|[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+$/g, "");
    return WORD_STAT_RE.test(stripped) ? stripped.toLowerCase() : null;
  }

  function recordWordStat(rawWord, correct) {
    const word = normalizeWordForStats(rawWord);
    if (!word) return;
    const s = wordStatsSession[word] || (wordStatsSession[word] = { seen: 0, fails: 0 });
    s.seen++;
    if (!correct) s.fails++;
  }

  function loadWordStats() {
    try {
      return JSON.parse(localStorage.getItem(WORD_STATS_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveWordStats(map) {
    localStorage.setItem(WORD_STATS_KEY, JSON.stringify(map));
  }
  function mergeWordStats(sessionStats) {
    const cumulative = loadWordStats();
    for (const [word, s] of Object.entries(sessionStats)) {
      const cur = cumulative[word] || { seen: 0, fails: 0 };
      cur.seen += s.seen;
      cur.fails += s.fails;
      cumulative[word] = cur;
    }
    saveWordStats(cumulative);
  }

  /**
   * Intentos por tecla. Sin este denominador solo se puede medir el número
   * bruto de fallos, que es básicamente un ranking de frecuencia: la `e` acumula
   * más fallos que la `q` porque sale veinte veces más, no porque se te dé peor.
   */
  const PRESSES_KEY = "raptor_presses_v1";
  function loadPressMap() {
    try {
      return JSON.parse(localStorage.getItem(PRESSES_KEY)) || {};
    } catch {
      return {};
    }
  }
  function mergePresses(sessionPresses) {
    const cumulative = loadPressMap();
    for (const [char, count] of Object.entries(sessionPresses)) {
      cumulative[char] = (cumulative[char] || 0) + count;
    }
    localStorage.setItem(PRESSES_KEY, JSON.stringify(cumulative));
  }

  /**
   * Tiempos de transición entre pares de teclas.
   *
   * La precisión y las pulsaciones por minuto no cuentan toda la historia: se
   * puede escribir al 100% y perder medio segundo cada vez que aparece `br`.
   * Esas paradas no salen en ninguna media, porque quedan absorbidas por los
   * cientos de transiciones rápidas que las rodean.
   *
   * Solo se mide entre aciertos consecutivos dentro de la misma palabra. Un
   * fallo o una corrección contamina el intervalo con tiempo de decisión, no de
   * movimiento; y el hueco antes de un espacio mezcla la transición con la
   * lectura de la palabra siguiente.
   */
  const BIGRAMS_KEY = "raptor_bigrams_v1";
  // Por encima de esto ya no es una transición, es una pausa: leer, dudar,
  // rascarse la nariz. Incluirlas convertiría la media en un detector de
  // distracciones.
  const BIGRAM_MAX_MS = 1000;
  // Por debajo, rodillo o rebote de teclado; tampoco es un movimiento medible.
  const BIGRAM_MIN_MS = 15;
  // Con menos muestras la media la decide cualquier pausa suelta.
  const BIGRAM_MIN_SAMPLES = 4;

  function loadBigramMap() {
    try {
      return JSON.parse(localStorage.getItem(BIGRAMS_KEY)) || {};
    } catch {
      return {};
    }
  }
  function mergeBigrams(sessionBigrams) {
    const cumulative = loadBigramMap();
    for (const [pair, stat] of Object.entries(sessionBigrams)) {
      const prev = cumulative[pair] || { n: 0, totalMs: 0 };
      cumulative[pair] = { n: prev.n + stat.n, totalMs: prev.totalMs + stat.totalMs };
    }
    localStorage.setItem(BIGRAMS_KEY, JSON.stringify(cumulative));
  }

  /** Pares más lentos, con muestra suficiente para que la media signifique algo. */
  function slowestBigrams(map, limit = 5) {
    return Object.entries(map)
      .filter(([, s]) => s.n >= BIGRAM_MIN_SAMPLES)
      .map(([pair, s]) => ({ pair, ms: Math.round(s.totalMs / s.n), n: s.n }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, limit);
  }

  /** Tasa de fallo de una tecla. Cuando no hay datos de intentos (historial
   *  anterior a este contador) se cae al peor caso, que deja el mapa igual de
   *  ordenado que antes en vez de dividir por cero. */
  function errorRate(char, mistakes, presses) {
    const m = mistakes[char] || 0;
    if (m === 0) return 0;
    return m / Math.max(presses[char] || 0, m);
  }

  function showPracticeHint(msg) {
    if (!practiceHint) return;
    practiceHint.textContent = msg;
    practiceHint.hidden = false;
  }
  function hidePracticeHint() {
    if (!practiceHint) return;
    practiceHint.hidden = true;
  }

  const displayChar = (ch) => (ch === " " ? "␣" : ch);

  /** Muestreo ponderado: cada entrada sale con probabilidad proporcional a su
   *  score. Comparten esto tanto el pool de palabras realmente falladas como
   *  el heurístico de respaldo por densidad de carácter. */
  function sampleWeighted(pool, count) {
    const totalScore = pool.reduce((s, x) => s + x.score, 0);
    const out = [];
    for (let i = 0; i < count; i++) {
      let r = Math.random() * totalScore;
      let pick = pool[pool.length - 1].word;
      for (const x of pool) {
        r -= x.score;
        if (r <= 0) { pick = x.word; break; }
      }
      out.push(pick);
    }
    return out;
  }

  /** Palabras concretas que ya fallaste, ordenadas por tasa de fallo. `null`
   *  si todavía no hay suficiente historial para que el pool no sea ruido. */
  function buildWeakWordPool(minDistinct) {
    const stats = loadWordStats();
    const pool = Object.entries(stats)
      .filter(([, s]) => s.fails > 0)
      .map(([word, s]) => ({ word, score: s.fails / Math.max(s.seen, s.fails) }))
      .sort((a, b) => b.score - a.score);
    return pool.length >= minDistinct ? pool : null;
  }

  /**
   * Práctica dirigida, en dos niveles.
   *
   * Primero intenta repetir literalmente las palabras que ya fallaste
   * (raptor_word_stats_v1): es lo más preciso posible y, al depender de un
   * historial acumulado en vez de recalcularse cada vez desde cero, la
   * selección es consistente entre partidas en vez de saltar a un vocabulario
   * distinto cada sesión.
   *
   * Si todavía no hay suficientes palabras concretas registradas, cae al
   * heurístico anterior: puntúa cada palabra del banco base por *densidad* de
   * error de sus caracteres (fallos acumulados / longitud) y muestrea con
   * probabilidad proporcional a esa puntuación. La versión de antes de esto
   * filtraba con `bank.filter(w => weakChars.some(c => w.includes(c)))` sobre
   * las 8 teclas más falladas; como esas 8 casi siempre incluyen e/a/t/o, el
   * filtro matcheaba prácticamente todo el banco y el modo era indistinguible
   * de random.
   */
  function buildPracticeWords(count) {
    const wordPool = buildWeakWordPool(5);
    if (wordPool) {
      const worst = wordPool.slice(0, 6).map((x) => x.word).join("  ");
      showPracticeHint(`Práctica dirigida a las palabras que fallaste: ${worst}`);
      return sampleWeighted(wordPool, count);
    }

    const cumulative = loadMistakeMap();
    const totalMistakes = Object.values(cumulative).reduce((s, c) => s + c, 0);
    if (totalMistakes < 5) {
      showPracticeHint("Completa una partida para desbloquear práctica dirigida a tus errores. Usando modo random mientras tanto.");
      return generateRandomWords(count, baseWordBank);
    }

    // Se puntúa por tasa de fallo, no por fallos brutos: con el conteo crudo las
    // vocales ganaban siempre por frecuencia y la práctica acababa siendo un
    // modo random con más vocales.
    const presses = loadPressMap();
    const scored = baseWordBank
      .map((word) => {
        let s = 0;
        for (const ch of word) s += errorRate(ch, cumulative, presses);
        return { word, score: s / word.length };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length < 5) {
      showPracticeHint("Aún hay pocos datos de errores. Usando modo random mientras tanto.");
      return generateRandomWords(count, baseWordBank);
    }

    // Nos quedamos con el tercio más cargado (mínimo 10 palabras) para que la
    // sesión sea claramente distinta de random, no una versión levemente sesgada.
    const pool = scored.slice(0, Math.max(10, Math.ceil(scored.length / 3)));
    const out = sampleWeighted(pool, count);

    const topChars = Object.keys(cumulative)
      .sort((a, b) => errorRate(b, cumulative, presses) - errorRate(a, cumulative, presses))
      .slice(0, 5)
      .map((c) => displayChar(c));
    showPracticeHint(`Práctica dirigida a tus teclas más falladas: ${topChars.join("  ")}`);
    return out;
  }

  // ---------- Estado ----------
  const INITIAL_WORD_COUNT = 60;
  const REFILL_THRESHOLD = 15;
  const REFILL_COUNT = 30;
  const MAX_EXTRA_CHARS = 10;
  const TICK_MS = 100;
  // Techo del modo palabras: sin cuenta atrás, un test abandonado seguiría
  // muestreando para siempre.
  const WORD_MODE_MAX_SEC = 600;

  let words = [];
  /** Caché de nodos. Antes cada pulsación hacía hasta 5 `querySelectorAll`
   *  sobre cientos de nodos (uno de ellos global a todo el documento). */
  let wordEls = [];
  let letterEls = [];
  let cursorEl = null;
  let cursorAtEnd = false;

  /**
   * El selector codifica las dos familias de test en un solo control: `t30` son
   * 30 segundos, `w25` son 25 palabras. Un valor numérico suelto se lee como
   * segundos, que es como estaba antes de existir el modo por palabras.
   */
  function parseTestSetting(raw) {
    const m = /^([tw])(\d+)$/.exec(String(raw || ""));
    if (m) {
      const amount = parseInt(m[2], 10);
      return { testMode: m[1] === "w" ? "words" : "time", amount };
    }
    const n = parseInt(raw, 10);
    return { testMode: "time", amount: Number.isFinite(n) && n > 0 ? n : 30 };
  }

  let testMode = "time";
  let duration = 30;
  let targetWords = 0;
  let currentWordIndex = 0;
  let currentLetterIndex = 0;

  // Contadores de pulsación: NUNCA se decrementan. Backspace corrige el texto,
  // no la historia. Aquí es donde vivía el bug central de precisión.
  let keypresses = 0;
  let errors = 0;
  let spacesPressed = 0;

  // Caracteres que cuentan para el WPM neto (solo palabras 100% correctas).
  let committedNetChars = 0;
  let wordRecords = [];
  let mistakesCount = {};
  let pressesCount = {};
  let bigramsCount = {};
  // Por palabra completa (no por tecla): así la práctica dirigida puede
  // repetir exactamente las palabras que fallaste, no solo palabras que
  // comparten letras débiles con ellas.
  let wordStatsSession = {};
  // Última tecla ACERTADA y su instante. En null cuando la cadena está rota
  // (arranque, fallo, corrección o salto de palabra).
  let lastKeyChar = null;
  let lastKeyAt = 0;

  let running = false;
  let finished = false;
  let paused = false;
  let startTime = 0;
  let pausedAt = 0;
  let pausedTotal = 0;
  let tickInterval = null;
  let lastSampledSecond = 0;
  let lastSampleChars = 0;
  let lastSampleErrors = 0;
  let rawWpmPerSecond = [];
  let netWpmPerSecond = [];
  let errorsPerSecond = [];

  let scrollOffset = 0;
  let lineHeightPx = 0;
  let focused = false;

  // ---------- Reloj ----------
  function elapsedSec() {
    if (!running) return 0;
    const now = paused ? pausedAt : performance.now();
    return Math.max(0, (now - startTime - pausedTotal) / 1000);
  }

  function computeWpm(chars, sec) {
    // Por debajo de medio segundo el cociente explota (1 carácter en 40ms son
    // ~300 wpm) y el marcador en vivo parpadea con basura.
    if (sec < 0.5) return 0;
    return Math.round((chars / 5) / (sec / 60));
  }

  /** Los ajustes que cambian el texto se congelan mientras corre el reloj: si
   *  no, tocar uno a mitad de partida regeneraría lo que estás tecleando. */
  function setSettingsDisabled(on) {
    modeSelect.disabled = on;
    durationSelect.disabled = on;
    if (punctToggle) punctToggle.disabled = on;
    if (numbersToggle) numbersToggle.disabled = on;
  }

  function startIfNeeded() {
    if (running || finished) return;
    running = true;
    setSettingsDisabled(true);
    startTime = performance.now();
    pausedTotal = 0;
    paused = false;
    tickInterval = setInterval(tick, TICK_MS);
  }

  /** En modo tiempo el marcador descuenta segundos; en modo palabras no hay
   *  cuenta atrás que mostrar, así que enseña el avance sobre el objetivo. */
  function updateProgressStat() {
    if (testMode === "words") {
      statTime.textContent = `${Math.min(wordRecords.length, targetWords)}/${targetWords}`;
      return;
    }
    statTime.textContent = String(Math.max(0, Math.ceil(duration - elapsedSec())));
  }

  function tick() {
    if (paused || !running) return;
    const el = elapsedSec();
    updateProgressStat();

    // Recupera los segundos que se hayan perdido si el navegador estranguló el
    // intervalo (pestaña en segundo plano), en vez de saltárselos.
    // En modo palabras no hay tope de tiempo, pero el muestreo sí necesita uno:
    // sin él, un test abandonado con la pestaña abierta crece sin límite.
    const cap = testMode === "time" ? duration : Math.min(el, WORD_MODE_MAX_SEC);
    const upTo = Math.floor(Math.min(el, cap));
    while (lastSampledSecond < upTo) {
      lastSampledSecond++;
      sampleSecond();
    }

    updateLiveStats();
    if (testMode === "time" && el >= duration) endGame();
    else if (testMode === "words" && el >= WORD_MODE_MAX_SEC) endGame();
  }

  function sampleSecond() {
    const totalChars = keypresses + spacesPressed;
    const deltaChars = totalChars - lastSampleChars;
    lastSampleChars = totalChars;
    // WPM bruto instantáneo del segundo: (chars/5) escalado a un minuto.
    rawWpmPerSecond.push((deltaChars / 5) * 60);

    const deltaErrors = errors - lastSampleErrors;
    lastSampleErrors = errors;
    errorsPerSecond.push(deltaErrors);

    netWpmPerSecond.push(computeWpm(netChars(), lastSampledSecond));
  }

  function pauseClock() {
    if (!running || finished || paused) return;
    paused = true;
    pausedAt = performance.now();
  }

  function resumeClock() {
    if (!paused) return;
    paused = false;
    pausedTotal += performance.now() - pausedAt;
  }

  // ---------- Métricas ----------
  /** Prefijo de la palabra en curso que aún va perfecto. Si hay un solo fallo
   *  la palabra entera deja de contar para el neto, igual que en Monkeytype. */
  function inProgressNetChars() {
    const letters = letterEls[currentWordIndex];
    if (!letters) return 0;
    for (let i = 0; i < currentLetterIndex; i++) {
      if (!letters[i] || !letters[i].classList.contains("correct")) return 0;
    }
    return currentLetterIndex;
  }

  function netChars() {
    return committedNetChars + inProgressNetChars();
  }

  function accuracy() {
    if (keypresses === 0) return 100;
    return Math.round(((keypresses - errors) / keypresses) * 100);
  }

  function computeConsistency(samples) {
    if (samples.length < 2) return 100;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    if (mean <= 0) return 0;
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
    const cv = Math.sqrt(variance) / mean;
    return Math.max(0, Math.round(100 - cv * 100));
  }

  function updateLiveStats() {
    statWpm.textContent = String(computeWpm(netChars(), elapsedSec()));
    statAcc.textContent = accuracy() + "%";
  }

  // ---------- Render ----------
  function buildWordEl(word) {
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    const letters = [];
    for (const ch of word) {
      const letterEl = document.createElement("span");
      letterEl.className = "letter faded";
      letterEl.textContent = ch;
      wordEl.appendChild(letterEl);
      letters.push(letterEl);
    }
    return { wordEl, letters };
  }

  function appendWords(newWords) {
    const frag = document.createDocumentFragment();
    for (const w of newWords) {
      const { wordEl, letters } = buildWordEl(w);
      frag.appendChild(wordEl);
      frag.appendChild(document.createTextNode(" "));
      wordEls.push(wordEl);
      letterEls.push(letters);
    }
    wordsContainer.appendChild(frag);
  }

  function moveCursor() {
    const letters = letterEls[currentWordIndex] || [];
    const atEnd = currentLetterIndex >= letters.length;
    const target = (atEnd ? letters[letters.length - 1] : letters[currentLetterIndex]) || null;
    if (target === cursorEl && atEnd === cursorAtEnd) return;
    if (cursorEl) cursorEl.classList.remove("cursor", "cursor-after");
    cursorEl = target;
    cursorAtEnd = atEnd;
    if (cursorEl) {
      cursorEl.classList.add("cursor");
      if (atEnd) cursorEl.classList.add("cursor-after");
    }
  }

  /** Solo se llama al cambiar de palabra: `offsetTop` fuerza un reflujo y no
   *  hace falta recalcularlo con cada letra. */
  function updateScroll() {
    const wordEl = wordEls[currentWordIndex];
    if (!wordEl) return;
    if (!lineHeightPx) {
      lineHeightPx = parseFloat(getComputedStyle(wordsContainer).lineHeight) || 32;
    }
    const target = Math.max(0, wordEl.offsetTop - lineHeightPx);
    if (target !== scrollOffset) {
      scrollOffset = target;
      wordsContainer.style.transform = `translateY(-${target}px)`;
    }
  }

  function flashWord(wordEl, isCorrect) {
    if (!wordEl) return;
    wordEl.classList.add(isCorrect ? "word-flash-correct" : "word-flash-incorrect");
    setTimeout(() => {
      wordEl.classList.remove("word-flash-correct", "word-flash-incorrect");
    }, 260);
  }

  // ---------- Generación ----------
  function generateWords(count) {
    const mode = modeSelect.value;
    if (mode === "prompts") return decorate(generatePromptWords(count));
    // El texto de terry ya trae su propia puntuacion real (. , ?): solo se le
    // aplican numeros si el toggle esta activo, nunca la puntuacion al azar.
    if (mode === "terry") {
      const words = generateTerryWords(count);
      return numbersOn ? applyNumbers(words) : words;
    }
    if (mode === "practice") return decorate(buildPracticeWords(count));
    return decorate(generateRandomWords(count, baseWordBank));
  }

  function maybeRefill() {
    // El modo palabras genera exactamente su objetivo: recargar lo alargaría.
    if (testMode === "words") return;
    if (currentWordIndex >= words.length - REFILL_THRESHOLD) {
      const more = generateWords(REFILL_COUNT);
      words = words.concat(more);
      appendWords(more);
    }
  }

  function loadWords() {
    clearInterval(tickInterval);
    tickInterval = null;

    const setting = parseTestSetting(durationSelect.value);
    testMode = setting.testMode;
    duration = testMode === "time" ? setting.amount : 0;
    targetWords = testMode === "words" ? setting.amount : 0;

    setSettingsDisabled(false);

    running = false;
    finished = false;
    paused = false;
    startTime = 0;
    pausedTotal = 0;
    lastSampledSecond = 0;
    lastSampleChars = 0;
    lastSampleErrors = 0;
    rawWpmPerSecond = [];
    netWpmPerSecond = [];
    errorsPerSecond = [];

    currentWordIndex = 0;
    currentLetterIndex = 0;
    keypresses = 0;
    errors = 0;
    spacesPressed = 0;
    committedNetChars = 0;
    wordRecords = [];
    mistakesCount = {};
    pressesCount = {};
    bigramsCount = {};
    wordStatsSession = {};
    lastKeyChar = null;

    scrollOffset = 0;
    lineHeightPx = 0;
    cursorEl = null;
    cursorAtEnd = false;
    terryCursor = 0;
    pendingSentenceStart = true;

    if (statTimeLabel) statTimeLabel.textContent = testMode === "words" ? "Palabras" : "Tiempo";
    updateProgressStat();
    statWpm.textContent = "0";
    statAcc.textContent = "100%";
    resultDisplay.innerHTML = "";
    typingArea.classList.remove("is-finished");

    if (modeSelect.value !== "practice") hidePracticeHint();

    wordEls = [];
    letterEls = [];
    wordsContainer.innerHTML = "";
    wordsContainer.style.transform = "translateY(0px)";
    words = generateWords(testMode === "words" ? targetWords : INITIAL_WORD_COUNT);
    appendWords(words);

    moveCursor();
    updateScroll();
  }

  // ---------- Entrada ----------
  function countPress(expectedChar) {
    pressesCount[expectedChar] = (pressesCount[expectedChar] || 0) + 1;
  }

  function countMistake(expectedChar) {
    // Siempre se registra el carácter ESPERADO, nunca el pulsado. Antes las
    // letras extra guardaban la tecla pulsada y el resto la esperada, así que el
    // mapa de errores mezclaba dos cosas distintas.
    mistakesCount[expectedChar] = (mistakesCount[expectedChar] || 0) + 1;
  }

  /**
   * Cronometra la transición desde la tecla acertada anterior hasta esta.
   * `ok` en false rompe la cadena: tras un fallo el siguiente intervalo incluye
   * el tiempo de darse cuenta, y eso no es velocidad de dedos.
   */
  function countBigram(expectedChar, ok) {
    const now = performance.now();
    const prev = lastKeyChar;
    const prevAt = lastKeyAt;
    lastKeyChar = ok ? expectedChar : null;
    lastKeyAt = now;
    if (!ok || prev === null) return;
    const delta = now - prevAt;
    if (delta < BIGRAM_MIN_MS || delta > BIGRAM_MAX_MS) return;
    const pair = prev + expectedChar;
    const stat = bigramsCount[pair] || (bigramsCount[pair] = { n: 0, totalMs: 0 });
    stat.n++;
    stat.totalMs += delta;
  }

  function checkLetter(key) {
    startIfNeeded();

    const letters = letterEls[currentWordIndex];
    const target = words[currentWordIndex];
    if (!letters || target === undefined) return;

    // Carácter sobrante: la palabra ya está completa y sigues escribiendo.
    if (currentLetterIndex >= target.length) {
      if (currentLetterIndex - target.length >= MAX_EXTRA_CHARS) return;
      keypresses++;
      errors++;
      // Lo que fallaste aquí es el espacio, no una letra concreta.
      countPress(" ");
      countMistake(" ");
      countBigram(" ", false);
      const extra = document.createElement("span");
      extra.className = "letter extra incorrect";
      extra.textContent = key;
      wordEls[currentWordIndex].appendChild(extra);
      letters.push(extra);
      playIncorrectSound();
      currentLetterIndex++;
      moveCursor();
      updateLiveStats();
      return;
    }

    keypresses++;
    const el = letters[currentLetterIndex];
    const expected = target[currentLetterIndex];
    countPress(expected);
    countBigram(expected, key === expected);
    el.classList.remove("faded", "skipped");
    if (key === expected) {
      el.classList.remove("incorrect");
      el.classList.add("correct");
      playCorrectSound();
    } else {
      el.classList.remove("correct");
      el.classList.add("incorrect");
      errors++;
      countMistake(expected);
      playIncorrectSound();
    }
    currentLetterIndex++;
    if (finishIfLastWordDone()) return;
    moveCursor();
    updateLiveStats();
  }

  /** Cierra la palabra en curso y avanza. `countSpace` distingue el cierre
   *  normal (el espacio separador cuenta para el neto) del cierre automático de
   *  la última palabra en modo palabras, donde nadie escribe un espacio final. */
  function commitCurrentWord(countSpace) {
    const letters = letterEls[currentWordIndex];
    const target = words[currentWordIndex];
    if (!letters || target === undefined) return;

    const correct = currentLetterIndex === target.length &&
      letters.slice(0, target.length).every((l) => l.classList.contains("correct"));

    // Letras que nunca pulsaste: no son errores de precisión, pero invalidan la
    // palabra para el WPM neto.
    for (let i = currentLetterIndex; i < target.length; i++) {
      letters[i].classList.remove("faded");
      letters[i].classList.add("skipped");
    }

    wordRecords.push({ word: target, correct });
    recordWordStat(target, correct);
    if (correct) committedNetChars += target.length + (countSpace ? 1 : 0);

    flashWord(wordEls[currentWordIndex], correct);

    currentWordIndex++;
    currentLetterIndex = 0;
  }

  const wordTestComplete = () => testMode === "words" && wordRecords.length >= targetWords;

  function processSpace() {
    // Espacio al principio de palabra: no-op. Antes marcaba la palabra entera
    // como fallada y avanzaba, así que machacar espacio destrozaba la partida.
    if (currentLetterIndex === 0) return;
    startIfNeeded();

    const letters = letterEls[currentWordIndex];
    const target = words[currentWordIndex];
    if (!letters || target === undefined) return;

    spacesPressed++;
    // El espacio acertado también es un intento: sin él, la barra solo tendría
    // fallos en el denominador y saldría siempre roja en el mapa.
    countPress(" ");
    // El salto de palabra corta la cadena: el hueco que viene después no mide un
    // movimiento de dedos, mide leer la palabra siguiente.
    countBigram(" ", false);
    commitCurrentWord(true);
    playWordSound();

    if (wordTestComplete()) {
      moveCursor();
      endGame();
      return;
    }

    maybeRefill();
    moveCursor();
    updateScroll();
    updateProgressStat();
    updateLiveStats();
  }

  /** En modo palabras la última palabra no lleva espacio detrás, así que el test
   *  se cierra en cuanto queda completa y correcta. Si la dejas mal, sigue
   *  esperando el espacio: aún puedes volver atrás a arreglarla. */
  function finishIfLastWordDone() {
    if (testMode !== "words") return false;
    if (currentWordIndex !== targetWords - 1) return false;

    const target = words[currentWordIndex];
    const letters = letterEls[currentWordIndex];
    if (target === undefined || !letters) return false;
    if (currentLetterIndex !== target.length) return false;
    if (!letters.slice(0, target.length).every((l) => l.classList.contains("correct"))) return false;

    commitCurrentWord(false);
    playWordSound();
    moveCursor();
    endGame();
    return true;
  }

  function deleteLetter() {
    // Corregir rompe la cadena de tiempos: lo que venga después mide relectura,
    // no la transición entre dos teclas.
    lastKeyChar = null;
    if (currentLetterIndex === 0) {
      if (currentWordIndex === 0) return;
      const prev = wordRecords[currentWordIndex - 1];
      // Monkeytype solo deja retroceder a palabras que quedaron mal. Si no,
      // podrías reescribir una palabra ya buena y rehacer el neto a voluntad.
      if (!prev || prev.correct) return;

      currentWordIndex--;
      wordRecords.pop();
      spacesPressed = Math.max(0, spacesPressed - 1);

      const letters = letterEls[currentWordIndex];
      let typed = letters.length;
      for (const l of letters) {
        if (l.classList.contains("skipped")) {
          l.classList.remove("skipped");
          l.classList.add("faded");
        }
      }
      while (typed > 0 &&
             !letters[typed - 1].classList.contains("correct") &&
             !letters[typed - 1].classList.contains("incorrect")) {
        typed--;
      }
      currentLetterIndex = typed;
      moveCursor();
      updateScroll();
      updateLiveStats();
      return;
    }

    const letters = letterEls[currentWordIndex];
    currentLetterIndex--;
    const el = letters[currentLetterIndex];
    if (!el) return;
    if (el.classList.contains("extra")) {
      el.remove();
      letters.splice(currentLetterIndex, 1);
    } else {
      el.classList.remove("correct", "incorrect", "skipped");
      el.classList.add("faded");
    }
    // keypresses/errors intactos a propósito: la precisión no se deshace.
    moveCursor();
    updateLiveStats();
  }

  function deleteWord() {
    if (currentLetterIndex === 0) {
      deleteLetter();
      return;
    }
    while (currentLetterIndex > 0) deleteLetter();
  }

  function setCapsWarning(on) {
    if (!capsWarning) return;
    capsWarning.hidden = !on;
  }

  function handleKey(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      restartGame();
      input.focus({ preventScroll: true });
      return;
    }

    if (typeof e.getModifierState === "function") {
      setCapsWarning(e.getModifierState("CapsLock"));
    }

    // Ctrl+Backspace (y Alt+Backspace en macOS) borra la palabra en curso.
    if ((e.ctrlKey || e.altKey) && !e.metaKey && e.key === "Backspace") {
      e.preventDefault();
      if (!finished) deleteWord();
      return;
    }

    // Cualquier otro atajo con modificador es del navegador, no del juego. Antes
    // `Ctrl+V` o `Ctrl+R` colaban una "v"/"r" como carácter tecleado.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (finished) return;

    if (e.key === " ") {
      e.preventDefault();
      processSpace();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      deleteLetter();
    } else if (e.key.length === 1) {
      e.preventDefault();
      checkLetter(e.key);
    }
  }

  input.addEventListener("keydown", handleKey);
  // El input no debe acumular texto nunca; handleKey ya hace preventDefault,
  // esto solo cubre pegado y entrada por IME.
  input.addEventListener("input", () => { input.value = ""; });
  input.addEventListener("paste", (e) => e.preventDefault());

  function setFocused(on) {
    focused = on;
    typingArea.classList.toggle("is-unfocused", !on);
    if (focusOverlay) focusOverlay.hidden = on;
  }

  input.addEventListener("focus", () => {
    setFocused(true);
    resumeClock();
  });
  input.addEventListener("blur", () => {
    setFocused(false);
    setCapsWarning(false);
    // Se pausa el reloj: perder el foco no debería costarte la partida.
    pauseClock();
  });

  typingArea.addEventListener("mousedown", (e) => {
    if (e.target === input) return;
    e.preventDefault();
    input.focus({ preventScroll: true });
  });

  // Si escribes con el foco fuera del input (y no dentro de otro control),
  // devolvemos el foco y reproducimos esa misma tecla para no perderla.
  document.addEventListener("keydown", (e) => {
    if (focused || finished) return;
    const tag = document.activeElement ? document.activeElement.tagName : "";
    if (tag === "SELECT" || tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "A") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Tab") {
      input.focus({ preventScroll: true });
      handleKey(e);
    }
  });

  // ---------- Gráfico ----------
  function drawGraph(canvas) {
    if (!canvas || netWpmPerSecond.length < 2) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#64ffda";
    const padding = 10;
    const max = Math.max(...netWpmPerSecond, ...rawWpmPerSecond, 1);
    const n = netWpmPerSecond.length;
    const stepX = (width - padding * 2) / Math.max(1, n - 1);
    const yFor = (v) => height - padding - (v / max) * (height - padding * 2);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding + ((height - padding * 2) / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const line = (series, color, lineWidth, dashed) => {
      ctx.beginPath();
      series.forEach((v, i) => {
        const x = padding + i * stepX;
        const y = yFor(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.setLineDash(dashed ? [4, 4] : []);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.setLineDash([]);
    };

    line(rawWpmPerSecond, "rgba(255,255,255,0.28)", 1.5, true);
    line(netWpmPerSecond, accent, 2, false);

    // Marcas de error: un punto por segundo en el que fallaste algo.
    ctx.fillStyle = "#ff6b6b";
    errorsPerSecond.forEach((count, i) => {
      if (count <= 0) return;
      const x = padding + i * stepX;
      const y = yFor(rawWpmPerSecond[i] ?? 0);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ---------- Fin de partida ----------
  function endGame() {
    if (finished) return;
    // El tiempo hay que leerlo ANTES de parar el reloj: elapsedSec() devuelve 0
    // en cuanto `running` pasa a false.
    const elapsed = elapsedSec();
    finished = true;
    running = false;
    clearInterval(tickInterval);
    tickInterval = null;
    setSettingsDisabled(false);
    typingArea.classList.add("is-finished");
    setCapsWarning(false);

    // En modo tiempo el denominador es la duración pactada, no el instante en
    // que el tick detectó el final. En modo palabras sí es el tiempo real.
    const seconds = testMode === "time" ? duration : Math.max(elapsed, 0.001);
    statTime.textContent = testMode === "words" ? `${targetWords}/${targetWords}` : "0";

    const finalWpm = computeWpm(netChars(), seconds);
    const rawWpm = computeWpm(keypresses + spacesPressed, seconds);
    const acc = accuracy();
    const consistency = computeConsistency(rawWpmPerSecond);
    const correctWords = wordRecords.filter((r) => r.correct).length;

    statWpm.textContent = String(finalWpm);
    statAcc.textContent = acc + "%";

    playFinishSound();

    const mode = modeSelect.value;
    const target = testMode === "time" ? duration : targetWords;
    const history = loadHistory();
    // Solo se compara contra partidas del mismo test. Un 100 wpm a 15 s no dice
    // nada frente a un 100 wpm a 120 s. Los registros previos al modo palabras
    // no llevan `testMode`, así que se leen como tiempo.
    // La puntuación y los números hunden el WPM, así que entran en la clave: un
    // récord limpio no se bate con una tirada sin signos.
    const keyOf = (r) =>
      `${r.testMode || "time"}:${r.target ?? r.duration}:${r.punctuation ? 1 : 0}${r.numbers ? 1 : 0}`;
    const settingKey = keyOf({ testMode, target, punctuation: punctuationOn, numbers: numbersOn });
    const sameSettings = history.filter((r) => r.mode === mode && keyOf(r) === settingKey);
    const previousBest = sameSettings.reduce((best, r) => Math.max(best, r.wpm), 0);
    const isRecord = finalWpm > 0 && finalWpm > previousBest;
    const last10 = sameSettings.slice(-10);
    const avgLast10 = last10.length > 0
      ? Math.round(last10.reduce((s, r) => s + r.wpm, 0) / last10.length)
      : null;

    history.push({
      date: new Date().toISOString(),
      mode,
      testMode,
      target,
      punctuation: punctuationOn,
      numbers: numbersOn,
      duration: testMode === "time" ? duration : Math.round(seconds),
      wpm: finalWpm,
      rawWpm,
      accuracy: acc,
      consistency,
      keypresses,
      errors,
      correctWords,
      totalWords: wordRecords.length
    });
    saveHistory(history);
    mergeMistakes(mistakesCount);
    mergePresses(pressesCount);
    mergeBigrams(bigramsCount);
    mergeWordStats(wordStatsSession);

    const topMistakes = Object.entries(mistakesCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
    // Acumulado, no de la partida: en 30 s ningún par llega a las muestras que
    // hacen falta para que su media no sea una pausa disfrazada.
    const slowPairs = slowestBigrams(loadBigramMap());

    let comparisonMsg;
    if (isRecord) {
      comparisonMsg = previousBest > 0
        ? `🏆 ¡Nuevo récord personal! (anterior: ${previousBest} wpm)`
        : "🏆 ¡Primer récord registrado!";
    } else if (avgLast10 !== null) {
      const diff = finalWpm - avgLast10;
      comparisonMsg = `${diff >= 0 ? "+" + diff : diff} wpm vs tu media de las últimas ${last10.length} partidas (${avgLast10} wpm)`;
    } else {
      comparisonMsg = "Completa más partidas para ver comparativas.";
    }

    resultDisplay.innerHTML = `
      <div class="resultBox">
        <div class="result-headline">
          <div class="result-wpm">
            <span class="result-wpm-value">${finalWpm}</span>
            <span class="result-wpm-label">WPM neto</span>
          </div>
          <div class="result-grid">
            <div class="result-stat"><span class="result-stat-value">${rawWpm}</span><span class="result-stat-label">WPM bruto</span></div>
            <div class="result-stat"><span class="result-stat-value">${acc}%</span><span class="result-stat-label">Precisión</span></div>
            <div class="result-stat"><span class="result-stat-value">${consistency}%</span><span class="result-stat-label">Consistencia</span></div>
            <div class="result-stat"><span class="result-stat-value">${correctWords} / ${wordRecords.length}</span><span class="result-stat-label">Palabras correctas</span></div>
            <div class="result-stat"><span class="result-stat-value">${keypresses - errors} / ${keypresses}</span><span class="result-stat-label">Pulsaciones acertadas</span></div>
            <div class="result-stat"><span class="result-stat-value">${errors}</span><span class="result-stat-label">Errores</span></div>
          </div>
        </div>

        <canvas id="wpmGraph" class="wpm-graph"></canvas>
        <div class="graph-legend">
          <span class="legend-item legend-net">WPM neto</span>
          <span class="legend-item legend-raw">WPM bruto</span>
          <span class="legend-item legend-err">Errores</span>
        </div>

        ${topMistakes.length > 0 ? `
          <div class="mistake-chips">
            <span class="mistake-chips-label">Teclas más falladas:</span>
            ${topMistakes.map(([ch, count]) => `<span class="mistake-chip">${displayChar(ch)}<b>${count}</b></span>`).join("")}
          </div>` : ""}

        ${slowPairs.length > 0 ? `
          <div class="bigram-list">
            <span class="bigram-label">Transiciones más lentas:</span>
            ${slowPairs.map(({ pair, ms, n }) => `<span class="bigram-chip" title="${n} muestras">${displayChar(pair[0])}${displayChar(pair[1])}<b>${ms}ms</b></span>`).join("")}
          </div>` : ""}

        <div class="kb-heat">
          <span class="kb-heat-label">Mapa acumulado de fallos</span>
          <div id="kbHeat"></div>
        </div>

        <p class="result-comparison">${comparisonMsg}</p>

        <div class="result-actions">
          <button id="retryBtn" type="button">Repetir</button>
          <button id="practiceBtn" type="button">Practicar mis errores</button>
        </div>
      </div>
    `;

    drawGraph(document.getElementById("wpmGraph"));
    // Se pinta con el acumulado, no con la partida: en 30 s casi ninguna tecla
    // llega a los intentos que hacen falta para que un porcentaje signifique algo.
    window.RaptorKeyboard?.render(document.getElementById("kbHeat"), {
      mistakes: loadMistakeMap(),
      presses: loadPressMap()
    });
    document.getElementById("retryBtn")?.addEventListener("click", () => {
      restartGame();
      input.focus({ preventScroll: true });
    });
    document.getElementById("practiceBtn")?.addEventListener("click", () => {
      modeSelect.value = "practice";
      restartGame();
      input.focus({ preventScroll: true });
    });
  }

  function restartGame() {
    loadWords();
  }

  newGameBtn.addEventListener("click", () => {
    restartGame();
    input.focus({ preventScroll: true });
  });

  durationSelect.addEventListener("change", () => {
    if (!running) loadWords();
  });

  modeSelect.addEventListener("change", () => {
    if (!running) loadWords();
  });

  if (punctToggle) {
    punctToggle.checked = punctuationOn;
    punctToggle.addEventListener("change", () => {
      punctuationOn = punctToggle.checked;
      localStorage.setItem(PUNCT_KEY, punctuationOn ? "1" : "0");
      if (!running) loadWords();
      input.focus({ preventScroll: true });
    });
  }

  if (numbersToggle) {
    numbersToggle.checked = numbersOn;
    numbersToggle.addEventListener("change", () => {
      numbersOn = numbersToggle.checked;
      localStorage.setItem(NUMBERS_KEY, numbersOn ? "1" : "0");
      if (!running) loadWords();
      input.focus({ preventScroll: true });
    });
  }

  // El alto de línea está en `em` y cambia con el breakpoint de 600px, así que
  // la caché se invalida al redimensionar o el scroll se desalinea.
  window.addEventListener("resize", () => {
    lineHeightPx = 0;
    scrollOffset = -1;
    updateScroll();
  });

  loadWords();
  setFocused(false);
  input.focus({ preventScroll: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRaptor);
} else {
  initRaptor();
}
