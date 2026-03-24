const statusText = document.getElementById("status");
const yourChoiceText = document.getElementById("yourChoice");
const opponentChoiceText = document.getElementById("opponentChoice");
const resultText = document.getElementById("result");
const yourScoreText = document.getElementById("yourScore");
const opponentScoreText = document.getElementById("opponentScore");
const choiceButtons = document.querySelectorAll(".choice-btn");

let yourScore = 0;
let opponentScore = 0;
let currentRound = 1;
let opponentConnected = false;
let hasChosenThisRound = false;

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${protocol}//${window.location.host}`);


const bgContainer = document.getElementById("backgroundIcons");
const bgIcons = document.querySelectorAll(".bg-icon");

if (bgContainer && bgIcons.length > 0) {

  const states = [];

  bgIcons.forEach(icon => {

    states.push({
      element: icon,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,

      dx:
        (Math.random() * 1.5 + 0.5) *
        (Math.random() < 0.5 ? -1 : 1),

      dy:
        (Math.random() * 1.5 + 0.5) *
        (Math.random() < 0.5 ? -1 : 1)
    });

  });

  function animateBackgroundIcons() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    states.forEach(state => {

      const icon = state.element;

      const iconWidth = icon.offsetWidth;
      const iconHeight = icon.offsetHeight;

      state.x += state.dx;
      state.y += state.dy;

      if (
        state.x <= 0 ||
        state.x + iconWidth >= width
      ) {
        state.dx *= -1;
      }

      if (
        state.y <= 0 ||
        state.y + iconHeight >= height
      ) {
        state.dy *= -1;
      }

      icon.style.transform =
        `translate(${state.x}px, ${state.y}px)`;

    });

    requestAnimationFrame(animateBackgroundIcons);

  }

  animateBackgroundIcons();

}
function setStatus(message) {
  statusText.textContent = message;
}

function setResult(message, type = "") {
  resultText.textContent = message;
  resultText.classList.remove("win-text", "lose-text", "draw-text");

  if (type) {
    resultText.classList.add(type);
  }
}

function setButtonsDisabled(disabled) {
  choiceButtons.forEach((button) => {
    button.classList.toggle("disabled", disabled);
    button.disabled = disabled;
  });
}

function updateScores() {
  yourScoreText.textContent = yourScore;
  opponentScoreText.textContent = opponentScore;
}

function resetMatchUI() {
  yourScore = 0;
  opponentScore = 0;
  currentRound = 1;
  hasChosenThisRound = false;
  opponentConnected = false;

  yourChoiceText.textContent = "—";
  opponentChoiceText.textContent = "—";
  setResult("Pick your move!");
  updateScores();
  setButtonsDisabled(true);
}

socket.addEventListener("open", () => {
  setStatus("Connected! Looking for another player...");
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "status") {
    setStatus(data.message);

    const message = data.message.toLowerCase();

    if (
      message === "waiting for another player..." ||
      message.includes("opponent disconnected")
    ) {
      opponentConnected = false;
      hasChosenThisRound = false;
      setButtonsDisabled(true);
    } else if (
      message.includes("opponent connected") ||
      message.includes("connected! make your choice") ||
      message.includes("make your choice")
    ) {
      opponentConnected = true;
      hasChosenThisRound = false;
      setButtonsDisabled(false);
      yourChoiceText.textContent = "—";
      opponentChoiceText.textContent = "—";
      setResult(`Round ${currentRound}: choose your move!`);
    } else if (message.includes("you chose")) {
      hasChosenThisRound = true;
      setButtonsDisabled(true);
    }
  }

  if (data.type === "scoreUpdate") {
    yourScore = data.yourScore;
    opponentScore = data.opponentScore;
    currentRound = data.round;
    updateScores();
  }

  if (data.type === "result") {
    yourChoiceText.textContent = data.yourChoice;
    opponentChoiceText.textContent = data.opponentChoice;

    yourScore = data.yourScore;
    opponentScore = data.opponentScore;
    currentRound = data.round + 1;
    updateScores();

    if (data.result.toLowerCase().includes("win")) {
      setResult(`You win round ${data.round}! `, "win-text");
    } else if (data.result.toLowerCase().includes("lose")) {
      setResult(`You lose round ${data.round}! `, "lose-text");
    } else {
      setResult(`Round ${data.round} is a draw! `, "draw-text");
    }

    hasChosenThisRound = false;
    opponentConnected = true;
    setButtonsDisabled(false);
    setStatus(`Score: ${yourScore} - ${opponentScore}. Pick again for round ${currentRound}.`);
  }

  if (data.type === "resetScores") {
    resetMatchUI();
    setStatus("Opponent left. Waiting for a new player...");
  }
});

socket.addEventListener("close", () => {
  setStatus("Connection closed. Refresh to try again.");
  setButtonsDisabled(true);
});

socket.addEventListener("error", () => {
  setStatus("Something went wrong with the connection.");
  setButtonsDisabled(true);
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!opponentConnected || hasChosenThisRound) {
      return;
    }

    const choice = button.dataset.choice;

    socket.send(
      JSON.stringify({
        type: "choice",
        choice: choice
      })
    );

    hasChosenThisRound = true;
    yourChoiceText.textContent = choice;
    opponentChoiceText.textContent = "?";
    setResult(`Round ${currentRound}: waiting for your opponent...`);
    setStatus(`You picked ${choice}. Now waiting dramatically...`);
    setButtonsDisabled(true);
  });
});

updateScores();
setButtonsDisabled(true);