import { ExtensionContext, QuickPickItem, ViewColumn, window } from 'vscode';
import { QueryConfiguration, WorkItem } from '../interfaces/interfaces';
import * as u from "../utils/utils";

export default async function runQuery(context: ExtensionContext) {
  const pat: string = context.workspaceState.get("encryptedPAT", "");
  if (pat) {
    const queries: Array<QueryConfiguration> = context.workspaceState.get("queries", []);

    if (queries.length) {
      const queryOptions: Array<QuickPickItem> = queries.map((q: QueryConfiguration) => {
        return {
          label: q.queryName,
          description: q.queryId,
          detail: `${q.organization} - ${q.project}`
        };
      });

      const query = await window.showQuickPick(queryOptions, { placeHolder: "Select query to run" });

      if (query) {
        const { organization, project, queryId, queryName } = queries.find(q => q.queryId === query.description)!!;
        const workItems = await u.runQuery(organization, project, queryId, context);

        const panel = window.createWebviewPanel(
          'queryResults',
          `${queryName} Results`,
          ViewColumn.One,
          {}
        );
        panel.webview.html = getWebviewContent(workItems, organization, project);
      }
    } else {
      throw new Error("No queries saved. Please run Add new Query");
    }
  } else {
    window.showErrorMessage("PAT not found. Run Setup Personal Access Token");
  }
}

function getWebviewContent(rows: WorkItem[], organization: string, project: string) {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
          <style>
              table, th, td {
                  border: 1px solid black;
              }
              th, td {
                  padding: 15px;
                  text-align: left;
              }
          </style>
      </head>
      <body>
          <table>
              <thead>
                  <th>Id</th>
                  <th>Work Item Type</th>
                  <th>Title</th>
                  <th>State</th>
                  <th>Reason</th>
                  <th>Assigned To</th>
                  <th>Created Date</th>
                  <th>Created By</th>
                  <th>Changed Date</th>
                  <th>Changed By</th>
              </thead>
              <tbody>
                  ${rows.map((row: any) => `<tr>
                    <td><a href="https://dev.azure.com/${organization}/${project}/_workitems/edit/${row.id}">${row.id}</a></td>
                    <td>${row.workItemType}</td>
                    <td>${row.title}</td>
                    <td>${row.state}</td>
                    <td>${row.reason}</td>
                    <td>${row.assignedTo}</td>
                    <td>${row.createdDate}</td>
                    <td>${row.createdBy}</td>
                    <td>${row.changedDate}</td>
                    <td>${row.changedBy}</td>
                </tr>`).join("")}
              </tbody>
          </table>
      </body>
    </html>`;
}