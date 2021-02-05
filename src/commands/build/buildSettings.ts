import { ExtensionContext, QuickPickItem, commands, window } from "vscode";
import { Command } from "../../interfaces/interfaces";
import { mapCommandToQuickPickItem } from "../../utils/utils";

const menuCommands: Command[] = [
  {
    label: "Show build view...",
    command: "devops-explorer.showBuildView",
    detail: "Show queries in DevOps Explorer",
    show: "HIDDEN"
  },
  {
    label: "Hide build view...",
    command: "devops-explorer.hideBuildView",
    detail: "Hide queries in DevOps Explorer",
    show: "VISIBLE"
  },
  {
    label: "Add new Project...",
    command: "devops-explorer.addProject",
    detail: "Stores a new project",
    icon: "plus"
  },
  {
    label: "Delete saved Project",
    command: "devops-explorer.deleteProject",
    detail: "Deletes an already saved Project",
    icon: "trash"
  },
];

export default async function openSettings(context: ExtensionContext) {
  const buildViewStatus = context.workspaceState.get("BUILD_VIEW_STATUS", "HIDDEN");

  const items: QuickPickItem[] = menuCommands
    .filter((c: Command) => !c.show || c.show === buildViewStatus)
    .map(mapCommandToQuickPickItem);

  const selectedCommand = await window.showQuickPick(items, { placeHolder: "Select option" });

  if (selectedCommand) {
    const commandToExecute: Command = menuCommands.find((c: Command) => c.detail === selectedCommand.detail)!!;
    await commands.executeCommand(commandToExecute.command);
  }
}