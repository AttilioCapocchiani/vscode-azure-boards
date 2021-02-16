import { QuickPickItem, commands, window } from "vscode";
import { Command } from "../interfaces/interfaces";

const menuCommands: Command[] = [
  {
    label: "Query Settings...",
    command: "devops-explorer.querySettings",
    detail: "Manage query settings",
    icon: "three-bars"
  }, 
  {
    label: "Build Settings...",
    command: "devops-explorer.buildSettings",
    detail: "Manage build settings",
    icon: "wrench"
  }, 
  {
    label: "Settings...",
    command: "devops-explorer.openSettings",
    detail: "Other settings",
    icon: "gear"
  }
  // {
  //   label: "Add new Query...",
  //   command: "devops-explorer.addQuery",
  //   detail: "Stores a new query",
  //   icon: "plus"
  // },
  // {
  //   label: "Run Query...",
  //   command: "devops-explorer.runQuery",
  //   detail: "Runs an already saved query",
  //   icon: "play"
  // },
  // {
  //   label: "Delete saved Query",
  //   command: "devops-explorer.deleteQuery",
  //   detail: "Deletes an already saved query",
  //   icon: "trash"
  // },
  // {
  //   label: "Replace Personal Access Token...",
  //   command: "devops-explorer.setPAT",
  //   detail: "Replaces currently saved Personal Access Token",
  //   icon: "gear"
  // }
];

export default async function openMenu() {
  const items: QuickPickItem[] = menuCommands.map(mapCommandToQuickPickItem);

  const selectedCommand = await window.showQuickPick(items, { placeHolder: "Select option" });

  if (selectedCommand) {
    const commandToExecute: Command = menuCommands.find((c: Command) => c.detail === selectedCommand.detail)!!;
    await commands.executeCommand(commandToExecute.command);
  }
}

function mapCommandToQuickPickItem(command: Command): QuickPickItem {
  return {
    label: `$(${command.icon}) ${command.label}`,
    detail: command.detail
  };
}