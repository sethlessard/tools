
let _instance = null;

/**
 * Get the SocketManager instance.
 * @returns {SocketManager} the SocketManager instance.
 */
const getSocketManagerInstance = () => {
  if (_instance == null) {
    _instance = new SocketManager();
  }
  return _instance;
};

class SocketManager {

  constructor() {
    this._connections = {};
  }

  /**
   * Add a socket.io connection.
   * @param {string} id the id of the socket.
   * @param {SocketIO.Socket} socket the socket.io socket.
   */
  addConnection(id, socket) {
    this._connections[id] = socket;
  }

  /**
   * Check to see if a given socket is connected.
   * @param {string} id the id of the socket.
   * @returns {boolean} true if connected, false if not.
   */
  hasConnection(id) {
    return this._connections[id] != null && this._connections[id] !== undefined;
  }

  /**
   * Get a socket connected by its id.
   * @param {string} id the id of the socket.
   * @returns {SocketIO.Socket} the socket.io socket.
   */
  getConnection(id) {
    return this._connections[id];
  }

  /**
   * Remove a socket form the connections list.
   * @param {string} id the id of the socket.
   */
  removeConnection(id) {
    this._connections[id] = null;
  }
}

export default SocketManager;
export { getSocketManagerInstance };
