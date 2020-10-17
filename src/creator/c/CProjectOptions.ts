import ProjectOptions from "../ProjectOptions";
import CProjectType from "./CProjectType";

interface CProjectOptions extends ProjectOptions {
  type: CProjectType;
}

export default CProjectOptions;
