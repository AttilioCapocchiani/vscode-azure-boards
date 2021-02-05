import * as vscode from "vscode";
import * as path from "path";
import * as u from "../../utils/utils";
import * as moment from "moment";
import * as _ from "lodash";
import { Build, QueryConfiguration, WorkItem } from "../../interfaces/interfaces";

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
        case "BuildsRoot":
          const projects = this.context.workspaceState.get("projects", []);
          if (projects.length) {
            return Promise.resolve(projects.map((project: string): TreeItemEntry => {
              return new TreeItemEntry(project, "", "Project", vscode.TreeItemCollapsibleState.Collapsed, project);
            }));
          }
          return Promise.resolve([]);
        case "Project":
          if (element.wrapper) {
            const [organization, project] = (element.wrapper as string).split("/");
            const builds: Build[] = await u.getLastBuilds(organization, project, this.context);

            return Promise.resolve(builds.map((build: Build) => {
              let description = `From: ${build.originalObject.requestedFor.displayName}`;
              if (build.startTime) {
                description += ` - Start: ${moment(build.startTime).format("DD/MM/YYYY HH:mm")}`;
              }
              if (build.finishTime) {
                description += ` - End: ${moment(build.finishTime).format("DD/MM/YYYY HH:mm")})`;
              }

              return new TreeItemEntry(`${build.id}`, description, "Build", vscode.TreeItemCollapsibleState.Collapsed, build);
            }));
          }
          return Promise.resolve([]);
        case "Build":
          if (element.wrapper) {
            const build: Build = element.wrapper as Build;
            return Promise.resolve([
              new TreeItemEntry(`Id: ${build.id}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Status: ${build.status}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Result: ${build.result}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Start Time: ${build.startTime ? build.startTime : ""}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Finish Time: ${build.finishTime ? build.finishTime : ""}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Requested for: ${build.requestedFor}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
              new TreeItemEntry(`Repository Name: ${build.repositoryName}`, "", "BuildField", vscode.TreeItemCollapsibleState.None),
            ]);
          }
          return Promise.resolve([]);
        case "QueryRoot":
          const queries: Array<QueryConfiguration> = this.context.workspaceState.get("queries", []);
          return Promise.resolve(
            queries.map((query: QueryConfiguration) => {
              return new TreeItemEntry(query.queryName ? query.queryName : "", "", "Query", vscode.TreeItemCollapsibleState.Collapsed, query);
            })
          );
        case "PipelinesRoot":
          return Promise.resolve([]);
        case "Query":
          if (element.wrapper) {
            if (element.wrapper) {
              const workItems: WorkItem[] = await u.runQuery((element.wrapper as QueryConfiguration).organization, (element.wrapper as QueryConfiguration).project, (element.wrapper as QueryConfiguration).queryId, this.context, "");
              return workItems.map((workItem: WorkItem) => {
                return new TreeItemEntry(`${workItem.workItemType} #${workItem.id}: ${workItem.title}`, `${workItem.state} - ${workItem.assignedTo}`, "WorkItem", vscode.TreeItemCollapsibleState.None, workItem);
              });
            } else {
              return Promise.resolve([]);
            }
          }
          return Promise.resolve([]);
        case "WorkItem":
          if (element.wrapper) {
            return Object.entries(element.wrapper)
              .map((entry: [string, any]) => {
                return new TreeItemEntry(`${u.camelCaseToSentenceCase(entry[0])} - ${entry[1]}`, "", "WorkItemField", vscode.TreeItemCollapsibleState.None);
              });
          }
          return Promise.resolve([]);
        default:
          return Promise.resolve([]);
      }
    } else {
      const buildViewStatus: string = this.context.workspaceState.get("BUILD_VIEW_STATUS", "HIDDEN");
      const queryViewStatus: string = this.context.workspaceState.get("QUERY_VIEW_STATUS", "HIDDEN");
      
      const tree: TreeItemEntry[] = [];
      if (buildViewStatus === "VISIBLE") {
        tree.push(new TreeItemEntry("Builds", "", "BuildsRoot", vscode.TreeItemCollapsibleState.Collapsed));
      }
      if (queryViewStatus === "VISIBLE") {
        tree.push(new TreeItemEntry("Queries", "", "QueryRoot", vscode.TreeItemCollapsibleState.Collapsed));
      }
      return Promise.resolve(tree);
    }
  }
}

export class TreeItemEntry extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly type: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public wrapper?: QueryConfiguration | WorkItem | Build | string
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = description;
    this.wrapper = wrapper;
    this.contextValue = type;

    console.log(path.join(__dirname, "..", "..", "..", "media", "light", "tick.svg"));

    switch (type) {
      case "Build":
        switch ((wrapper as Build).status) {
          case "notStarted":
            break;
          case "completed":
            if ((wrapper as Build).originalObject.result === "succeeded") {
              this.iconPath = {
                light: path.join(__dirname, "..", "..", "..", "media", "light", "tick.svg"),
                dark: path.join(__dirname, "..", "..", "..", "media", "dark", "tick.svg")
              };
            } else {
              this.iconPath = {
                light: path.join(__dirname, "..", "..", "..", "media", "light", "cross.svg"),
                dark: path.join(__dirname, "..", "..", "..", "media", "dark", "cross.svg")
              };
            }
            break;
          case "inProgress":
            this.iconPath = {
              light: path.join(__dirname, "..", "..", "..", "media", "light", "gear.svg"),
              dark: path.join(__dirname, "..", "..", "..", "media", "dark", "gear.svg")
            };
            break;
          default:
            this.iconPath = {
              light: path.join(__dirname, "..", "..", "..", "media", "light", "cross.svg"),
              dark: path.join(__dirname, "..", "..", "..", "media", "dark", "cross.svg")
            };
        }
    }
  }
}
