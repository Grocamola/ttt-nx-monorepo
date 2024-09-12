// eslint-disable-next-line @typescript-eslint/no-var-requires
const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase(process.env.POCKETBASE_URL);

import { WinnerCheck } from "../utils/winnerCheck";

const activeUsers = {};
const gameSessions = {}; // Store game sessions with socket IDs

let board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
let currentPlayer = "X";
let moves = [];
let score = {playerX: 0, playerO: 0}

let winner = "";
let winnerClass = "";
let isTie = false;

const clearBoard = () => {
  board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  moves = [];
  winner = "";
  winnerClass = "";
  isTie = false;
  score = {playerX: 0, playerO: 0}
};

const handleMove = (io, data) => {
    const { rowIndex, colIndex, currentPlayer } = data;
    board[rowIndex][colIndex] = currentPlayer;
    currentPlayer.length > 0 && moves.push([currentPlayer, rowIndex + 1, colIndex + 1]);
    ({winner, winnerClass, isTie} = WinnerCheck(board, winner, winnerClass, isTie));
  
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


export const onConnection = (io, socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('user-logout', (data) => {
      const { username } = data;
      console.log(`${username} has logged out`);
      socket.disconnect();
  
      clearBoard()
    });
  
    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        const session = gameSessions[socket.id];
  
        clearBoard()
  
        if (session) {
            const opponentSocketId = session.opponent;
            if (opponentSocketId) {
                io.to(opponentSocketId).emit('game-end', { message: 'Opponent disconnected'});
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
      if (!data || !data.from || !data.to) {
          console.error('Invalid invitation data:', data);
          return;
      }
  
      const { from, to } = data;
      console.log(`Invitation from ${from} to ${to}`);
      const toSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === to);
      if (toSocketId) {
          io.to(toSocketId).emit('receive-invitation', { from, to });
      }
    });
  
    socket.on('accept-invitation', (data) => {
      console.log(data)
      if (!data || !data.from || !data.to) {
          console.error('Invalid invitation data:', data);
          return;
      }
  
      const { from, to } = data;
      const playerXSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === from);
      const playerOSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === to);
  
      console.log("HERE: playerXSocketId:",playerXSocketId, ", playerOSocketId: " ,playerOSocketId)
      if (playerXSocketId && playerOSocketId) {
          gameSessions[playerXSocketId] = { opponent: playerOSocketId, player: "X" };
          gameSessions[playerOSocketId] = { opponent: playerXSocketId, player: "O" };

          io.emit('game-notification', "game-start")

          io.emit('game-start', {
            board,
              currentPlayer: "X",
              moves,
              players: { X: from, O: to }
          })
  
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
        handleMove(io, data);
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
  
    socket.on('new-game-request' , () => {
      if(winner === "X"){
        score.playerX += 1
      } else if(winner === "O") { 
        score.playerO += 1
      }
  
      board = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      currentPlayer = winner;
      moves = [];
      winner = "";
      winnerClass = "";
      isTie = false;
  
      io.emit('new-game-response', {
        board,
        currentPlayer,
        moves,
        winner,
        winnerClass,
        isTie,
        nextPlayer: currentPlayer,
        score
      });

      io.emit('new-game-notification', {message: 'success'})
      
    })
  
  };