import { ExtensionContext, QuickPickItem, window } from 'vscode';
import { QueryConfiguration } from "../interfaces/interfaces";

export default async function deleteQuery (context: ExtensionContext) {
    const pat: string = context.workspaceState.get("encryptedPAT", "");
    if (pat) {
        let queries: Array<QueryConfiguration> = context.workspaceState.get("queries", []);

        if (queries.length) {
            const queryOptions: Array<QuickPickItem> = queries.map((q: QueryConfiguration) => {
                return {
                    label: q.queryName!!,
                    description: q.queryId!!,
                    detail: `${q.organization} - ${q.project}`
                };
            });

            const query = await window.showQuickPick(queryOptions, { placeHolder: "Select query to delete" });

            if (query) {
                queries = queries.filter((q: QueryConfiguration) => q.queryId !== query.description);
                context.workspaceState.update("queries", queries);
            }
        }
    }
}