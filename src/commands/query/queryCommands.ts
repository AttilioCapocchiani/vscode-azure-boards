import {ExtensionContext, commands } from "vscode";

export async function showQueryView (context: ExtensionContext) {
  context.workspaceState.update("QUERY_VIEW_STATUS", "VISIBLE");
  commands.executeCommand("devops-explorer.refreshTreeView");
}

export async function hideQueryView(context: ExtensionContext) {
  context.workspaceState.update("QUERY_VIEW_STATUS", "HIDDEN");
  commands.executeCommand("devops-explorer.refreshTreeView");
}