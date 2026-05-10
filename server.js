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

const getColorFromSocket = (socketId) => {
  if (socketId === players.white) return "w";

  if (socketId === players.black) return "b";

  return null;
};

const getGameStatus = () => {
  if (!players.white || !players.black) {
    return "Waiting for opponent...";
  }

  if (chess.isCheckmate()) {
    return "Checkmate";
  }

  if (chess.isDraw()) {
    return "Draw";
  }

  return chess.turn() === "w" ? "White to move" : "Black to move";
};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  if (!players.white) {
    players.white = socket.id;

    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;

    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  socket.emit("boardState", chess.fen());

  io.emit("gameStatus", getGameStatus());

  socket.on("move", (move) => {
    try {
      const playerColor = getColorFromSocket(socket.id);

      if (!playerColor) {
        socket.emit("invalidMove");

        return;
      }

      if (chess.turn() !== playerColor) {
        socket.emit("invalidMove");

        return;
      }

      const result = chess.move(move);

      if (!result) {
        socket.emit("invalidMove");

        return;
      }

      io.emit("move", move);

      io.emit("boardState", chess.fen());

      io.emit("gameStatus", getGameStatus());
    } catch (err) {
      console.error(err);

      socket.emit("invalidMove");
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    if (socket.id === players.white) {
      players.white = null;
    }

    if (socket.id === players.black) {
      players.black = null;
    }

    if (!players.white && !players.black) {
      chess.reset();

      io.emit("boardState", chess.fen());
    }

    io.emit("gameStatus", getGameStatus());
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
