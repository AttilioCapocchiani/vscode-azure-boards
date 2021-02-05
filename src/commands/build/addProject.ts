import axios from 'axios';
import { ExtensionContext, QuickPickItem, commands, window } from 'vscode';

export default async function addProject(context: ExtensionContext) {
  const pat: string = context.workspaceState.get("encryptedPAT", "");
  context.workspaceState.update("projects", []);

  if (pat) {
    const listJSON = context.workspaceState.get("organizations", []);
    const projectsArray: Array<string> = context.workspaceState.get("projects", []);
    window.showInformationMessage(projectsArray.join(','));
    const list: Set<string> = new Set(Array.from(listJSON));
    let projects: Set<string> = new Set(projectsArray);

    if (!list.size) {
      const organization = await askForOrganization(list, context);

      if (organization) {
        const projectsInOrg = await retrieveProjects(organization, pat);

        const options: Array<QuickPickItem> =
          projectsInOrg
            .filter((p: any) => !projects.has(`${organization}|${p.name}`))
            .map((p: any) => {
              return {
                label: p.name,
                detail: p.description
              };
            });

        const projectQuickPickItem = await window.showQuickPick(options, { placeHolder: "Select the project" });
        const project = projectQuickPickItem ? projectQuickPickItem.label : "";
        if (project) {
          projects.add(`${organization}/${project}`);
          context.workspaceState.update("projects", Array.from(projects));
        }
      } else {
        throw new Error("Please provide an organization name");
      }
    } else {
      // have some orgs cached
      let organization = await window.showQuickPick([...list, "Other..."], { placeHolder: "Select an organization" });

      if (organization) {
        if (organization === "Other...") {
          const tempOrganization = await askForOrganization(list, context);

          if (tempOrganization) {
            organization = tempOrganization;
          } else {
            throw new Error("Please provide an organization name");
          }
        }

        const projectsInOrg = await retrieveProjects(organization, pat);

        const options: Array<QuickPickItem> =
          projectsInOrg
            .filter((p: any) => !projects.has(p.name))
            .map((p: any) => {
              return {
                label: p.name,
                detail: p.description
              };
            });

        const projectQuickPickItem = await window.showQuickPick(options, { placeHolder: "Select the project" });
        const project = projectQuickPickItem ? projectQuickPickItem.label : "";
        if (project) {
          projects.add(`${organization}/${project}`);
          context.workspaceState.update("projects", Array.from(projects));
        }
      }
    }

    commands.executeCommand("devops-explorer.refreshTreeView");
  } else {
    window.showErrorMessage("PAT not found. Run Setup Personal Access Token");
  }
}

/**
 * Asks for user's Azure DevOps Organization and caches it
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