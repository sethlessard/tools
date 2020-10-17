import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import http from "http";
import socketio from "socket.io";

import { routes as httpRoutes } from "./routes/http";
import { registerRoutes } from "./routes/io";

const ADDRESS = process.env.ADDRESS || "0.0.0.0";
const PORT = (process.env.PORT) ? parseInt(process.env.PORT) : 3000; 

// define the express app
const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(httpRoutes);

// create the http server
const httpServer = http.createServer(app);

// create the socket.io server
const io = socketio(httpServer);
registerRoutes(io);

httpServer.listen(PORT, ADDRESS, () => {
  console.log(`API listening at ${ADDRESS}:${PORT}`);
});
