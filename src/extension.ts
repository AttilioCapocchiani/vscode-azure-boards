// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from "vscode";

import addProject from "./commands/addProject";
import addQuery from "./commands/addQuery";
import buildDetail from "./commands/buildDetail";
import deleteQuery from "./commands/deleteQuery";
import openMenu from "./commands/openMenu";
import runQuery from "./commands/runQuery";
import openWorkItemDetail from "./commands/workItemDetail";
import openSettings from "./commands/settings/openSettings";

import { QueryTreeDataProvider, TreeItemEntry } from "./dataProviders/treeDataProviders/QueryTreeDataProvider";

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
  const queryTreeDataProvider: QueryTreeDataProvider = new QueryTreeDataProvider(context);


	const addQueryCommand = commands.registerCommand("devops-explorer.addQuery", () => addQuery(context));
  const buildDetailCommand = commands.registerCommand("devops-explorer.buildDetail", (build: TreeItemEntry) => buildDetail(build));
	const deleteQueryCommand = commands.registerCommand("devops-explorer.deleteQuery", () => addProject(context));
	const openMenuCommand = commands.registerCommand("devops-explorer.openMenu", openMenu);
  const runQueryCommand = commands.registerCommand("devops-explorer.runQuery", () => runQuery(context));
  const refreshTreeCommand = commands.registerCommand('devops-explorer.refreshQueries', () => queryTreeDataProvider.refresh());
  const setPATCommand = commands.registerCommand("devops-explorer.setPAT", () => setPAT(context));
  const workItemDetailCommand = commands.registerCommand("devops-explorer.workItemDetail", (workItem: TreeItemEntry) => openWorkItemDetail(workItem));
  const openSettingsCommand = commands.registerCommand("devops-explorer.openSettings", () => openSettings());
  
	context.subscriptions.push(addQueryCommand); 
	context.subscriptions.push(buildDetailCommand); 
	context.subscriptions.push(deleteQueryCommand);
	context.subscriptions.push(openMenuCommand);
	context.subscriptions.push(refreshTreeCommand);
  context.subscriptions.push(runQueryCommand);
  context.subscriptions.push(setPATCommand);
  context.subscriptions.push(workItemDetailCommand);
  context.subscriptions.push(openSettingsCommand);

	window.registerTreeDataProvider('DevOpsExplorer', queryTreeDataProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
