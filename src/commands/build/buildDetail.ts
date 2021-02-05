import { env, Uri } from "vscode";
import { TreeItemEntry } from "../../dataProviders/treeDataProviders/QueryTreeDataProvider";
import { Build } from "../../interfaces/interfaces";

export default async function buildDetail (build: TreeItemEntry) {
  env.openExternal(Uri.parse((build.wrapper as Build).originalObject.url));
}