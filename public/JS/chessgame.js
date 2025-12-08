const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const statusElement = document.getElementById("status");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// ---------- RENDER BOARD ----------
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);

        // only allow dragging your own color
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (!pieceElement.draggable) return;

          draggedPiece = pieceElement;
          sourceSquare = { row: rowIndex, col: squareIndex };
          e.dataTransfer.setData("text/plain", "");
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedPiece || !sourceSquare) return;

        const targetSquare = {
          row: parseInt(squareElement.dataset.row),
          col: parseInt(squareElement.dataset.col),
        };

        handleMove(sourceSquare, targetSquare);
      });

      boardElement.appendChild(squareElement);
    });
  });

  // flip board for black (visual only)
  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }

  updateStatus();
};

// ---------- HANDLE MOVE (NO STUPID INVERSION) ----------
const handleMove = (source, target) => {
  // chess.js board() is 0 = rank 8, 7 = rank 1
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
  };

  socket.emit("move", move);
};

// ---------- UNICODE PIECES ----------
const getPieceUnicode = (piece) => {
  const unicodePieces = {
    w: {
      p: "♙",
      r: "♖",
      n: "♘",
      b: "♗",
      q: "♕",
      k: "♔",
    },
    b: {
      p: "♟",
      r: "♜",
      n: "♞",
      b: "♝",
      q: "♛",
      k: "♚",
    },
  };

  return unicodePieces[piece.color][piece.type] || "";
};

// ---------- STATUS TEXT ----------
const updateStatus = () => {
  if (!statusElement) return;

  if (!playerRole) {
    statusElement.textContent = "You are a spectator.";
    return;
  }

  const you = playerRole === "w" ? "White" : "Black";
  const turn = chess.turn() === "w" ? "White" : "Black";

  statusElement.textContent = `You are ${you}. Turn: ${turn}`;
};

// ---------- SOCKET EVENTS ----------
socket.on("playerRole", (role) => {
  playerRole = role; // 'w' or 'b'
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("invalidMove", (move) => {
  console.warn("Invalid move from server:", move);
});
