import { ExtensionContext, commands } from "vscode";

export async function showBuildView(context: ExtensionContext) {
  context.workspaceState.update("BUILD_VIEW_STATUS", "VISIBLE");
  await commands.executeCommand("setContext", "buildsViewEnabled", true);
  commands.executeCommand("devops-explorer.refreshBuildView");
}

export async function hideBuildView(context: ExtensionContext) {
  context.workspaceState.update("BUILD_VIEW_STATUS", "HIDDEN");
  await commands.executeCommand("setContext", "buildsViewEnabled", false);
  commands.executeCommand("devops-explorer.refreshBuildView");
}