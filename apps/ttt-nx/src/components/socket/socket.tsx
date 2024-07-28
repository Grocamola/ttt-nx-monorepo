import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3333";
const socket: Socket = io(URL);

export default socket;