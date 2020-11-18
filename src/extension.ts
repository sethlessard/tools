import * as vscode from "vscode";
import * as path from "path";
import { existsSync } from "fs";
import { readJSONSync } from "fs-extra";

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
import changeGitMode from "./commands/git/changeGitMode";
import StatusBarManager, { t00lsMode } from "./util/StatusBarManager";
import BranchRelationshipCache from "./cache/BranchRelationshipCache";
import ConfigManager from "./config/ConfigManager";
import t00lsConfiguration from "./types/config/t00lsConfiguration";

let t00lsStatusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension \"t00ls\" is now active!");
	const outputChannel = vscode.window.createOutputChannel("t00ls");
	const logger = Logger.getInstance();
	logger.initChannel(outputChannel);

	// get the t00ls mode
	let mode: t00lsMode | undefined = context.workspaceState.get("t00ls.mode");
	if (!mode) { mode = t00lsMode.Normal; await context.workspaceState.update("t00ls.mode", mode); };
	
	// initialize the status bar item.
	t00lsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	t00lsStatusBarItem.command = "t00ls.changeGitMode";
	t00lsStatusBarItem.tooltip = "The current Git mode.";
	context.subscriptions.push(t00lsStatusBarItem);
	t00lsStatusBarItem.show();
	StatusBarManager.getInstance().initialize(t00lsStatusBarItem).setMode(mode);

	// initialize the BranchRelationshipCache
	BranchRelationshipCache.getInstance().initialize(context);

	const configManager = ConfigManager.getInstance();
	// set workspace listeners
	vscode.workspace.onDidChangeWorkspaceFolders((e: vscode.WorkspaceFoldersChangeEvent) => {
		e.added.forEach(w => {
			// search for a t00ls configuration in the workspace and register it.
			const configPath = path.join(w.uri.fsPath, "t00ls.json");
			if (existsSync(configPath)) {
				logger.writeLn(`Loading t00ls configuration for workspace '${w.name}': ${configPath}`);
				const configuration: t00lsConfiguration = readJSONSync(configPath);
				configManager.addConfig(w.uri.fsPath, configuration);
			}
		});
		e.removed.forEach(w => {
			logger.writeLn(`Unloading any configurations for workspace '${w.name}': ${w.uri.fsPath}`)
			// remove the workspace t00ls configuration
			configManager.removeConfig(w.uri.fsPath);
		});
	});

	// Git
	const changeGitModeDisp = vscode.commands.registerCommand("t00ls.changeGitMode", changeGitMode(context, outputChannel));
	context.subscriptions.push(changeGitModeDisp);

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
