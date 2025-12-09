# ChessFlow – Real-time Multiplayer Chess Platform

A real-time chess platform to **play live multiplayer matches, drag & drop pieces, and watch moves sync instantly across players.**  
Built using **WebSockets** with smooth board rendering, turn validation, and role-based gameplay.

---

## 🚀 Features

### 🧑‍🤝‍🧑 Multiplayer Gameplay
- Real-time communication using **Socket.io**
- Automatic role assignment: **White**, **Black**, or **Spectator**
- Turn-based validation using **chess.js**
- Move syncing across all connected clients
- Visual board flipping for Black

---

## ♟ Core Chess Functionality
- Drag & drop piece movement
- Full rule validation via **chess.js**
- Only your assigned color can move
- Smooth board updates using FEN syncing

---

## 🎨 Frontend UI
- Clean, minimal chess interface  
- Light/Dark square styling  
- Automatic rotation when playing as Black  
- Real-time status indicator:  
  - **You are White / Black**  
  - **Turn: White / Black**

---

## 🛠 Tech Stack
- **Node.js + Express** – backend server  
- **Socket.io** – real-time communication  
- **Chess.js** – game logic & rules engine  
- **EJS** – templating for UI  
- **HTML / CSS / JavaScript** – clean and lightweight frontend  

---

## 📚 Learnings
- Implementing real-time apps with **Socket.io**  
- Enforcing turn logic and move permissions based on color  
- Mapping drag events to algebraic chess notation  
- Rendering and syncing **FEN** states between players  
- Managing multi-client state conflicts  
- Structuring a scalable real-time game loop in **Node.js**

---

### Built with ❤️ by Ayesha  
