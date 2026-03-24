# 🪨📄✂️ Multiplayer Rock Paper Scissors Game

A real-time multiplayer Rock Paper Scissors game built using **Node.js**, **Express**, and **WebSockets**.  
Two players can connect to the same game, make their choices, and see the results update instantly in the browser.

This project demonstrates real-time communication between clients and a server, server-side score tracking, and multiplayer game logic.

---

## 🎮 Live Demo

https://multiplayer-rock-paper-scissors-1-j75x.onrender.com

Note: The game runs on a free hosting tier. 
If the server has been inactive, the first request may take up to 60 seconds to load.
---

## 🚀 Features

- Real-time multiplayer gameplay
- WebSocket communication
- Server-side score tracking
- Round-based gameplay
- Automatic player matchmaking
- Cartoon-style interactive UI
- Responsive browser interface
- Multiplayer synchronization

---

## 🧠 What This Project Demonstrates

This project shows understanding of:

- Client-server architecture
- Real-time communication
- WebSockets
- Backend logic
- Game state management
- Multiplayer synchronization
- Node.js server development
- Frontend and backend integration

---

## 🛠 Tech Stack

Frontend:

- HTML
- CSS
- JavaScript

Backend:

- Node.js
- Express
- WebSockets (ws)

Tools:

- VS Code
- Git
- GitHub

---

## 📂 Project Structure

multiplayer-rock-paper-scissors

├── server.js  
├── package.json  
├── package-lock.json  
├── .gitignore  

├── public  
│   ├── index.html  
│   ├── style.css  
│   └── script.js  


---

## ⚙️ How It Works

### Step 1 — Server Starts

The Node.js server starts and listens for connections.

node server.js

The server:

- waits for players
- matches two players together
- manages the game logic
- tracks scores
- sends results back to players

---

### Step 2 — Players Connect

Each browser connects to the server using WebSockets.

This creates a live connection between:

- the browser
- the server

---

### Step 3 — Players Make Choices

Each player selects:

- Rock
- Paper
- Scissors

The browser sends the choice to the server.

---

### Step 4 — Server Determines Winner

The server compares both choices and decides:

- Win
- Lose
- Draw

---

### Step 5 — Score Updates

The server:

- updates the score
- increases the round number
- sends the result to both players

Both players see the same result instantly.

---

## 🔌 What Are WebSockets?

WebSockets allow real-time communication between the browser and the server.

Instead of sending one request and waiting for a response, the connection stays open so messages can be sent instantly.

This makes features like multiplayer games possible.

---

## ▶️ How to Run Locally

### Install dependencies

npm install

### Start the server

node server.js

or

npm start

### Open the game

http://localhost:3000

---

## 🧪 How to Test Multiplayer

Open the game in:

- one normal browser window
- one private/incognito window

Then play against yourself.

---

## 💡 Future Improvements

- Player names
- Sound effects
- Animations
- First-to-5 win mode
- Rematch button

---

## 🧑‍💻 Author

Veeasha Packirisamy

---

## 📌 Why I Built This Project

I built this project to practice real-time communication and multiplayer game development using WebSockets.  
It helped me understand how frontend and backend systems interact and how servers manage shared game state between multiple users.
