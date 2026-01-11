document.addEventListener("DOMContentLoaded", () => {
    const wordsContainer = document.getElementById("words");
    const timerDisplay = document.getElementById("info");
    const newGameBtn = document.getElementById("newGameBtn");
    const durationSelect = document.getElementById("durationSelect");
    const modeSelect = document.getElementById("modeSelect");
    const resultDisplay = document.getElementById("result");
  
    // Banco de palabras base
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
    // Posible update trabajar el WordBank con JSON y luego API
  
    // Texto completo de Terry Davis, en orden y con sentido (sin símbolos especiales)
    const terryText = "Whats reality I dont know When my bird was looking at my computer monitor I thought That bird has no idea what hes looking at And yet what does the bird do Does he panic No he cant really panic he just does the best he can Is he able to live in a world where hes so ignorant Well he doesnt really have a choice The bird is okay even though he doesnt understand the world Youre that bird looking at the monitor and youre thinking to yourself I can figure this out Maybe you have some bird ideas Maybe thats the best you can do";
  
    // Variables globales
    let words = [];
    let duration = parseInt(durationSelect.value); // duración en segundos
    let timer = duration;
    let timerInterval;
    let currentWordIndex = 0;
    let currentLetterIndex = 0;
    let totalWordsTyped = 0;
    let mistakesCount = {};
    let timerStarted = false; // Para iniciar el timer con la primera tecla
  
    // Genera un texto con numWords palabras a partir de un array dado
    function generateTextFromBank(numWords, bank) {
      let randomWords = [];
      for (let i = 0; i < numWords; i++) {
        const randomIndex = Math.floor(Math.random() * bank.length);
        randomWords.push(bank[randomIndex]);
      }
      return randomWords;
    }
  
    // Cargar palabras según el modo seleccionado
    function loadWords() {
      // Habilitar controles y reiniciar variables
      modeSelect.disabled = false;
      duration = parseInt(durationSelect.value);
      timer = duration;
      timerDisplay.textContent = "Time: " + timer;
      resultDisplay.innerHTML = "";
      timerStarted = false;
      currentWordIndex = 0;
      currentLetterIndex = 0;
      totalWordsTyped = 0;
      mistakesCount = {};
  
      if (modeSelect.value === "terry") {
        // Usamos el texto completo de Terry Davis, conservando el orden y el sentido.
        // Separamos la cadena en palabras usando espacios.
        words = terryText.split(" ");
      } else {
        // Modo random: generamos, por ejemplo, 50 palabras.
        words = generateTextFromBank(50, baseWordBank);
      }
      // Insertamos en el DOM cada palabra y cada letra en un span.
      wordsContainer.innerHTML = words
        .map(word => `<span class="word">${word.split('').map(letter => `<span class="letter faded">${letter}</span>`).join("")}</span>`)
        .join(" ");
    }
  
    // Iniciar el temporizador
    function startTimer() {
      timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = "Tiempo: " + timer;
        if (timer <= 0) {
          endGame();
        }
      }, 1000);
    }
  
    // Actualiza la interfaz: cursor y estado de letras
    function updateUI() {
      document.querySelectorAll(".letter").forEach(letter => letter.classList.remove("cursor"));
  
      const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
      if (currentWordSpan) {
        const letters = currentWordSpan.querySelectorAll(".letter");
        letters.forEach((letter, index) => {
          if (index >= currentLetterIndex) {
            letter.classList.add("faded");
          } else {
            letter.classList.remove("faded");
          }
        });
        if (letters[currentLetterIndex]) {
          letters[currentLetterIndex].classList.add("cursor");
        }
      }
    }
  
    // Registra errores por letra
    function countMistake(letter) {
      mistakesCount[letter] = mistakesCount[letter] ? mistakesCount[letter] + 1 : 1;
    }
  
    // Procesa la letra tecleada
    function checkLetter(key) {
      // Inicia el timer al pulsar la primera tecla alfabética
      if (!timerStarted && /^[a-zA-Z]$/.test(key)) {
        timerStarted = true;
        modeSelect.disabled = true; // Evita cambiar el modo una vez iniciado
        startTimer();
      }
  
      const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
      if (!currentWordSpan) return;
      const letters = currentWordSpan.querySelectorAll(".letter");
      if (currentLetterIndex >= letters.length) return;
  
      let currentLetter = letters[currentLetterIndex];
      if (key === currentLetter.textContent) {
        currentLetter.classList.add("correct");
      } else {
        currentLetter.classList.add("incorrect");
        countMistake(currentLetter.textContent);
      }
      currentLetter.classList.remove("faded");
      currentLetterIndex++;
      updateUI();
    }
  
    // Procesa la barra espaciadora para avanzar a la siguiente palabra
    function processSpace() {
      const currentWordSpan = wordsContainer.querySelectorAll(".word")[currentWordIndex];
      if (!currentWordSpan) return;
      const letters = currentWordSpan.querySelectorAll(".letter");
      for (let i = currentLetterIndex; i < letters.length; i++) {
        letters[i].classList.add("incorrect");
        letters[i].classList.remove("faded");
        countMistake(letters[i].textContent);
      }
      totalWordsTyped++;
      currentWordIndex++;
      currentLetterIndex = 0;
      updateUI();
      // Finaliza el juego si se acaban las palabras en pantalla
      if (currentWordIndex >= wordsContainer.querySelectorAll(".word").length) {
        endGame();
      }
    }
  
    // Permite borrar la última letra, retrocediendo entre palabras si es necesario
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
      let letterSpan = letters[currentLetterIndex];
      letterSpan.classList.remove("correct", "incorrect");
      letterSpan.classList.add("faded");
      updateUI();
    }
  
    // Manejar eventos de teclado
    document.addEventListener("keydown", (e) => {
      if (timer <= 0) return; // Si el tiempo terminó, no procesar
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
  
    // Finaliza el juego, calcula WPM y muestra estadísticas
    function endGame() {
      clearInterval(timerInterval);
      const wpm = Math.round((totalWordsTyped / duration) * 60);
      const errors = Object.entries(mistakesCount)
        .sort((a, b) => b[1] - a[1])
        .map(([letter, count]) => `${letter}: ${count}`)
        .join("<br>");
  
      const resultMessage = `
        <div class="resultBox">
          <h2>Results</h2>
          <p><strong>Words:</strong> ${totalWordsTyped}</p>
          <p><strong>WPM:</strong> ${wpm}</p><br>
          ${errors ? `<p><strong>Mistakes:</strong><br>${errors}</p>` : ""}
        </div>
      `;
      resultDisplay.innerHTML = resultMessage;
    }
  
    // Reiniciar juego
    newGameBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      loadWords();
      timerDisplay.textContent = "Time: " + durationSelect.value;
    });
  
    // Inicialización
    loadWords();
  });
  