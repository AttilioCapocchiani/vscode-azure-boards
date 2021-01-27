// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from "vscode";

import addQuery from "./commands/addQuery";
import openMenu from "./commands/openMenu";
import runQuery from "./commands/runQuery";

async function setPAT(context: ExtensionContext) {
	const PAT = await window.showInputBox({
		prompt: "Enter your Personal Access Token"
	});

	const encrypted = Buffer.from(`:${PAT}`).toString("base64");
	context.workspaceState.update("encryptedPAT", encrypted);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const addQueryCommand = commands.registerCommand("azure-boards.addQuery", () => addQuery(context));
	const openMenuCommand = commands.registerCommand("azure-boards.openMenu", openMenu);
	const runQueryCommand = commands.registerCommand("azure-boards.runQuery", () => runQuery(context));
	const setPATCommand = commands.registerCommand("azure-boards.setPAT", () => setPAT(context));

	context.subscriptions.push(addQueryCommand);
	context.subscriptions.push(openMenuCommand);
	context.subscriptions.push(runQueryCommand);
	context.subscriptions.push(setPATCommand);
}



// this method is called when your extension is deactivated
export function deactivate() { }
