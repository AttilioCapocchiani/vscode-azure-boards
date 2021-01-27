import { QuickPickItem, commands, window } from "vscode";
import { Command } from "../interfaces/interfaces";

const menuCommands: Command[] = [
    {
        label: "Add new Query...",
        command: "azure-boards.addQuery",
        detail: "Stores a new query",
        icon: "plus"
    },
    {
        label: "Run Query...",
        command: "azure-boards.runQuery",
        detail: "Runs an already saved query",
        icon: "play"
    },
    {
        label: "Delete saved Query",
        command: "azure-boards.deleteQuery",
        detail: "Deletes an already saved query",
        icon: "trash"
    },
    {
        label: "Replace Personal Access Token...",
        command: "azure-boards.setPAT",
        detail: "Replaces currently saved Personal Access Token",
        icon: "gear"
    }
];

export default async function openMenu () {
    const items: QuickPickItem[] = menuCommands.map(mapCommandToQuickPickItem);

    const selectedCommand = await window.showQuickPick(items, { placeHolder: "Select option" } );
    
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