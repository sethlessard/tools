import * as vscode from "vscode";
import * as _ from "lodash";
import Git from "../../util/Git";
import { promptYesNo, showErrorMessage } from "../../util/WindowUtils";
import Logger from "../../util/Logger";
import { update } from "lodash";

/**
 * Create a new feature branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const syncRepo = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const logger = Logger.getInstance();
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo);

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
      return;
    }

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the current branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      await showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
    }

    // get the local feature branches in the repository
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }

    // get the local production release branches
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the local production release branches: ${e}`);
      return;
    }
    // TODO: [TLS-30] check to see if there are working changes in the directory. If so, stash or commit them

    // switch to master
    if (currentBranch !== "master") {
      try {
        await git.checkoutBranch("master");
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching to 'master': ${e}`);
        return;
      }
    }

    // pull master
    try {
      await git.pull();
    } catch (e) {
      await showErrorMessage(outputChannel, `Error pulling to 'master': ${e}`);
      return;
    }

    // update the production release branches, if any
    for (const prodRelease of productionReleaseBranches) {
      const remote = await git.hasRemoteBranch(prodRelease.name);

      // switch to the production release branch
      try {
        await git.checkoutBranch(prodRelease.name);
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching to production release branch '${prodRelease.name}': ${e}`);
        return;
      }

      if (remote) {
        // pull the latest changes from remote
        try {
          await git.pull();
        } catch (e) {
          await showErrorMessage(outputChannel, `Error pulling production release branch '${prodRelease.name}': ${e}`);
          return;
        }
      }

      // merge master into the production release branch
      try {
        await git.mergeBranch("master");
      } catch (e) {
        await showErrorMessage(outputChannel, `Error merging 'master' into '${prodRelease.name}': ${e}`);
        return;
      }

      // push
      if (!remote) {
        // ask the user if they want to publish the production release branch.
        const publish = await promptYesNo({ question: `Publish '${prodRelease.name}'?`, noIsDefault: true });
        if (publish) {
          // publish the production release branch
          try {
            await git.setupTrackingAndPush();
          } catch (e) {
            await showErrorMessage(outputChannel, `Error publishing production release branch '${prodRelease.name}': ${e}`);
          }
        }
      } else {
        // push to remote
        try {
          await git.push();
        } catch (e) {
          await showErrorMessage(outputChannel, `Error pushing latest updates from production release branch '${prodRelease.name}': ${e}`);
        }
      }
    }

    // update the feature branches, if any
    for (const featureBranch of featureBranches) {
      const hasRemote = git.hasRemoteBranch(featureBranch.name);

      // switch to the feature branch
      try {
        await git.checkoutBranch(featureBranch.name);
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching to feature branch '${featureBranch.name}': ${e}`);
        return;
      }

      if (hasRemote) {
        // pull the latest changes from remote
        try {
          await git.pull();
        } catch (e) {
          await showErrorMessage(outputChannel, `Error pulling feature branch '${featureBranch.name}': ${e}`);
          return;
        }
      }

      let baseBranch: vscode.QuickPickItem | undefined = { label: "master", description: "Local" };

      // check to see if there is a pre-defined production release/feature branch relationship
      const storedBaseBranch: string | undefined = context.workspaceState.get(`${featureBranch.name}.baseBranch`);

      let updateWithBaseBranch = false;
      if (storedBaseBranch) {
        // use the stored base branch
        baseBranch.label = storedBaseBranch;
        logger.writeLn(`Found pre-existing production release branch/feature branch relationship. Will update '${featureBranch.name}' with branch '${storedBaseBranch}'.`);
      } else {
        let baseBranches = [{ label: "master", description: "Local" }];

        if (productionReleaseBranches.length > 0) {
          baseBranches = baseBranches.concat(productionReleaseBranches.map(p => ({ label: p.name, description: (p.remote) ? "Remote" : "Local" })));
        }

        baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: `What is the base branch for feature branch '${featureBranch.name}'?` });
        if (!baseBranch) {
          baseBranch = { label: "master", description: "Local" };
        }

        // ask if the user wants to save the production release branch/feature branch relationship for next time.
        if (baseBranch.label !== "master" && (await promptYesNo({ question: "Save this relationship for future syncs?" }))) {
          await context.workspaceState.update(`${featureBranch.name}.baseBranch`, baseBranch.label);
        }
      }

      if ((await promptYesNo({ question: `Merge '${baseBranch.label}' into '${featureBranch.name}'` }))) {
        // merge the base branch into the feature branch
        try {
          await git.mergeBranch(baseBranch.label);
        } catch (e) {
          await showErrorMessage(outputChannel, `Error merging '${baseBranch.label}' into '${featureBranch.name}': ${e}`);
          return;
        }
      }

      // push
      if (!hasRemote) {
        // ask the user if they want to publish the production release branch.
        const publish = await promptYesNo({ question: `Publish '${featureBranch.name}'?`, noIsDefault: true });
        if (publish) {
          // publish the production release branch
          try {
            await git.setupTrackingAndPush();
          } catch (e) {
            await showErrorMessage(outputChannel, `Error publishing feature branch '${featureBranch.name}': ${e}`);
          }
        }
      } else {
        // push to remote
        try {
          await git.push();
        } catch (e) {
          await showErrorMessage(outputChannel, `Error pushing latest updates from feature branch '${featureBranch.name}': ${e}`);
        }
      }
    }

    // switch back to the original branch
    if (await git.hasLocalBranch(currentBranch)) {
      try {
        await git.checkoutBranch(currentBranch);
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching back to the original branch '${currentBranch}': ${e}`);
        return;
      }
    } else {
      // the branch must've been deleted. Switch to master.
      try {
        await git.checkoutBranch("master");
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching to 'master': ${e}`);
        return;
      }
    }

    await vscode.window.showInformationMessage("Done.");
  };
};

export default syncRepo;
