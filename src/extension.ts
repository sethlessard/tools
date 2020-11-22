import * as vscode from "vscode";

import deleteFeatureBranch from "./t00ls.vscode/commands/git/deleteFeatureBranch/presentation/views/deleteFeatureBranch";
import deleteProductionReleaseBranch from "./t00ls.vscode/commands/git/deleteProductionReleaseBranch/presentation/views/deleteProductionReleaseBranch";
import deleteTag from "./t00ls.vscode/commands/git/deleteTag/presentation/views/deleteTag";
import mergeFeaturesIntoProductionReleaseBranch from "./t00ls.vscode/commands/git/mergeFeaturesIntoProductionReleaseBranch/presentation/views/mergeFeaturesIntoProductionReleaseBranch";
import newFeatureBranch from "./t00ls.vscode/commands/git/newFeatureBranch/presentation/views/newFeatureBranch";
import newProductionReleaseBranch from "./t00ls.vscode/commands/git/newProductionReleaseBranch/presentation/views/newProductionReleaseBranch";
import syncRepo from "./t00ls.vscode/commands/git/syncRepo/presentation/views/syncRepo";
import release from "./t00ls.vscode/commands/git/release/presentation/views/release";
import Logger from "./t00ls.vscode/util/Logger";
import clearProductionReleaseFeatureBranchRelationship from "./t00ls.vscode/commands/git/cleanProductionReleaseFeatureBranchRelationship/presentation/views/clearProductionReleaseFeatureBranchRelationship";
import changeGitMode from "./t00ls.vscode/commands/git/changeGitMode/presentation/views/changeGitMode";
import StatusBarManager from "./t00ls.vscode/util/StatusBarManager";
import VSCodeBranchRelationshipRepository from "./t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import newCleanArchitectureFeature from "./t00ls.vscode/commands/cleanarchitecture/newCleanArchitectureFeature/presentation/views/newCleanArchitectureFeature";
import GitMode from "./t00ls.common/presentation/models/GitMode";
import VSCodeGitModeRepository from "./t00ls.common/data/repositories/VSCodeGitModeRepository";

let t00lsStatusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");
	const outputChannel = vscode.window.createOutputChannel("t00ls");
	Logger.getInstance().initChannel(outputChannel);

	const gitModeRepo = new VSCodeGitModeRepository(context);
	let mode: GitMode = gitModeRepo.getGitMode();

	t00lsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	t00lsStatusBarItem.command = "t00ls.changeGitMode";
	t00lsStatusBarItem.tooltip = "The current Git mode.";
	context.subscriptions.push(t00lsStatusBarItem);
	t00lsStatusBarItem.show();
	StatusBarManager.getInstance().initialize(t00lsStatusBarItem).setMode(mode);

	// initialize the VSCodeBranchRelationshipRepository
	VSCodeBranchRelationshipRepository.getInstance().initialize(context);

	// Git
	const changegitModeDisp = vscode.commands.registerCommand("t00ls.changeGitMode", changeGitMode(context, outputChannel));
	context.subscriptions.push(changegitModeDisp);

	const clearProductionReleaseFeatureBranchRelationshipDisp = vscode.commands.registerCommand("t00ls.clearProductionReleaseFeatureBranchRelationship", clearProductionReleaseFeatureBranchRelationship(context, outputChannel));
	context.subscriptions.push(clearProductionReleaseFeatureBranchRelationshipDisp);

	const deleteFeatureBranchDisp = vscode.commands.registerCommand("t00ls.deleteFeatureBranch", deleteFeatureBranch(context, outputChannel));
	context.subscriptions.push(deleteFeatureBranchDisp);

	const deleteProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.deleteProductionReleaseBranch", deleteProductionReleaseBranch(context, outputChannel));
	context.subscriptions.push(deleteProductionReleaseBranchDisp);

	const deleteTagDisp = vscode.commands.registerCommand("t00ls.deleteTag", deleteTag(context, outputChannel));
	context.subscriptions.push(deleteTagDisp);

	const mergeFeaturesIntoProductionReleaseDisp = vscode.commands.registerCommand("t00ls.mergeFeaturesIntoProductionRelease", mergeFeaturesIntoProductionReleaseBranch(context, outputChannel));
	context.subscriptions.push(mergeFeaturesIntoProductionReleaseDisp);

	const newFeatureBranchDisp = vscode.commands.registerCommand("t00ls.newFeatureBranch", newFeatureBranch(context, outputChannel));
	context.subscriptions.push(newFeatureBranchDisp);

	const newProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.newProductionReleaseBranch", newProductionReleaseBranch(context, outputChannel));
	context.subscriptions.push(newProductionReleaseBranchDisp);

	const releaseDisposable = vscode.commands.registerCommand("t00ls.release", release(context, outputChannel));
	context.subscriptions.push(releaseDisposable);

	const syncRepoDisposable = vscode.commands.registerCommand("t00ls.syncRepo", syncRepo(context, outputChannel));
	context.subscriptions.push(syncRepoDisposable);

	// new clean architecture feature
	const newCAFeatureDisposable = vscode.commands.registerCommand("t00ls.newCleanArchitectureFeature", (fileUri) => newCleanArchitectureFeature(fileUri, context, outputChannel));
	context.subscriptions.push(newCAFeatureDisposable);
}

export function deactivate() {}
