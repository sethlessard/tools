import * as vscode from 'vscode';
import newProject from './commands/newProject';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "t00ls" is now active!');

	let disposable = vscode.commands.registerCommand('t00ls.newProject', newProject());

	context.subscriptions.push(disposable);
}

export function deactivate() {}
