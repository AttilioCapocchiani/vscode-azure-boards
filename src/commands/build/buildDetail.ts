import { env, Uri } from "vscode";
import { TreeItemEntry } from "../../dataProviders/treeDataProviders/BuildTreeDataProvider";
import { Build } from "../../interfaces/interfaces";

export default async function buildDetail (build: TreeItemEntry) {
  env.openExternal(Uri.parse((build.wrapper as Build).originalObject._links.web.href));
}