import { getSocketManagerInstance } from "../../manager/SocketManager";

const socketManager = getSocketManagerInstance();

/**
 * Register the socket.io routes.
 * @param {SocketIO.Server} io the socket.io server. 
 */
export const registerRoutes = (io) => {
  io.on('connection', _onSocketConnection);
};

/**
 * Handle a socket.io socket connection.
 * Register the socket routes here.
 * @param {SocketIO.Server} io the socket.io server
 * @param {SocketIO.Socket} socket the socket connection.
 */
const _onSocketConnection = (io, socket) => {
  socketManager.addConnection(socket.id, socket);
  // TODO: socket routes
  
  socket.on("disconnect", () => {
    socketManager.removeConnection(socket.id);
  });
};
