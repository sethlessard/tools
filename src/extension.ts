import * as vscode from "vscode";
import deleteFeatureBranch from "./commands/git/deleteFeatureBranch";
import deleteProductionReleaseBranch from "./commands/git/deleteProductionReleaseBranch";
import mergeFeaturesIntoProductionReleaseBranch from "./commands/git/mergeFeaturesIntoProductionReleaseBranch";
import newFeatureBranch from "./commands/git/newFeatureBranch";
import newProductionReleaseBranch from "./commands/git/newProductionReleaseBranch";
import newProject from "./commands/newProject";
import syncRepo from "./commands/git/syncRepo";

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");

	// Git
	const deleteFeatureBranchDisp = vscode.commands.registerCommand("t00ls.deleteFeatureBranch", deleteFeatureBranch(context));
	context.subscriptions.push(deleteFeatureBranchDisp);

	const deleteProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.deleteProductionReleaseBranch", deleteProductionReleaseBranch(context));
	context.subscriptions.push(deleteProductionReleaseBranchDisp);

	const mergeFeaturesIntoProductionReleaseDisp = vscode.commands.registerCommand("t00ls.mergeFeaturesIntoProductionRelease", mergeFeaturesIntoProductionReleaseBranch(context));
	context.subscriptions.push(mergeFeaturesIntoProductionReleaseDisp);

	const newFeatureBranchDisp = vscode.commands.registerCommand("t00ls.newFeatureBranch", newFeatureBranch(context));
	context.subscriptions.push(newFeatureBranchDisp);

	const newProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.newProductionReleaseBranch", newProductionReleaseBranch(context));
	context.subscriptions.push(newProductionReleaseBranchDisp);

	const syncRepoDisposable = vscode.commands.registerCommand("t00ls.syncRepo", syncRepo(context));
	context.subscriptions.push(syncRepoDisposable);

	// Projects
	const newProjectDisp = vscode.commands.registerCommand("t00ls.newProject", newProject(context));
	context.subscriptions.push(newProjectDisp);
}

export function deactivate() {}
