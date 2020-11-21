import * as vscode from "vscode";
import * as _ from "lodash";
import { lstat, mkdir, writeFile } from "fs";
import * as path from "path";
import { promisify } from "util";
import { promptInput } from "../../util/WindowUtils";

const plstat = promisify(lstat);
const pmkdir = promisify(mkdir);
const pwriteFile = promisify(writeFile);

// TODO: implement
// enum Languages {
  // Blank = "Blank",
  // Cpp = "C++",
  // Kotlin = "Kotlin",
  // JavaScript = "JavaScript",
  // Python = "Python",
  // TypeScript = "TypeScript"
// };

/**
 * Change the git mode.
 * @param selectedUri the URI of the selected item.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const newCleanArchitectureFeature = async (selectedUri: vscode.Uri, context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  if (selectedUri === undefined) { };
  const isDirectory = (await plstat(selectedUri.fsPath)).isDirectory();
  if (!isDirectory) { selectedUri = vscode.Uri.file(path.dirname(selectedUri.fsPath)); }

  const featureName = await promptInput({ prompt: "What is the name of the feature?", placeHolder: "newFeature", requireValue: true });
  if (!featureName) { return; }

  selectedUri = vscode.Uri.file(path.join(selectedUri.fsPath, featureName));

  try {
      await _createFeatureDirectories(selectedUri);
  } catch (error) {
    vscode.window.showErrorMessage(`An error occurred: ${error}`);
    return;
  }
};

/**
 * Create the feature directories in the folder that was selected by the user.
 * @param selectedUri the folder that was selected by the user.
 */
const _createFeatureDirectories = (selectedUri: vscode.Uri) => {
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
  ].map(d => path.join(selectedUri.fsPath, d));

  return Promise.all(
    // create the directory
    directories.map(d => pmkdir(d, { recursive: true })
      // create the .gitignore
      .then(() => pwriteFile(path.join(d, ".gitignore"), "Delete this file once the directory is populated.")))
  );
};

export default newCleanArchitectureFeature;
