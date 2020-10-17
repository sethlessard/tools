enum CppProjectType {
  Simple
};

/**
 * Get the directory name for the template files for the C++ project. 
 * @param projectType the C project type.
 */
const getCppProjectTemplateDirectory = (projectType: CppProjectType) => {
  switch (projectType) {
    case CppProjectType.Simple:
      return "simple";
  }
};

/**
 * Map a string to a CppProjectType.
 * @param rawProjectType the string.
 */
const mapToCppProjectType = (rawProjectType: string) => {
  switch (rawProjectType) {
    case "Simple":
      return CppProjectType.Simple;
    default:
      return -1;
  };
};

export default CppProjectType;
export {
  getCppProjectTemplateDirectory,
  mapToCppProjectType
};
