// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from 'vscode';


import addQuery from './commands/addQuery';

async function setPAT(context: ExtensionContext) {
	const PAT = await window.showInputBox({
		prompt: 'Enter your Personal Access Token'
	});

	const encrypted = Buffer.from(`:${PAT}`).toString('base64');
	context.workspaceState.update("encryptedPAT", encrypted);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const setPATCommand = commands.registerCommand("azure-boards.setPAT", () => setPAT(context));
	const addQueryCommand = commands.registerCommand("azure-boards.addQuery", () => addQuery(context));

	context.subscriptions.push(commands.registerCommand("azure-boards.seePAT", () => {
		const pat: string | undefined = context.workspaceState.get("encryptedPAT");
		window.showInformationMessage(pat || "NNT");
	}));

	context.subscriptions.push(setPATCommand);
	context.subscriptions.push(addQueryCommand);
}



// this method is called when your extension is deactivated
export function deactivate() { }
