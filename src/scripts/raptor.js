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
  const practiceHint = document.getElementById("practiceHint");
  const statTime = document.getElementById("statTime");
  const statTimeLabel = document.getElementById("statTimeLabel");
  const statWpm = document.getElementById("statWpm");
  const statAcc = document.getElementById("statAcc");

  if (!wordsContainer || !typingArea || !input || !newGameBtn || !durationSelect ||
      !modeSelect || !resultDisplay || !statTime || !statWpm || !statAcc) return;

  // ---------- Bancos de palabras ----------
  const baseWordBank = [
    "hello", "world", "typing", "test", "speed", "practice", "code", "javascript",
    "programming", "computer", "keyboard", "challenge", "accuracy", "performance",
    "developer", "function", "variable", "object", "array", "random", "dynamic",
    "interface", "design", "responsive", "debug", "optimize", "syntax",
    "algorithm", "data", "structure", "logic", "iteration", "loop", "condition",
    "event", "listener", "update", "state", "render", "module", "framework",
    "library", "document", "element", "style", "class", "memory", "compile",
    "execute", "server", "client", "network", "protocol", "security", "database",
    "query", "index", "testing", "automation", "integration", "deployment",
    "version", "control", "repository", "branch", "commit", "merge", "pull", "request",
    "refactor", "scalable", "maintainable", "clean", "robust", "efficient"
  ];

  const terryText = "Whats reality I dont know When my bird was looking at my computer monitor I thought That bird has no idea what hes looking at And yet what does the bird do Does he panic No he cant really panic he just does the best he can Is he able to live in a world where hes so ignorant Well he doesnt really have a choice The bird is okay even though he doesnt understand the world Youre that bird looking at the monitor and youre thinking to yourself I can figure this out Maybe you have some bird ideas Maybe thats the best you can do";
  const terryWords = terryText.split(" ");

  const promptPhrases = [
    "just make it work", "please dont break anything", "ignore all previous instructions",
    "make it pop", "ship it we are already late", "why is this not working",
    "it works on my machine", "have you tried turning it off and on again",
    "add more logs", "wrap it in try catch", "delete node modules and reinstall",
    "todo fix this later", "this is temporary i promise", "one more console log wont hurt",
    "chatgpt wrote this dont judge me", "we will refactor later", "just use global variable",
    "copy paste from stack overflow", "works in dev breaks in prod", "add comment nobody will read",
    "commit message fix stuff", "force push pray", "rm rf hope best",
    "blame intern", "it is not bug it is feature", "cache is problem it always cache",
    "as ai language model i cannot", "can you fix this real quick", "trust me it is fine",
    "works me shrug", "act as senior developer", "make it more professional",
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

  function updateSoundBtn() {
    if (!soundToggleBtn) return;
    soundToggleBtn.textContent = muted ? "🔇" : "🔊";
    soundToggleBtn.setAttribute("aria-pressed", String(!muted));
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

  /**
   * Práctica dirigida. La versión anterior filtraba con
   * `bank.filter(w => weakChars.some(c => w.includes(c)))` sobre las 8 teclas
   * más falladas; como esas 8 casi siempre incluyen e/a/t/o, el filtro matcheaba
   * prácticamente todo el banco y el modo era indistinguible de random.
   *
   * Ahora se puntúa cada palabra por *densidad* de error (fallos acumulados de
   * sus caracteres / longitud) y se muestrea con probabilidad proporcional a esa
   * puntuación, así que las palabras cargadas de teclas débiles salen mucho más.
   */
  function buildPracticeWords(count) {
    const cumulative = loadMistakeMap();
    const totalMistakes = Object.values(cumulative).reduce((s, c) => s + c, 0);
    if (totalMistakes < 5) {
      showPracticeHint("Completa una partida para desbloquear práctica dirigida a tus errores. Usando modo random mientras tanto.");
      return generateRandomWords(count, baseWordBank);
    }

    const scored = baseWordBank
      .map((word) => {
        let s = 0;
        for (const ch of word) s += cumulative[ch] || 0;
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

    const topChars = Object.entries(cumulative)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c]) => displayChar(c));
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

  function startIfNeeded() {
    if (running || finished) return;
    running = true;
    modeSelect.disabled = true;
    durationSelect.disabled = true;
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
    if (mode === "prompts") return generatePromptWords(count);
    if (mode === "terry") return generateTerryWords(count);
    if (mode === "practice") return buildPracticeWords(count);
    return generateRandomWords(count, baseWordBank);
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

    modeSelect.disabled = false;
    durationSelect.disabled = false;

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

    scrollOffset = 0;
    lineHeightPx = 0;
    cursorEl = null;
    cursorAtEnd = false;
    terryCursor = 0;

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
  function countMistake(expectedChar) {
    // Siempre se registra el carácter ESPERADO, nunca el pulsado. Antes las
    // letras extra guardaban la tecla pulsada y el resto la esperada, así que el
    // mapa de errores mezclaba dos cosas distintas.
    mistakesCount[expectedChar] = (mistakesCount[expectedChar] || 0) + 1;
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
      countMistake(" ");
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
    modeSelect.disabled = false;
    durationSelect.disabled = false;
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
    const settingKey = `${testMode}:${target}`;
    const sameSettings = history.filter(
      (r) => r.mode === mode && `${r.testMode || "time"}:${r.target ?? r.duration}` === settingKey
    );
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

    const topMistakes = Object.entries(mistakesCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

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

        <p class="result-comparison">${comparisonMsg}</p>

        <div class="result-actions">
          <button id="retryBtn" type="button">Repetir</button>
          <button id="practiceBtn" type="button">Practicar mis errores</button>
        </div>
      </div>
    `;

    drawGraph(document.getElementById("wpmGraph"));
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
