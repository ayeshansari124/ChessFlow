const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const chess = new Chess();

let players = {
  white: null,
  black: null,
};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

// ---------- HELPER ----------
const getColorFromSocket = (socketId) => {
  if (socketId === players.white) return "w";
  if (socketId === players.black) return "b";
  return null;
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Assign role
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
    console.log("Assigned WHITE to", socket.id);
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
    console.log("Assigned BLACK to", socket.id);
  } else {
    socket.emit("spectatorRole");
    console.log("Assigned SPECTATOR to", socket.id);
  }

  // Send current board state to new client
  socket.emit("boardState", chess.fen());

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    let resetNeeded = false;

    if (socket.id === players.white) {
      players.white = null;
      resetNeeded = true;
      console.log("White left, resetting game.");
    } else if (socket.id === players.black) {
      players.black = null;
      resetNeeded = true;
      console.log("Black left, resetting game.");
    }

    // If a player leaves, reset the game
    if (resetNeeded) {
      chess.reset();
      io.emit("boardState", chess.fen());
    }
  });

  socket.on("move", (move) => {
    try {
      const playerColor = getColorFromSocket(socket.id);

      // Spectators or unknown sockets cannot move
      if (!playerColor) {
        console.log("Move rejected: spectator tried to move.");
        socket.emit("invalidMove", move);
        return;
      }

      // Enforce turn
      if (chess.turn() !== playerColor) {
        console.log("Move rejected: wrong turn.");
        socket.emit("invalidMove", move);
        return;
      }

      const result = chess.move(move);

      if (result) {
        console.log("Move played:", move.from, "->", move.to);
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        socket.emit("invalidMove", move);
      }
    } catch (err) {
      console.error("Error processing move:", err);
      socket.emit("invalidMove", move);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
