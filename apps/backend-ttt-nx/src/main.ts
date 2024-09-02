
const PocketBase = require('pocketbase/cjs');
const express = require('express');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

import { onConnection } from "./controllers/gameController";


const app = express();
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

io.on('connection', (socket) => onConnection(io, socket));


const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);