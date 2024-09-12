/* eslint-disable @typescript-eslint/no-var-requires */

const express = require('express');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

import { statusCheck } from './utils/healthCheck';

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
app.use('/status', statusCheck);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend-ttt-nx!' });
});

io.on('connection', (socket) => onConnection(io, socket));


const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);