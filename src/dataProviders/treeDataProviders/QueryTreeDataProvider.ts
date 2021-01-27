import * as vscode from "vscode";
import * as path from "path";
import { QueryConfiguration } from "../../interfaces/interfaces";

export default class QueryTreeDataProvider implements vscode.TreeDataProvider<Query> {
    constructor(private workspaceRoot: string) { }

    getTreeItem(element: Query): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Query): Thenable<Query[]> {
        if (element!.label === "Azure DevOps")  {
            return Promise.resolve(
                [
                    new Query("Queries", vscode.TreeItemCollapsibleState.None),
                    new Query("Pipelines", vscode.TreeItemCollapsibleState.None),
                ]
            );
        } else {
            return Promise.resolve([]);
        }
    }
}

class Query extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.description = this.label;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };
}
