import * as vscode from "vscode";
import deleteProductionReleaseBranch from "./commands/git/deleteProductionReleaseBranch";
import newFeatureBranch from "./commands/git/newFeatureBranch";
import newProductionReleaseBranch from "./commands/git/newProductionReleaseBranch";
import newProject from "./commands/newProject";

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");

	// Git
	const deleteProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.deleteProductionReleaseBranch", deleteProductionReleaseBranch(context));
	context.subscriptions.push(deleteProductionReleaseBranchDisp);

	const newFeatureBranchDisp = vscode.commands.registerCommand("t00ls.newFeatureBranch", newFeatureBranch(context));
	context.subscriptions.push(newFeatureBranchDisp);

	const newProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.newProductionReleaseBranch", newProductionReleaseBranch(context));
	context.subscriptions.push(newProductionReleaseBranchDisp);

	// Projects
	const newProjectDisp = vscode.commands.registerCommand("t00ls.newProject", newProject(context));
	context.subscriptions.push(newProjectDisp);
}

export function deactivate() {}
