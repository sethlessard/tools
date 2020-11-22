import * as path from "path";
import { mkdir, writeFile } from "fs";
import { promisify } from "util";
import FeatureOptions from "../entities/FeatureOptions";
import Language from "../entities/Language";

const pmkdir = promisify(mkdir);
const pwriteFile = promisify(writeFile);

/**
 * Create a new clean architecture feature in a specified directory.
 * @param options the feature options.
 */
const createCleanArchitectureFeature = (options: FeatureOptions) => {
  // calculate the feature directory.
  const featureDirectory = path.join(options.parentDirectory, options.name);

  // calculate the directories to create.
  const directories = [
    "data",
    "data/datasources",
    "data/models",
    "data/repositories",
    "domain",
    "domain/entities",
    "domain/repositories",
    "domain/usecases",
    "presentation/",
    "presentation/controllers",
    "presentation/models",
    "presentation/views"
  ].map(d => path.join(featureDirectory, d));

  // create the directories
  return Promise.all(
    // create the directory
    directories.map(d => pmkdir(d, { recursive: true })
      // initialize the feature files
      .then(() => {
        switch (options.language) {
          case Language.None:
            return pwriteFile(path.join(d, ".gitignore"), "Delete this file once the directory is populated.");
          case Language.Cpp:
            // TODO: implement
            break;
          case Language.JavaScript:
            // TODO: implement
            break;
          case Language.Kotlin:
            // TODO: implement
            break;
          case Language.Python:
            // TODO: implement
            break;
          case Language.TypeScript:
            // TODO: implement
            break;
        }
      }))
  );
};

export default createCleanArchitectureFeature;
