import * as vscode from "vscode";
import * as _ from "lodash";
import { lstat } from "fs";
import * as path from "path";
import { promisify } from "util";
import { promptInput } from "../../../../../util/WindowUtils";
import createCleanArchitectureFeature from "../../domain/usecases/createCleanArchitectureFeature";
import FeatureOptions, { mapToDomainFeatureOptions } from "../models/FeatureOptions";
import DomainFeatureOptions from "../../domain/entities/FeatureOptions";

const plstat = promisify(lstat);

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

  const featureOptions: FeatureOptions = {
    name: featureName,
    parentDirectory
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
