import {ExtensionContext, commands } from "vscode";

export async function showQueryView (context: ExtensionContext) {
  context.workspaceState.update("QUERY_VIEW_STATUS", "VISIBLE");
  await commands.executeCommand("devops-explorer.refreshQueryView");
  commands.executeCommand("setContext", "queryViewEnabled", true);
}

export async function hideQueryView(context: ExtensionContext) {
  context.workspaceState.update("QUERY_VIEW_STATUS", "HIDDEN");
  await commands.executeCommand("devops-explorer.refreshQueryView");
  commands.executeCommand("setContext", "queryViewEnabled", false);
}