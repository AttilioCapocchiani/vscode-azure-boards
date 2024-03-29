import * as vscode from "vscode";
import * as u from "../../utils/utils";
import { QueryConfiguration, WorkItem } from "../../interfaces/interfaces";
export class QueryTreeDataProvider implements vscode.TreeDataProvider<TreeItemEntry> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItemEntry | undefined | null | void> = new vscode.EventEmitter<TreeItemEntry | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItemEntry | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  constructor(private context: vscode.ExtensionContext) {
    this.context = context;
  }

  getTreeItem(element: TreeItemEntry): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItemEntry): Promise<TreeItemEntry[]> {
    if (element) {
      switch (element.type) {
        case "Query":
          if (element.wrapper) {
            if (element.wrapper) {
              const workItems: WorkItem[] = await u.runQuery((element.wrapper as QueryConfiguration).organization, (element.wrapper as QueryConfiguration).project, (element.wrapper as QueryConfiguration).queryId, this.context, "");
              return workItems.map((workItem: WorkItem) => {
                if (workItem.children && workItem.children.length > 0) {
                  return new TreeItemEntry(`${workItem.workItemType} #${workItem.id}: ${workItem.title}`, `${workItem.state} - ${workItem.assignedTo}`, "WorkItem", vscode.TreeItemCollapsibleState.Collapsed, workItem);
                } else {
                  return new TreeItemEntry(`${workItem.workItemType} #${workItem.id}: ${workItem.title}`, `${workItem.state} - ${workItem.assignedTo}`, "WorkItem", vscode.TreeItemCollapsibleState.None, workItem);
                }
              });
            } else {
              return Promise.resolve([]);
            }
          }
          return Promise.resolve([]);
        case "WorkItem":
          if (element.wrapper) {
            if ((element.wrapper as WorkItem).children) {
              const children = (element.wrapper as WorkItem).children;

              return children!!.map((workItem: WorkItem) => {
                if (workItem.children && workItem.children.length > 0) {
                  return new TreeItemEntry(`${workItem.workItemType} #${workItem.id}: ${workItem.title}`, `${workItem.state} - ${workItem.assignedTo}`, "WorkItem", vscode.TreeItemCollapsibleState.Collapsed, workItem);
                } else {
                  return new TreeItemEntry(`${workItem.workItemType} #${workItem.id}: ${workItem.title}`, `${workItem.state} - ${workItem.assignedTo}`, "WorkItem", vscode.TreeItemCollapsibleState.None, workItem);
                }
              });
            } else {
              return Object.entries(element.wrapper)
                .map((entry: [string, any]) => {
                  return new TreeItemEntry(`${u.camelCaseToSentenceCase(entry[0])} - ${entry[1]}`, "", "WorkItemField", vscode.TreeItemCollapsibleState.None);
                });
            }
          }
          return Promise.resolve([]);
        default:
          return Promise.resolve([]);
      }
    } else {
      const queries: Array<QueryConfiguration> = this.context.workspaceState.get("queries", []);
      return Promise.resolve(
        queries.map((query: QueryConfiguration) => {
          return new TreeItemEntry(query.queryName ? query.queryName : "", "", "Query", vscode.TreeItemCollapsibleState.Collapsed, query);
        })
      );
    }
  }
}

export class TreeItemEntry extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly type: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public wrapper?: QueryConfiguration | WorkItem | string
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = description;
    this.wrapper = wrapper;
    this.contextValue = type;
  }
}
