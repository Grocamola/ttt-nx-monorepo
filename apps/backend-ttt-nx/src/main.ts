const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const PocketBase = require('pocketbase/cjs');

const app = express();
const pb = new PocketBase('https://ttt-nx.pockethost.io/');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend-ttt-nx!' });
});

const activeUsers = {};
const gameSessions = {}; // Store game sessions with socket IDs

let board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
let currentPlayer = "X";
let moves = [];

let winner = "";
let winnerClass = "";
let isTie = false;

const WinnerCheck = (board) => {
  for (let col = 0; col < board.length; col++) {
    if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
      winner = board[0][col];
      winnerClass = col === 0 ? 'col-left' : col === 1 ? 'col-center' : col === 2 ? 'col-right' : '';
      return;
    }
  }
  for (let row = 0; row < board.length; row++) {
    if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
      winner = board[row][0];
      winnerClass = row === 0 ? 'row-up' : row === 1 ? 'row-center' : row === 2 ? 'row-down' : '';
      return;
    }
  }
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    winner = board[0][0];
    winnerClass = 'diagonal-left';
    return;
  }
  if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    winner = board[0][2];
    winnerClass = 'diagonal-right';
    return;
  }
  if (board.flat().every(cell => isNaN(cell))) {
    isTie = true;
    return;
  }
}

const clearBoard = () => {
  board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  moves = [];
  winner = "";
  winnerClass = "";
  isTie = false;
};

const handleMove = (socket, data) => {
  const { rowIndex, colIndex, currentPlayer } = data;
  board[rowIndex][colIndex] = currentPlayer;
  moves.push([currentPlayer, rowIndex + 1, colIndex + 1]);
  WinnerCheck(board);

  io.emit('move-response', {
    board,
    currentPlayer,
    moves,
    winner,
    winnerClass,
    isTie,
    nextPlayer: currentPlayer === "X" ? "O" : "X"
  });
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    const session = gameSessions[socket.id];
    if (session) {
      const opponentSocketId = session.opponent;
      if (opponentSocketId) {
        io.to(opponentSocketId).emit('game-end', { message: 'Opponent disconnected' });
      }
      delete gameSessions[opponentSocketId];
      delete gameSessions[socket.id];
    }
    io.emit('activeUsers', Object.values(activeUsers));
  });

  socket.on('signin', async (formData) => {
    console.log('Signin data:', formData);
    if (!formData.username || !formData.password) {
      console.error('Username or password missing');
      socket.emit('signin-response', { success: false, error: 'Username or password missing' });
      return;
    }

    try {
      const authData = await pb.collection('Players').authWithPassword(formData.username, formData.password);
      console.log('Authentication successful:', authData);

      activeUsers[socket.id] = formData.username;
      socket.emit('signin-response', { success: true, authData });

      io.emit('activeUsers', Object.values(activeUsers));
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('signin-response', { success: false, error: error.message });
    }
  });

  socket.on('send-invitation', (data) => {
    const { from, to } = data;
    console.log(`Invitation from ${from} to ${to}`);
    const toSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === to);
    if (toSocketId) {
      io.to(toSocketId).emit('receive-invitation', { from, to });
    }
  });

  socket.on('accept-invitation', (data) => {
    const { from, to } = data;
    const playerXSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === from);
    const playerOSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === to);

    if (playerXSocketId && playerOSocketId) {
      gameSessions[playerXSocketId] = { opponent: playerOSocketId, player: "X" };
      gameSessions[playerOSocketId] = { opponent: playerXSocketId, player: "O" };

      io.to(playerXSocketId).emit('game-start', {
        board,
        currentPlayer: "X",
        moves,
        players: { X: from, O: to }
      });
      io.to(playerOSocketId).emit('game-start', {
        board,
        currentPlayer: "X",
        moves,
        players: { X: from, O: to }
      });
    }
  });

  socket.on('move', (data) => {
    const session = gameSessions[socket.id];
    if (session) {
      handleMove(socket, data);
    } else {
      console.error('Invalid game session for socket ID:', socket.id);
    }
  });

  socket.on('new-message', (data) => {
    const session = gameSessions[socket.id];
    if (session) {
      const recipientSocketId = session.opponent;
      io.to(recipientSocketId).emit('message-broadcast', data);
      io.to(socket.id).emit('message-broadcast', data);
    } else {
      console.error('Invalid game session for socket ID:', socket.id);
    }
  });

});

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
