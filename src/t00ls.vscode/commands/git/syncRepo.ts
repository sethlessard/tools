import * as vscode from "vscode";
import * as path from "path";
import * as _ from "lodash";

import { promptInput, promptYesNo, showErrorMessage } from "../../../t00ls.vscode/util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import GitMode from "../../../t00ls.common/presentation/models/GitMode";
import t00lsGitRepository from "../../../t00ls.common/data/repositories/t00lsGitRepository";

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
    const mode: GitMode = context.workspaceState.get("t00ls.mode") as GitMode;
    const git = new t00lsGitRepository(gitRepo, mode);
    await git.initialize();
    const relationshipRepository = VSCodeBranchRelationshipRepository.getInstance();

    if (mode === GitMode.Normal) {
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

    // switch to the main branch.
    const mainBranchName = await git.getMainBranchName();
    if (currentBranch !== mainBranchName) {
      try {
        await git.checkoutBranch(mainBranchName);
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to '${mainBranchName}': ${e}`);
        return;
      }
    }

    if (mode === GitMode.Normal) {
      // pull the main branch
      try {
        await git.pull();
      } catch (e) {
        showErrorMessage(outputChannel, `Error pulling to '${mainBranchName}': ${e}`);
        return;
      }

      // push the main branch
      try {
        await git.push();
      } catch (e) {
        showErrorMessage(outputChannel, `Error pushing to remote '${mainBranchName}': ${e}`);
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

      if (mode === GitMode.Normal && hasRemoteBranch) {
        // pull the latest changes from remote
        try {
          await git.pull();
        } catch (e) {
          showErrorMessage(outputChannel, `Error pulling production release branch '${prodRelease.name}': ${e}`);
          return;
        }
      }

      // merge the main branch into the production release branch
      try {
        await git.mergeBranch(mainBranchName);
      } catch (e) {
        showErrorMessage(outputChannel, `Error merging '${mainBranchName}' into '${prodRelease.name}': ${e}`);
        return;
      }

      if (mode === GitMode.Normal) {
        // push
        if (!hasRemoteBranch) {
          // ask the user if they want to publish the production release branch.
          const publish = await promptYesNo({ question: `Publish '${prodRelease.name}'?`, noIsDefault: true });
          if (publish) {
            // determine the remote to track against.
            const remotes = await git.getAllRemotes();
            let remote: string | undefined = remotes[0];
            if (remotes.length > 1) {
              remote = await vscode.window.showQuickPick(remotes, { ignoreFocusOut: true });
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

      if (mode === GitMode.Normal) {
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

      let savedRelationship = relationshipRepository.getRelationship(featureBranch.name);
      if (savedRelationship) {
        // verify the production release branch still exists locally
        if (_.find(productionReleaseBranches, { name: savedRelationship.productionReleaseBranch }) === undefined) {
          // it doesn't exist, so delete all relationships related to the production release branch
          // clear the relationship for the feature branch as well.
          await relationshipRepository.clearRelationshipsForProductionReleaseBranch(savedRelationship.productionReleaseBranch);
          await relationshipRepository.clearRelationshipForFeatureBranch(featureBranch.name);
          savedRelationship = undefined;
        }
      }

      let baseBranches: vscode.QuickPickItem[] = [{ label: mainBranchName, description: "Local" }];
      let baseBranch: vscode.QuickPickItem | undefined = baseBranches[0];
      if (productionReleaseBranches.length > 0) {
        baseBranches = baseBranches.concat(productionReleaseBranches.map(p => ({ label: p.name, description: (p.remote) ? "Remote" : "Local" })));
      }

      // if the base branch isn't saved, and there is more than one base branch to select from,
      // show a prompt to the user
      if (baseBranch.label === mainBranchName && baseBranches.length > 1 && savedRelationship === undefined) {
        baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: `What is the base branch for feature branch '${featureBranch.name}'?`, ignoreFocusOut: true });
        if (!baseBranch) {
          return;
        }
      }

      if (savedRelationship === undefined) {
        // ask if the user wants to save the production release branch/feature branch relationship for next time.
        if (baseBranch.label !== mainBranchName && (await promptYesNo({ question: "Save this relationship for future syncs?" }))) {
          await relationshipRepository.setRelationship(featureBranch.name, baseBranch.label);
        }
      } else {
        // use the production release branch defined by the saved relationship 
        // as the base branch for the production release branch.
        baseBranch.label = savedRelationship.productionReleaseBranch;
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

      if (mode === GitMode.Normal) {
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
      // the branch must've been deleted. Switch to the main branch.
      try {
        await git.checkoutBranch(mainBranchName);
        // ask about poping stash
        if (await promptYesNo({ question: `'${currentBranch}' was deleted. Do you want to pop the stash that was created anyways?` })) {
          await git.popStash();
        }
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to '${mainBranchName}': ${e}`);
        return;
      }
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default syncRepo;
