import * as vscode from "vscode";
import newProductionReleaseBranch from "./commands/git/newProductionReleaseBranch";
import newProject from "./commands/newProject";

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");

	// Git
	const newProductionReleaseBranchDisp = vscode.commands.registerCommand("t00ls.newProductionReleaseBranch", newProductionReleaseBranch(context));
	context.subscriptions.push(newProductionReleaseBranchDisp);

	// Projects
	const newProjectDisp = vscode.commands.registerCommand("t00ls.newProject", newProject(context));
	context.subscriptions.push(newProjectDisp);
}

export function deactivate() {}
