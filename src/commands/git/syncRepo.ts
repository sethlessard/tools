import * as vscode from "vscode";
import * as path from "path";
import * as _ from "lodash";
import Git from "../../util/Git";
import { promptInput, promptYesNo, showErrorMessage } from "../../util/WindowUtils";
import { t00lsMode } from "../../util/StatusBarManager";

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
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const mode: t00lsMode = context.workspaceState.get("t00ls.mode") as t00lsMode;
    const git = new Git(gitRepo, mode);

    if (mode === t00lsMode.Normal) {
      // fetch the latest updates from remote
      try {
        await git.fetch();
      } catch (e) {
        showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
        return;
      }
    }

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error fetching the current branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
    }

    // get the local feature branches in the repository
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }

    // get the local production release branches
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local production release branches: ${e}`);
      return;
    }

    // check to see if there are working changes in the directory.
    let stashCreated = false;
    try {
      if ((await git.hasWorkingChanges()) && (await promptYesNo({ question: `There are working changes. Do you want to stash them (recommended)?`, ignoreFocusOut: true }))) {
        const stashMessage = await promptInput({ prompt: "Enter the stash message.", placeHolder: "blah blah blah..." });
        if (!stashMessage) { return; };
        await git.stage(path.join(gitRepo, "."))
          .then(() => git.stash(stashMessage));
        stashCreated = true;
      }
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error stashing the current working changes: ${e}`);
      return;
    }

    // switch to master
    if (currentBranch !== "master") {
      try {
        await git.checkoutBranch("master");
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to 'master': ${e}`);
        return;
      }
    }

    if (mode === t00lsMode.Normal) {
      // pull master
      try {
        await git.pull();
      } catch (e) {
        showErrorMessage(outputChannel, `Error pulling to 'master': ${e}`);
        return;
      }
    }


    // update the production release branches, if any
    for (const prodRelease of productionReleaseBranches) {
      const hasRemoteBranch = await git.hasRemoteBranch(prodRelease.name);

      // switch to the production release branch
      try {
        await git.checkoutBranch(prodRelease.name);
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to production release branch '${prodRelease.name}': ${e}`);
        return;
      }


      if (mode === t00lsMode.Normal && hasRemoteBranch) {
        // pull the latest changes from remote
        try {
          await git.pull();
        } catch (e) {
          showErrorMessage(outputChannel, `Error pulling production release branch '${prodRelease.name}': ${e}`);
          return;
        }
      }

      // merge master into the production release branch
      try {
        await git.mergeBranch("master");
      } catch (e) {
        showErrorMessage(outputChannel, `Error merging 'master' into '${prodRelease.name}': ${e}`);
        return;
      }

      if (mode === t00lsMode.Normal) {
        // push
        if (!hasRemoteBranch) {
          // ask the user if they want to publish the production release branch.
          const publish = await promptYesNo({ question: `Publish '${prodRelease.name}'?`, noIsDefault: true });
          if (publish) {
            // determine the remote to track against.
            const remotes = await git.getAllRemotes();
            let remote: string | undefined = remotes[0];
            if (remotes.length > 1) { 
              remote = await vscode.window.showQuickPick(remotes, {});
              if (!remote) { return; }
            }

            // publish the production release branch
            try {
              await git.setupTrackingAndPush(remote);
            } catch (e) {
              showErrorMessage(outputChannel, `Error publishing production release branch '${prodRelease.name}': ${e}`);
            }
          }
        } else {
          // push to remote
          try {
            await git.push();
          } catch (e) {
            showErrorMessage(outputChannel, `Error pushing latest updates from production release branch '${prodRelease.name}': ${e}`);
          }
        }
      }
    }

    // update the feature branches, if any
    for (const featureBranch of featureBranches) {
      const hasRemoteBranch = git.hasRemoteBranch(featureBranch.name);

      // switch to the feature branch
      try {
        await git.checkoutBranch(featureBranch.name);
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to feature branch '${featureBranch.name}': ${e}`);
        return;
      }

      if (mode === t00lsMode.Normal) {
        if (hasRemoteBranch) {
          // pull the latest changes from remote
          try {
            await git.pull();
          } catch (e) {
            showErrorMessage(outputChannel, `Error pulling feature branch '${featureBranch.name}': ${e}`);
            return;
          }
        }
      }

      let baseBranch: vscode.QuickPickItem | undefined = { label: context.workspaceState.get(`${featureBranch.name}.baseBranch`) || "master", description: "Local" };
      let baseBranches = [{ label: "master", description: "Local" }];

      if (productionReleaseBranches.length > 0) {
        baseBranches = baseBranches.concat(productionReleaseBranches.map(p => ({ label: p.name, description: (p.remote) ? "Remote" : "Local" })));
      }

      baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: `What is the base branch for feature branch '${featureBranch.name}'?`, ignoreFocusOut: true });
      if (!baseBranch) {
        baseBranch = { label: "master", description: "Local" };
      }

      // ask if the user wants to save the production release branch/feature branch relationship for next time.
      if (baseBranch.label !== "master" && (await promptYesNo({ question: "Save this relationship for future syncs?" }))) {
        await context.workspaceState.update(`${featureBranch.name}.baseBranch`, baseBranch.label);
      }

      if ((await promptYesNo({ question: `Merge '${baseBranch.label}' into '${featureBranch.name}'` }))) {
        // merge the base branch into the feature branch
        try {
          await git.mergeBranch(baseBranch.label);
        } catch (e) {
          showErrorMessage(outputChannel, `Error merging '${baseBranch.label}' into '${featureBranch.name}': ${e}`);
          return;
        }
      }

      if (mode === t00lsMode.Normal) {
        // push
        if (!hasRemoteBranch) {
          // ask the user if they want to publish the production release branch.
          const publish = await promptYesNo({ question: `Publish '${featureBranch.name}'?`, noIsDefault: true });
          if (publish) {
            // determine the remote to track against.
            const remotes = await git.getAllRemotes();
            let remote: string | undefined = remotes[0];
            if (remotes.length > 1) { 
              remote = await vscode.window.showQuickPick(remotes, {});
              if (!remote) { return; }
            }

            // publish the production release branch
            try {
              await git.setupTrackingAndPush(remote);
            } catch (e) {
              showErrorMessage(outputChannel, `Error publishing feature branch '${featureBranch.name}': ${e}`);
            }
          }
        } else {
          // push to remote
          try {
            await git.push();
          } catch (e) {
            showErrorMessage(outputChannel, `Error pushing latest updates from feature branch '${featureBranch.name}': ${e}`);
          }
        }
      }
    }

    // switch back to the original branch
    if (await git.hasLocalBranch(currentBranch)) {
      try {
        await git.checkoutBranch(currentBranch);
        // pop the stash
        if (stashCreated) {
          await git.popStash();
        }
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching back to the original branch '${currentBranch}': ${e}`);
        return;
      }
    } else {
      // the branch must've been deleted. Switch to master.
      try {
        await git.checkoutBranch("master");
        // ask about poping stash
        if (await promptYesNo({ question: `'${currentBranch}' was deleted. Do you want to pop the stash that was created anyways?` })) {
          await git.popStash();
        }
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to 'master': ${e}`);
        return;
      }
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default syncRepo;
