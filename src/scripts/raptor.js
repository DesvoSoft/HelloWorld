document.addEventListener("DOMContentLoaded", () => {
  const wordsContainer = document.getElementById("words");
  const newGameBtn = document.getElementById("newGameBtn");
  const durationSelect = document.getElementById("durationSelect");
  const modeSelect = document.getElementById("modeSelect");
  const resultDisplay = document.getElementById("result");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const practiceHint = document.getElementById("practiceHint");
  const statTime = document.getElementById("statTime");
  const statWpm = document.getElementById("statWpm");
  const statAcc = document.getElementById("statAcc");

  if (!wordsContainer || !newGameBtn || !durationSelect || !modeSelect || !resultDisplay || !statTime || !statWpm || !statAcc) return;

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
    "chatgpt wrote this dont judge me", "we will refactor later", "just use a global variable",
    "copy paste from stack overflow", "works in dev breaks in prod", "add a comment nobody will read",
    "commit message fix stuff", "force push and pray", "rm rf and hope for the best",
    "blame the intern", "it is not a bug it is a feature", "cache is the problem it is always the cache",
    "as an ai language model i cannot", "can you fix this real quick", "trust me it is fine",
    "works for me shrug", "act as a senior developer", "make it more professional",
    "can you make it better", "why does this only break in production", "who wrote this code",
    "git blame says it was me"
  ];

  function generatePromptWords(count) {
    let out = [];
    while (out.length < count) {
      const shuffled = [...promptPhrases].sort(() => Math.random() - 0.5);
      out = out.concat(shuffled.join(" ").split(" "));
    }
    return out;
  }

  function generateRandomWords(count, bank) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(bank[Math.floor(Math.random() * bank.length)]);
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

  // ---------- Persistencia (historial + mapa de errores) ----------
  const HISTORY_KEY = "raptor_history_v1";
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

  function buildPracticeWords(count) {
    const cumulative = loadMistakeMap();
    const entries = Object.entries(cumulative).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalMistakes = entries.reduce((sum, [, c]) => sum + c, 0);
    if (entries.length === 0 || totalMistakes < 5) {
      showPracticeHint("Completa una partida para desbloquear práctica dirigida a tus errores. Usando modo random mientras tanto.");
      return generateRandomWords(count, baseWordBank);
    }
    hidePracticeHint();
    const weakChars = entries.map(([c]) => c);
    const weighted = baseWordBank.filter(w => weakChars.some(c => w.includes(c)));
    const pool = weighted.length >= 5 ? weighted : baseWordBank;
    return generateRandomWords(count, pool);
  }

  // ---------- Estado del juego ----------
  const INITIAL_WORD_COUNT = 60;
  const REFILL_THRESHOLD = 10;
  const REFILL_COUNT = 30;

  let words = [];
  let duration = parseInt(durationSelect.value, 10);
  let timer = duration;
  let timerInterval = null;
  let currentWordIndex = 0;
  let currentLetterIndex = 0;
  let totalWordsTyped = 0;
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let mistakesCount = {};
  let timerStarted = false;
  let wpmSamples = [];
  let scrollOffset = 0;

  function generateInitialWords() {
    const mode = modeSelect.value;
    if (mode === "prompts") return generatePromptWords(INITIAL_WORD_COUNT);
    if (mode === "terry") return terryWords.slice();
    if (mode === "practice") return buildPracticeWords(INITIAL_WORD_COUNT);
    return generateRandomWords(INITIAL_WORD_COUNT, baseWordBank);
  }

  function generateMoreWords(count) {
    const mode = modeSelect.value;
    if (mode === "prompts") return generatePromptWords(count);
    if (mode === "terry") return terryWords.slice();
    if (mode === "practice") return buildPracticeWords(count);
    return generateRandomWords(count, baseWordBank);
  }

  function wordHTML(word) {
    return `<span class="word">${word.split("").map(l => `<span class="letter faded">${l}</span>`).join("")}</span>`;
  }

  function appendWordsToDOM(newWords) {
    wordsContainer.insertAdjacentHTML("beforeend", newWords.map(wordHTML).join(" ") + " ");
  }

  function loadWords() {
    modeSelect.disabled = false;
    durationSelect.disabled = false;
    duration = parseInt(durationSelect.value, 10);
    timer = duration;
    statTime.textContent = String(timer);
    statWpm.textContent = "0";
    statAcc.textContent = "100%";
    resultDisplay.innerHTML = "";
    timerStarted = false;
    currentWordIndex = 0;
    currentLetterIndex = 0;
    totalWordsTyped = 0;
    correctChars = 0;
    incorrectChars = 0;
    extraChars = 0;
    mistakesCount = {};
    wpmSamples = [];
    scrollOffset = 0;

    if (modeSelect.value !== "practice") hidePracticeHint();

    words = generateInitialWords();
    wordsContainer.innerHTML = words.map(wordHTML).join(" ") + " ";
    wordsContainer.style.transform = "translateY(0px)";
    updateUI();
  }

  function maybeRefillWords() {
    if (currentWordIndex >= words.length - REFILL_THRESHOLD) {
      const more = generateMoreWords(REFILL_COUNT);
      words = words.concat(more);
      appendWordsToDOM(more);
    }
  }

  function updateWordScroll() {
    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (!currentWordSpan) return;
    const lineHeightPx = parseFloat(getComputedStyle(wordsContainer).lineHeight) || 32;
    const wordTop = currentWordSpan.offsetTop;
    const targetOffset = Math.max(0, wordTop - lineHeightPx);
    if (targetOffset !== scrollOffset) {
      scrollOffset = targetOffset;
      wordsContainer.style.transform = `translateY(-${targetOffset}px)`;
    }
  }

  function updateUI() {
    document.querySelectorAll(".letter").forEach(l => l.classList.remove("cursor"));
    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (currentWordSpan) {
      const letters = currentWordSpan.querySelectorAll(".letter");
      letters.forEach((letter, index) => {
        if (index >= currentLetterIndex) letter.classList.add("faded");
        else letter.classList.remove("faded");
      });
      const cursorTarget = letters[currentLetterIndex] || letters[letters.length - 1];
      if (cursorTarget) cursorTarget.classList.add("cursor");
    }
    updateWordScroll();
  }

  function countMistake(letter) {
    mistakesCount[letter] = (mistakesCount[letter] || 0) + 1;
  }

  function checkLetter(key) {
    if (!timerStarted) {
      timerStarted = true;
      modeSelect.disabled = true;
      durationSelect.disabled = true;
      startTimer();
    }

    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (!currentWordSpan) return;
    const letters = currentWordSpan.querySelectorAll(".letter");

    if (currentLetterIndex >= letters.length) {
      const extraSpan = document.createElement("span");
      extraSpan.className = "letter extra incorrect";
      extraSpan.textContent = key;
      currentWordSpan.appendChild(extraSpan);
      extraChars++;
      incorrectChars++;
      countMistake(key);
      playIncorrectSound();
      currentLetterIndex++;
      updateUI();
      updateLiveStats();
      return;
    }

    const currentLetter = letters[currentLetterIndex];
    if (key === currentLetter.textContent) {
      currentLetter.classList.add("correct");
      correctChars++;
      playCorrectSound();
    } else {
      currentLetter.classList.add("incorrect");
      countMistake(currentLetter.textContent);
      incorrectChars++;
      playIncorrectSound();
    }
    currentLetter.classList.remove("faded");
    currentLetterIndex++;
    updateUI();
    updateLiveStats();
  }

  function flashWord(isCorrect) {
    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (!currentWordSpan) return;
    currentWordSpan.classList.add(isCorrect ? "word-flash-correct" : "word-flash-incorrect");
    setTimeout(() => {
      currentWordSpan.classList.remove("word-flash-correct", "word-flash-incorrect");
    }, 260);
  }

  function processSpace() {
    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (!currentWordSpan) return;
    const letters = currentWordSpan.querySelectorAll(".letter:not(.extra)");
    const wordCorrect = currentLetterIndex === letters.length;
    for (let i = currentLetterIndex; i < letters.length; i++) {
      letters[i].classList.add("incorrect");
      letters[i].classList.remove("faded");
      countMistake(letters[i].textContent);
      incorrectChars++;
    }

    flashWord(wordCorrect);
    playWordSound();

    totalWordsTyped++;
    currentWordIndex++;
    currentLetterIndex = 0;
    maybeRefillWords();
    updateUI();
    updateLiveStats();
  }

  function deleteLetter() {
    if (currentLetterIndex === 0 && currentWordIndex > 0) {
      currentWordIndex--;
      const prevWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
      const letters = prevWordSpan.querySelectorAll(".letter");
      currentLetterIndex = letters.length;
    }
    const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
    if (!currentWordSpan) return;
    if (currentLetterIndex === 0) return;
    currentLetterIndex--;
    const letters = currentWordSpan.querySelectorAll(".letter");
    const letterSpan = letters[currentLetterIndex];
    if (!letterSpan) return;
    if (letterSpan.classList.contains("extra")) {
      if (letterSpan.classList.contains("incorrect")) {
        incorrectChars--;
        extraChars--;
      }
      letterSpan.remove();
    } else {
      if (letterSpan.classList.contains("correct")) correctChars--;
      if (letterSpan.classList.contains("incorrect")) incorrectChars--;
      letterSpan.classList.remove("correct", "incorrect");
      letterSpan.classList.add("faded");
    }
    updateUI();
    updateLiveStats();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const tag = document.activeElement ? document.activeElement.tagName : "";
      if (tag === "SELECT" || tag === "BUTTON" || tag === "INPUT" || tag === "A") return;
      e.preventDefault();
      restartGame();
      return;
    }
    if (timer <= 0) return;
    if (e.key === " ") {
      e.preventDefault();
      processSpace();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      deleteLetter();
    } else if (e.key.length === 1) {
      checkLetter(e.key);
    }
  });

  function elapsedSeconds() {
    return duration - Math.max(timer, 0);
  }

  function computeWpm(chars, elapsedSec) {
    const minutes = elapsedSec / 60;
    if (minutes <= 0) return 0;
    return Math.round((chars / 5) / minutes);
  }

  function recordWpmSample() {
    wpmSamples.push(computeWpm(correctChars, elapsedSeconds()));
  }

  function updateLiveStats() {
    const elapsed = timerStarted ? elapsedSeconds() : 0;
    const wpm = computeWpm(correctChars, elapsed);
    const totalTyped = correctChars + incorrectChars;
    const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    statWpm.textContent = String(wpm);
    statAcc.textContent = acc + "%";
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timer--;
      statTime.textContent = String(Math.max(timer, 0));
      recordWpmSample();
      updateLiveStats();
      if (timer <= 0) endGame();
    }, 1000);
  }

  function computeConsistency(samples) {
    const valid = samples.filter(s => s > 0);
    if (valid.length < 2) return 100;
    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
    if (mean === 0) return 100;
    const variance = valid.reduce((a, b) => a + (b - mean) ** 2, 0) / valid.length;
    const cv = Math.sqrt(variance) / mean;
    return Math.max(0, Math.round(100 - cv * 100));
  }

  function drawWpmGraph(canvas, samples) {
    if (!canvas || samples.length < 2) return;
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
    const padding = 8;
    const max = Math.max(...samples, 1);
    const stepX = (width - padding * 2) / (samples.length - 1);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding + ((height - padding * 2) / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.beginPath();
    samples.forEach((wpm, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (wpm / max) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function endGame() {
    clearInterval(timerInterval);
    timer = 0;
    statTime.textContent = "0";
    modeSelect.disabled = false;
    durationSelect.disabled = false;

    const finalWpm = computeWpm(correctChars, duration);
    const rawWpm = computeWpm(correctChars + incorrectChars, duration);
    const totalTyped = correctChars + incorrectChars;
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    const consistency = computeConsistency(wpmSamples);

    statWpm.textContent = String(finalWpm);
    statAcc.textContent = accuracy + "%";

    playFinishSound();

    const mode = modeSelect.value;
    const history = loadHistory();
    const sameSettings = history.filter(r => r.mode === mode && r.duration === duration);
    const previousBest = sameSettings.reduce((best, r) => Math.max(best, r.wpm), 0);
    const isRecord = finalWpm > 0 && finalWpm > previousBest;
    const last10 = sameSettings.slice(-10);
    const avgLast10 = last10.length > 0
      ? Math.round(last10.reduce((s, r) => s + r.wpm, 0) / last10.length)
      : null;

    history.push({
      date: new Date().toISOString(),
      mode,
      duration,
      wpm: finalWpm,
      rawWpm,
      accuracy,
      consistency,
      correctChars,
      incorrectChars,
      extraChars
    });
    saveHistory(history);
    mergeMistakes(mistakesCount);

    const topMistakes = Object.entries(mistakesCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    let comparisonMsg;
    if (isRecord) {
      comparisonMsg = previousBest > 0 ? `🏆 ¡Nuevo récord personal! (anterior: ${previousBest} wpm)` : "🏆 ¡Primer récord registrado!";
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
            <div class="result-stat"><span class="result-stat-value">${accuracy}%</span><span class="result-stat-label">Precisión</span></div>
            <div class="result-stat"><span class="result-stat-value">${consistency}%</span><span class="result-stat-label">Consistencia</span></div>
            <div class="result-stat"><span class="result-stat-value">${correctChars} / ${incorrectChars} / ${extraChars}</span><span class="result-stat-label">Correctos / Incorrectos / Extra</span></div>
          </div>
        </div>

        <canvas id="wpmGraph" class="wpm-graph"></canvas>

        ${topMistakes.length > 0 ? `
          <div class="mistake-chips">
            <span class="mistake-chips-label">Teclas más falladas:</span>
            ${topMistakes.map(([ch, count]) => `<span class="mistake-chip">${ch === " " ? "␣" : ch}<b>${count}</b></span>`).join("")}
          </div>` : ""}

        <p class="result-comparison">${comparisonMsg}</p>

        <div class="result-actions">
          <button id="retryBtn" type="button">Repetir</button>
          <button id="practiceBtn" type="button">Practicar mis errores</button>
        </div>
      </div>
    `;

    drawWpmGraph(document.getElementById("wpmGraph"), wpmSamples);
    document.getElementById("retryBtn")?.addEventListener("click", () => restartGame());
    document.getElementById("practiceBtn")?.addEventListener("click", () => {
      modeSelect.value = "practice";
      restartGame();
    });
  }

  function restartGame() {
    clearInterval(timerInterval);
    loadWords();
  }

  newGameBtn.addEventListener("click", () => restartGame());

  durationSelect.addEventListener("change", () => {
    if (!timerStarted) loadWords();
  });

  modeSelect.addEventListener("change", () => {
    if (!timerStarted) loadWords();
  });

  loadWords();
});
