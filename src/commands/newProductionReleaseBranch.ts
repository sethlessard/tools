import * as vscode from "vscode";

import { promptVersion } from "../util/WindowUtils";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 */
const newProductionReleaseBranch = (context: vscode.ExtensionContext) => {
  return async () => {
    // TODO: verify that a Git repo is open.

    // get the new production release version
    const version = await promptVersion("Which version are you preparing for?");
    if (!version) { return; }

    // calculate the branch name
    const branch = `v${version}-prep`;
  };
};

export default newProductionReleaseBranch;
