enum CProjectType {
  Simple
};

/**
 * Get the directory name for the template files for the C project. 
 * @param projectType the C project type.
 */
const getCProjectTemplateDirectory = (projectType: CProjectType) => {
  switch (projectType) {
    case CProjectType.Simple:
      return "simple";
  }
};

/**
 * Map a string to a CProjectType.
 * @param rawProjectType the string.
 */
const mapToCProjectType = (rawProjectType: string) => {
  switch (rawProjectType) {
    case "Simple":
      return CProjectType.Simple;
    default:
      return -1;
  };
};

export default CProjectType;
export {
  getCProjectTemplateDirectory,
  mapToCProjectType
};
