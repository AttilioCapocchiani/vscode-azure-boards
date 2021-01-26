import axios from 'axios';
import * as moment from 'moment';
import { ExtensionContext, QuickPickItem, ViewColumn, window } from 'vscode';
import { QueryConfiguration } from '../interfaces/interfaces';

export default async function runQuery(context: ExtensionContext) {
    const pat: string = context.workspaceState.get("encryptedPAT", "");
    if (pat) {
        const queries: Array<QueryConfiguration> = context.workspaceState.get("queries", []);

        if (queries.length) {
            const queryOptions: Array<QuickPickItem> = queries.map((q: QueryConfiguration) => {
                return {
                    label: q.queryName!!,
                    description: q.queryId!!,
                    detail: `${q.organization} - ${q.project}`
                };
            });

            const query = await window.showQuickPick(queryOptions, { placeHolder: "Select query to run" });

            if (query) {
                const { organization, project, queryId, queryName } = queries.find(q => q.queryId === query.description)!!;

                const options = {
                    headers: {
                        "Authorization": `Basic ${pat}`
                    }
                };

                const response = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/wiql/${queryId}?api-version=6.0`, options);

                const panel = window.createWebviewPanel(
                    'queryResults',
                    `${queryName} Results`,
                    ViewColumn.One,
                    {}
                );

                const workItems = response.data.workItems.map((workItem: any) => workItem.id).join(',');

                const detailResponse = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${workItems}&api-version=6.1-preview.3`, options);

                const objects = detailResponse.data.value.map(mapWorkItem);

                // And set its HTML content
                panel.webview.html = getWebviewContent(objects, organization!!, project!!);
            }
        } else {
            throw new Error("No queries saved. Please run Add new Query");
        }
    } else {
        window.showErrorMessage("PAT not found. Run Setup Personal Access Token");
    }
}

function mapWorkItem(workItem: any): any {
    return {
        id: workItem.id,
        workItemType: workItem.fields["System.WorkItemType"],
        state: workItem.fields["System.State"],
        reason: workItem.fields["System.Reason"],
        assignedTo: workItem.fields["System.AssignedTo"].displayName,
        createdDate: moment(workItem.fields["System.CreatedDate"]).format('DD/MM/yyyy HH:mm:sss'),
        createdBy: workItem.fields["System.CreatedBy"].displayName,
        changedDate: moment(workItem.fields["System.ChangedDate"]).format('DD/MM/yyyy HH:mm:sss'),
        changedBy: workItem.fields["System.ChangedBy"].displayName
    };
}

function getWebviewContent(rows: any[], organization: string, project: string) {
    return `<!DOCTYPE html>
    <html lang="en">
    <body>
        <table style="border: 1">
            <thead>
                <th>Id</th>
                <th>Work Item Type</th>
                <th>State</th>
                <th>Reason</th>
                <th>Assigned To</th>
                <th>Created Date</th>
                <th>Created By</th>
                <th>Changed Date</th>
                <th>Changed By</th>
            </thead>
            <tbody>
                ${rows.map((row: any) => `
                    <tr>
                        <td><a href="https://dev.azure.com/${organization}/${project}/_workitems/edit/${row.id}">${row.id}</a></td>
                        <td>${row.workItemType}</td>
                        <td>${row.state}</td>
                        <td>${row.reason}</td>
                        <td>${row.assignedTo}</td>
                        <td>${row.createdDate}</td>
                        <td>${row.createdBy}</td>
                        <td>${row.changedDate}</td>
                        <td>${row.changedBy}</td>
                    </tr>`
                )}
            </tbody>
        </table>
    </body>
    </html>`;
}