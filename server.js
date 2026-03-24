import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "public")));

let waitingPlayer = null;

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function getWinner(choice1, choice2) {
  if (choice1 === choice2) return "draw";

  if (
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper")
  ) {
    return "player1";
  }

  return "player2";
}

function createGame(player1, player2) {
  const game = {
    player1,
    player2,
    score1: 0,
    score2: 0,
    round: 1
  };

  player1.game = game;
  player2.game = game;

  player1.role = "player1";
  player2.role = "player2";

  player1.opponent = player2;
  player2.opponent = player1;

  player1.playerChoice = null;
  player2.playerChoice = null;

  return game;
}

function sendScoreUpdate(game) {
  send(game.player1, {
    type: "scoreUpdate",
    yourScore: game.score1,
    opponentScore: game.score2,
    round: game.round
  });

  send(game.player2, {
    type: "scoreUpdate",
    yourScore: game.score2,
    opponentScore: game.score1,
    round: game.round
  });
}

wss.on("connection", (ws) => {
  console.log("A player connected.");

  ws.playerChoice = null;
  ws.opponent = null;
  ws.game = null;
  ws.role = null;

  if (waitingPlayer === null) {
    waitingPlayer = ws;

    send(ws, {
      type: "status",
      message: "Waiting for another player..."
    });
  } else {
    const player1 = waitingPlayer;
    const player2 = ws;

    waitingPlayer = null;

    const game = createGame(player1, player2);

    send(player1, {
      type: "status",
      message: "Opponent connected! Make your choice."
    });

    send(player2, {
      type: "status",
      message: "Connected! Make your choice."
    });

    sendScoreUpdate(game);
  }

  ws.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.log("Invalid message received.");
      return;
    }

    if (data.type === "choice") {
      if (!ws.game) return;

      ws.playerChoice = data.choice;

      send(ws, {
        type: "status",
        message: `You chose ${data.choice}. Waiting for opponent...`
      });

      const opponent = ws.opponent;
      const game = ws.game;

      if (opponent && opponent.playerChoice) {
        const player1 = game.player1;
        const player2 = game.player2;

        const winner = getWinner(player1.playerChoice, player2.playerChoice);

        let result1 = "";
        let result2 = "";

        if (winner === "draw") {
          result1 = "It's a draw!";
          result2 = "It's a draw!";
        } else if (winner === "player1") {
          result1 = "You win!";
          result2 = "You lose!";
          game.score1 += 1;
        } else {
          result1 = "You lose!";
          result2 = "You win!";
          game.score2 += 1;
        }

        send(player1, {
          type: "result",
          yourChoice: player1.playerChoice,
          opponentChoice: player2.playerChoice,
          result: result1,
          yourScore: game.score1,
          opponentScore: game.score2,
          round: game.round
        });

        send(player2, {
          type: "result",
          yourChoice: player2.playerChoice,
          opponentChoice: player1.playerChoice,
          result: result2,
          yourScore: game.score2,
          opponentScore: game.score1,
          round: game.round
        });

        player1.playerChoice = null;
        player2.playerChoice = null;
        game.round += 1;
      }
    }
  });

  ws.on("close", () => {
    console.log("A player disconnected.");

    if (waitingPlayer === ws) {
      waitingPlayer = null;
    }

    const opponent = ws.opponent;
    const game = ws.game;

    if (opponent && opponent.readyState === WebSocket.OPEN) {
      opponent.opponent = null;
      opponent.playerChoice = null;
      opponent.game = null;
      opponent.role = null;

      send(opponent, {
        type: "status",
        message: "Opponent disconnected. Waiting for a new player..."
      });

      send(opponent, {
        type: "resetScores"
      });

      waitingPlayer = opponent;
    }

    if (game) {
      ws.game = null;
      ws.role = null;
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});