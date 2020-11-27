import * as vscode from "vscode";
import * as _ from "lodash";
import { lstat } from "fs";
import * as path from "path";
import { promisify } from "util";
import { promptInput } from "../../../../../util/WindowUtils";
import createCleanArchitectureFeature from "../../domain/usecases/createCleanArchitectureFeature";
import FeatureOptions, { mapToDomainFeatureOptions } from "../models/FeatureOptions";
import DomainFeatureOptions from "../../domain/entities/FeatureOptions";
import Language from "../models/Language";

const plstat = promisify(lstat);

const LANGUAGES = [
  { label: Language.None, detail: "Blank Clean Architecture Feature" },
  { label: Language.Cpp, detail: "C++ Clean Architecture Feature" },
  { label: Language.JavaScript, detail: "JavaScript Clean Architecture Feature" },
  { label: Language.Kotlin, detail: "Kotlin Clean Architecture Feature" },
  { label: Language.Python, detail: "Python Clean Architecture Feature" },
  { label: Language.TypeScript, detail: "TypeScript Clean Architecture Feature" }
];

/**
 * Create a new clean architecture feature.
 * @param selectedUri the URI of the selected item.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const newCleanArchitectureFeature = async (selectedUri: vscode.Uri, context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  if (selectedUri === undefined) { };
  const isDirectory = (await plstat(selectedUri.fsPath)).isDirectory();
  let parentDirectory = selectedUri.fsPath;
  if (!isDirectory) { parentDirectory = path.dirname(selectedUri.fsPath); }

  const featureName = await promptInput({ prompt: "What is the name of the feature?", placeHolder: "newFeature", requireValue: true });
  if (!featureName) { return; }

  const selectedLanguage = await vscode.window.showQuickPick(LANGUAGES, { canPickMany: false, placeHolder: "Which language would you like to use?" });
  if (!selectedLanguage) { return; }

  const featureOptions: FeatureOptions = {
    name: featureName,
    parentDirectory,
    language: selectedLanguage.label
  };
  const mappedFeatureOptions: DomainFeatureOptions = mapToDomainFeatureOptions(featureOptions);

  try {
    await createCleanArchitectureFeature(mappedFeatureOptions);
  } catch (error) {
    vscode.window.showErrorMessage(`An error occurred: ${error}`);
    return;
  }
};

export default newCleanArchitectureFeature;
