// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Your backend address

export default socket;
