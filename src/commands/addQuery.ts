import axios from 'axios';
import { Map as mapImmutable, Set as ImmutableSet } from 'immutable'
import { ExtensionContext, QuickPickItem, window } from 'vscode';
import { QueryConfiguration } from '../interfaces/interfaces';

export default async function addQuery(context: ExtensionContext) {
    const queryPath: QueryConfiguration = {
        organization: '',
        project: '',
        queryId: '',
        queryName: ''
    };

    const pat: string = context.workspaceState.get("encryptedPAT", "");

    if (pat) {
        const listJSON = context.workspaceState.get("organizations", "[]");
        const savedQueries = context.workspaceState.get("queries", "[]");

        const list: Set<string> = new Set(Array.from(listJSON));

        if (!list.size) {
            const organization = await askForOrganization(list, context);

            if (organization) {
               const projects = await retrieveProjects(organization, pat);

               const options: Array<QuickPickItem> = projects.map((p: any) => {
                return {
                    label: p.name,
                    detail: p.description
                };
            });

            const project = await window.showQuickPick(options, { placeHolder: "Select the project"});
               if (project) {

               }
            } else {
                throw new Error("Please provide an organization name");
            }


        } else {
            // have some orgs cached
            let organization = await window.showQuickPick([...list, "Other..."], { placeHolder: "Select an organization"});
            // window.showInformationMessage(`Org: "${organization}"`);

            if (organization) {
                if (organization === "Other...") {
                    const tempOrganization = await askForOrganization(list, context);

                    if (tempOrganization) {
                        organization = tempOrganization;
                    } else { 
                        throw new Error("Please provide an organization name");
                    }
                }

                const projects = await retrieveProjects(organization, pat);

                const options: Array<QuickPickItem> = projects.map((p: any) => {
                    return {
                        label: p.name,
                        detail: p.description
                    };
                });

                const projectQuickPickItem = await window.showQuickPick(options, { placeHolder: "Select the project"});
                const project = projectQuickPickItem?.label;

                if (project) {
                    const queryId = await window.showInputBox({
                        prompt: "Insert your query ID (take it from the URL)"
                    });

                    if (queryId) {
                        const queryName = await window.showInputBox({
                            prompt: "Insert an alias for this query",
                            placeHolder: queryId
                        });

                        queryPath.organization = organization;
                        queryPath.project = project;
                        queryPath.queryId = queryId;
                        queryPath.queryName = queryName;
                        
                    } else {
                        throw new Error("Please provide Query Id")
                    }
                }
            }
        }
    } else {
        window.showErrorMessage("PAT not found. Run Setup Personal Access Token");
    }
}

/**
 * Asks for user's Azure DevOps Organization and adds caches it
 */
async function askForOrganization(organizations: Set<string>, context: ExtensionContext): Promise<string | undefined> {
    const organization = await window.showInputBox({
        prompt: "Insert your organization"
    });

    if (organization) {
        organizations.add(organization);
        context.workspaceState.update("organizations", Array.from(organizations));
        return organization;
    } else {
        return undefined;
    }
}

async function retrieveProjects(organization: string, pat: string): Promise<Array<string>> {
    const options = {
        headers: {
            "Authorization": `Basic ${pat}`
        }
    };

    const response = await axios.get(`https://dev.azure.com/${organization}/_apis/projects`, options);
    return response.data.value;
}