import * as moment from "moment";
import { ViewColumn, window } from "vscode";
import { TreeItemEntry } from "../../dataProviders/treeDataProviders/QueryTreeDataProvider";
import { WorkItem } from "../../interfaces/interfaces";

export default async function openWorkItemDetail(workItem: TreeItemEntry) {
  const panel = window.createWebviewPanel(
    'workItemDetail',
    workItem.label,
    ViewColumn.One
  );
  panel.webview.html = getWebviewContent((workItem.wrapper as WorkItem).originalObject.fields);
}

function getWebviewContent(workItem: any): string {
  return `<html>
    <body>
      <h1>${workItem["System.Title"]}</h1>
      <h3>Assigned To: ${workItem["System.AssignedTo"]?.displayName || ''}</h3>
      <h3>${workItem["System.State"]} - ${workItem["System.Reason"]}</h3>
      <h3>Created: ${moment(workItem["System.CreatedDate"]).format("DD/MM/yyyy HH:mm:ss")} by ${workItem["System.CreatedBy"]?.displayName || ''}</h3> 
      <h3>Changed: ${moment(workItem["System.ChangedDate"]).format("DD/MM/yyyy HH:mm:ss")} by ${workItem["System.CreatedBy"]?.displayName || ''}</h3> 
      
      <h2>Description</h2>
      <p>${workItem["System.Description"] || "&nbsp;"}</p>

      <hr />

      <h2>Acceptance Criteria</h2>
      <p>${workItem["Microsoft.VSTS.Common.AcceptanceCriteria"] || "&nbsp;"}</p>

      <hr />

      <h2>Custom Fields</h2>
      ${
        Object.keys(workItem)
          .filter((key: string) => key.startsWith("Custom"))
          .map((key: string) => {
            const [ _, field ]: string[] = key.split(".");
            const value = workItem[key];
            return `<h3>${field}: ${value}</h3>`;
          })
          .join("")
        }
    </body>
    </html>`;
}