// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext } from "vscode";

import querySettings from "./commands/query/querySettings";
import buildSettings from "./commands/build/buildSettings";
import { hideQueryView, showQueryView, workItemDetail } from "./commands/query/queryCommands";
import { hideBuildView, showBuildView } from "./commands/build/buildCommands";


import addProject from "./commands/build/addProject";
import addQuery from "./commands/query/addQuery";
import buildDetail from "./commands/build/buildDetail";
import deleteQuery from "./commands/query/deleteQuery";
import openMenu from "./commands/openMenu";
import { runSpecificQuery, runQuery } from "./commands/query/runQuery";
import openWorkItemDetail from "./commands/query/workItemDetail";
import openSettings from "./commands/settings/openSettings";

import { QueryTreeDataProvider, TreeItemEntry } from "./dataProviders/treeDataProviders/QueryTreeDataProvider";
import { QueryTreeDataProvider as BuildsTreeDataProvider, TreeItemEntry as BuildTreeItemEntry } from "./dataProviders/treeDataProviders/BuildTreeDataProvider";
import { QueryConfiguration, WorkItem } from "./interfaces/interfaces";
import { wrap } from "lodash";

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
  // Get welcome screen status
  const showWelcomeScreen: boolean = context.workspaceState.get("SHOW_WELCOME_SCREEN", true);
  commands.executeCommand("setContext", "showWelcomeScreen", showWelcomeScreen);

  const buildViewEnabled: string | undefined = context.workspaceState.get("BUILD_VIEW_STATUS");
  commands.executeCommand("setContext", "buildViewEnabled", buildViewEnabled === "VISIBLE");

  const queryViewEnabled: string | undefined = context.workspaceState.get("QUERY_VIEW_STATUS");
  commands.executeCommand("setContext", "queryViewEnabled", queryViewEnabled === "VISIBLE");

  const queryTreeDataProvider: QueryTreeDataProvider = new QueryTreeDataProvider(context);
  const buildTreeDataProvider: BuildsTreeDataProvider = new BuildsTreeDataProvider(context);

  // Menu
  const openMenuCommand = commands.registerCommand("devops-explorer.openMenu", openMenu);
  const openSettingsCommand = commands.registerCommand("devops-explorer.openSettings", () => openSettings());
  const setPATCommand = commands.registerCommand("devops-explorer.setPAT", () => setPAT(context));

  // Query
  const addQueryCommand = commands.registerCommand("devops-explorer.addQuery", () => addQuery(context));
  const deleteQueryCommand = commands.registerCommand("devops-explorer.addProject", () => addProject(context));
  const hideQueryViewCommand = commands.registerCommand("devops-explorer.hideQueryView", () => hideQueryView(context));
  const querySettingsCommand = commands.registerCommand("devops-explorer.querySettings", () => querySettings(context));
  const refreshQueryCommand = commands.registerCommand('devops-explorer.refreshQueryView', () => queryTreeDataProvider.refresh());
  const runQueryCommand = commands.registerCommand("devops-explorer.runQuery", (query: TreeItemEntry) => {
    if (query) {
      const wrapper: QueryConfiguration = (query.wrapper as QueryConfiguration);
      runSpecificQuery(context, wrapper.organization, wrapper.project, wrapper.queryName, wrapper.queryId);
    } else {
      runQuery(context);
    }
  });
  const showQueryViewCommand = commands.registerCommand("devops-explorer.showQueryView", () => showQueryView(context));
  const workItemDetailCommand = commands.registerCommand("devops-explorer.workItemDetail", (workItem: TreeItemEntry) => openWorkItemDetail(workItem));
  const openWorkItemInBrowser = commands.registerCommand("devops-explorer.openWorkItemInBrowser", (workItem: WorkItem) => workItemDetail(workItem.wrapper.id, workItem.wrapper.organization, workItem.wrapper.project));

  // Build
  const buildSettingsCommand = commands.registerCommand("devops-explorer.buildSettings", () => buildSettings(context));
  const buildDetailCommand = commands.registerCommand("devops-explorer.buildDetail", (build: BuildTreeItemEntry) => buildDetail(build));
  const hideBuildViewCommand = commands.registerCommand("devops-explorer.hideBuildView", () => hideBuildView(context));
  const refreshBuildCommand = commands.registerCommand('devops-explorer.refreshBuildView', () => buildTreeDataProvider.refresh());
  const showBuildViewCommand = commands.registerCommand("devops-explorer.showBuildView", () => showBuildView(context));

  //Welcome screen
  const hideWelcomeScreenCommand = commands.registerCommand("devops-explorer.hideWelcomeScreen", () => {
    context.workspaceState.update("SHOW_WELCOME_SCREEN", false);
    commands.executeCommand("setContext", "showWelcomeScreen", false);
  });

  context.subscriptions.push(addQueryCommand);
  context.subscriptions.push(buildDetailCommand);
  context.subscriptions.push(deleteQueryCommand);
  context.subscriptions.push(hideWelcomeScreenCommand);
  context.subscriptions.push(openMenuCommand);
  context.subscriptions.push(refreshBuildCommand);
  context.subscriptions.push(refreshQueryCommand);
  context.subscriptions.push(buildSettingsCommand);
  context.subscriptions.push(hideBuildViewCommand);
  context.subscriptions.push(hideQueryViewCommand);
  context.subscriptions.push(openSettingsCommand);
  context.subscriptions.push(openWorkItemInBrowser);
  context.subscriptions.push(querySettingsCommand);
  context.subscriptions.push(runQueryCommand);
  context.subscriptions.push(setPATCommand);
  context.subscriptions.push(showBuildViewCommand);
  context.subscriptions.push(showQueryViewCommand);
  context.subscriptions.push(workItemDetailCommand);

  window.registerTreeDataProvider('QueryView', queryTreeDataProvider);
  window.registerTreeDataProvider('BuildView', buildTreeDataProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
