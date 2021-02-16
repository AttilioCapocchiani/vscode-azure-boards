import * as vscode from "vscode";
import * as path from "path";
import * as u from "../../utils/utils";
import * as moment from "moment";
import * as _ from "lodash";
import { Build } from "../../interfaces/interfaces";

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
            const builds: Build[] = _.slice(await u.getLastBuilds(organization, project, this.context), 0, 10);

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
            const entries = [];

            if (build.id) {
              entries.push(new TreeItemEntry(`Id: ${build.id}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.status) {
              entries.push(new TreeItemEntry(`Status: ${build.status}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.result) {
              entries.push(new TreeItemEntry(`Result: ${build.result}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.startTime) {
              entries.push(new TreeItemEntry(`Start Time: ${build.startTime ? build.startTime : ""}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.finishTime) {
              entries.push(new TreeItemEntry(`Finish Time: ${build.finishTime ? build.finishTime : ""}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.requestedFor) {
              entries.push(new TreeItemEntry(`Requested for: ${build.requestedFor}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }
            if (build.repositoryName) {
              entries.push(new TreeItemEntry(`Repository Name: ${build.repositoryName}`, "", "BuildField", vscode.TreeItemCollapsibleState.None));
            }

            return Promise.resolve(entries);

          }
          return Promise.resolve([]);
        default:
          return Promise.resolve([]);
      }
    } else {
      const projects = this.context.workspaceState.get("projects", []);
      if (projects.length) {
        return Promise.resolve(projects.map((project: string): TreeItemEntry => {
          return new TreeItemEntry(project, "", "Project", vscode.TreeItemCollapsibleState.Collapsed, project);
        }));
      }
      return Promise.resolve([]);
    }
  }
}

export class TreeItemEntry extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly type: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public wrapper?: Build | string
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = description;
    this.wrapper = wrapper;
    this.contextValue = type;

    if (type === "Build") {
      switch ((wrapper as Build).status) {
        case "notStarted":
          this.iconPath = {
            light: path.join(__dirname, "..", "..", "..", "media", "light", "spinner.svg"),
            dark: path.join(__dirname, "..", "..", "..", "media", "dark", "spinner.svg")
          };
          break;
        case "completed":
          if ((wrapper as Build).originalObject.result === "succeeded") {
            this.iconPath = {
              light: path.join(__dirname, "..", "..", "..", "media", "light", "check.svg"),
              dark: path.join(__dirname, "..", "..", "..", "media", "dark", "check.svg")
            };
          } else {
            this.iconPath = {
              light: path.join(__dirname, "..", "..", "..", "media", "light", "times.svg"),
              dark: path.join(__dirname, "..", "..", "..", "media", "dark", "times.svg")
            };
          }
          break;
        case "inProgress":
          this.iconPath = {
            light: path.join(__dirname, "..", "..", "..", "media", "light", "wrench.svg"),
            dark: path.join(__dirname, "..", "..", "..", "media", "dark", "wrench.svg")
          };
          break;
        default:
          this.iconPath = {
            light: path.join(__dirname, "..", "..", "..", "media", "light", "times.svg"),
            dark: path.join(__dirname, "..", "..", "..", "media", "dark", "times.svg")
          };
      }
    }
  }
}
