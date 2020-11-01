import * as vscode from "vscode";
import deleteFeatureBranch from "./commands/git/deleteFeatureBranch";
import deleteProductionReleaseBranch from "./commands/git/deleteProductionReleaseBranch";
import deleteTag from "./commands/git/deleteTag";
import mergeFeaturesIntoProductionReleaseBranch from "./commands/git/mergeFeaturesIntoProductionReleaseBranch";
import newFeatureBranch from "./commands/git/newFeatureBranch";
import newProductionReleaseBranch from "./commands/git/newProductionReleaseBranch";
import syncRepo from "./commands/git/syncRepo";
import release from "./commands/git/release";
import Logger from "./util/Logger";
import clearProductionReleaseFeatureBranchRelationship from "./commands/git/clearProductionReleaseFeatureBranchRelationship";

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");
	const outputChannel = vscode.window.createOutputChannel("t00ls");
	Logger.getInstance().initChannel(outputChannel);

	// Git
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
}

export function deactivate() {}
