import ProjectOptions from "../ProjectOptions";
import NodeProjectType from "./NodeProjectType";

interface NodeProjectOptions extends ProjectOptions {
  description?: string;
  type: NodeProjectType;
}

export default NodeProjectOptions;