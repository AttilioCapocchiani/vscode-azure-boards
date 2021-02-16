import { ExtensionContext, QuickPickItem, commands, window } from "vscode";
import { Command } from "../../interfaces/interfaces";
import { mapCommandToQuickPickItem } from "../../utils/utils";

const menuCommands: Command[] = [
  {
    label: "Show query view...",
    command: "devops-explorer.showQueryView",
    detail: "Show queries in DevOps Explorer",
    show: "HIDDEN"
  },
  {
    label: "Hide query view...",
    command: "devops-explorer.hideQueryView",
    detail: "Hide queries in DevOps Explorer",
    show: "VISIBLE"
  },
  {
    label: "Add new Query...",
    command: "devops-explorer.addQuery",
    detail: "Stores a new query",
    icon: "plus"
  },
  {
    label: "Run Query...",
    command: "devops-explorer.runQuery",
    detail: "Runs an already saved query",
    icon: "play"
  },
  {
    label: "Delete saved Query",
    command: "devops-explorer.deleteQuery",
    detail: "Deletes an already saved query",
    icon: "trash"
  },
];

export default async function openSettings(context: ExtensionContext) {
  const queryViewStatus = context.workspaceState.get("QUERY_VIEW_STATUS", "HIDDEN");

  const items: QuickPickItem[] = menuCommands
    .filter((c: Command) => !c.show || c.show === queryViewStatus)
    .map(mapCommandToQuickPickItem);

  const selectedCommand = await window.showQuickPick(items, { placeHolder: "Select option" });

  if (selectedCommand) {
    const commandToExecute: Command = menuCommands.find((c: Command) => c.detail === selectedCommand.detail)!!;
    await commands.executeCommand(commandToExecute.command);
  }
}