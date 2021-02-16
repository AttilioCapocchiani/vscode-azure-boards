import { QuickPickItem, commands, window } from "vscode";
import { Command } from "../../interfaces/interfaces";
import { mapCommandToQuickPickItem } from "../../utils/utils";

const menuCommands: Command[] = [
  {
    label: "Replace Personal Access Token...",
    command: "devops-explorer.setPAT",
    detail: "Replaces currently saved Personal Access Token",
    icon: "gear"
  }
];

export default async function openSettings () {
  const items: QuickPickItem[] = menuCommands.map(mapCommandToQuickPickItem);

  const selectedCommand = await window.showQuickPick(items, { placeHolder: "Select option" });

  if (selectedCommand) {
    const commandToExecute: Command = menuCommands.find((c: Command) => c.detail === selectedCommand.detail)!!;
    await commands.executeCommand(commandToExecute.command);
  }
}