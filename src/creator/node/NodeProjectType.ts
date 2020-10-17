
const EXPRESS_API = "Express API";
const REACT_APP = "React App";
const REACT_LIBRARY = "React Library";
const SOCKET_IO_SERVER = "Socket.IO Server";

enum NodeProjectType {
  Api,
  ReactApp,
  ReactLibrary,
  SocketIOServer
};

/**
 * Get the directory name for the template files for the Node JS project. 
 * @param projectType the Node JS project type.
 */
const getNodeProjectTemplateDirectory = (projectType: NodeProjectType) => {
  switch (projectType) {
    case NodeProjectType.Api:
      return "simple-api";
    case NodeProjectType.SocketIOServer:
      return "simple-socketio-server";
  }
  return null;
};

/**
 * Map a string to a NodeProjectType.
 * @param rawProjectType the string.
 */
const mapToNodeProjectType = (rawProjectType: string) => {
  switch (rawProjectType) {
    case EXPRESS_API:
      return NodeProjectType.Api;
    case REACT_APP:
      return NodeProjectType.ReactApp;
    case REACT_LIBRARY:
      return NodeProjectType.ReactLibrary;
    case SOCKET_IO_SERVER:
      return NodeProjectType.SocketIOServer;
    default:
      return -1;
  };
};

export default NodeProjectType;
export {
  getNodeProjectTemplateDirectory,
  mapToNodeProjectType,
  EXPRESS_API,
  REACT_APP,
  REACT_LIBRARY,
  SOCKET_IO_SERVER
};
