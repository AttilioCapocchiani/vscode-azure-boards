// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from "vscode";

import querySettings from "./commands/query/querySettings";
import buildSettings from "./commands/build/buildSettings";
import { hideQueryView, showQueryView } from "./commands/query/queryCommands";
import { hideBuildView, showBuildView } from "./commands/build/buildCommands";


import addProject from "./commands/build/addProject";
import addQuery from "./commands/query/addQuery";
import buildDetail from "./commands/build/buildDetail";
import deleteQuery from "./commands/query/deleteQuery";
import openMenu from "./commands/openMenu";
import runQuery from "./commands/query/runQuery";
import openWorkItemDetail from "./commands/query/workItemDetail";
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

  // Menu
	const openMenuCommand = commands.registerCommand("devops-explorer.openMenu", openMenu);
  const openSettingsCommand = commands.registerCommand("devops-explorer.openSettings", () => openSettings());
  const setPATCommand = commands.registerCommand("devops-explorer.setPAT", () => setPAT(context));

  // Query
	const addQueryCommand = commands.registerCommand("devops-explorer.addQuery", () => addQuery(context));
	const deleteQueryCommand = commands.registerCommand("devops-explorer.addProject", () => addProject(context));
  const hideQueryViewCommand = commands.registerCommand("devops-explorer.hideQueryView", () => hideQueryView(context));
  const querySettingsCommand = commands.registerCommand("devops-explorer.querySettings", () => querySettings(context));
  const runQueryCommand = commands.registerCommand("devops-explorer.runQuery", () => runQuery(context));
  const showQueryViewCommand = commands.registerCommand("devops-explorer.showQueryView", () => showQueryView(context));
  const workItemDetailCommand = commands.registerCommand("devops-explorer.workItemDetail", (workItem: TreeItemEntry) => openWorkItemDetail(workItem));
  
  // Build
  const buildSettingsCommand = commands.registerCommand("devops-explorer.buildSettings", () => buildSettings(context));
  const buildDetailCommand = commands.registerCommand("devops-explorer.buildDetail", (build: TreeItemEntry) => buildDetail(build));
  const hideBuildViewCommand = commands.registerCommand("devops-explorer.hideBuildView", () => hideBuildView(context));
  const refreshTreeCommand = commands.registerCommand('devops-explorer.refreshTreeView', () => queryTreeDataProvider.refresh());
  const showBuildViewCommand = commands.registerCommand("devops-explorer.showBuildView", () => showBuildView(context));
  
	context.subscriptions.push(addQueryCommand); 
	context.subscriptions.push(buildDetailCommand); 
  context.subscriptions.push(buildSettingsCommand); 
	context.subscriptions.push(deleteQueryCommand);
	context.subscriptions.push(openMenuCommand);
	context.subscriptions.push(refreshTreeCommand);
  context.subscriptions.push(hideQueryViewCommand);
  context.subscriptions.push(openSettingsCommand);
  context.subscriptions.push(querySettingsCommand);
  context.subscriptions.push(runQueryCommand);
  context.subscriptions.push(setPATCommand);
  context.subscriptions.push(showBuildViewCommand);
  context.subscriptions.push(hideBuildViewCommand);
  context.subscriptions.push(showQueryViewCommand);
  context.subscriptions.push(workItemDetailCommand);

	window.registerTreeDataProvider('DevOpsExplorer', queryTreeDataProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
