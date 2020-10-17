import ProjectOptions from "../ProjectOptions";
import CppProjectType from "./CppProjectType";

interface CppProjectOptions extends ProjectOptions {
  type: CppProjectType;
}

export default CppProjectOptions;
