import { ExtensionContext, commands } from "vscode";

export async function showBuildView(context: ExtensionContext) {
  context.workspaceState.update("BUILD_VIEW_STATUS", "VISIBLE");
  commands.executeCommand("devops-explorer.refreshTreeView");
}

export async function hideBuildView(context: ExtensionContext) {
  context.workspaceState.update("BUILD_VIEW_STATUS", "HIDDEN");
  commands.executeCommand("devops-explorer.refreshTreeView");
}