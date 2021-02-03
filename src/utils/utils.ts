import * as vscode from "vscode";
import * as moment from "moment";
import { Build, WorkItem } from "../interfaces/interfaces";
import axios from "axios";

export async function runQuery(organization: string, project: string, queryId: string, context: vscode.ExtensionContext, pat?: string): Promise<WorkItem[]> {
  if (!pat) {
    pat = context.workspaceState.get("encryptedPAT", "");
  }

  const options = {
    headers: {
      "Authorization": `Basic ${pat}`
    }
  };

  const response = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/wiql/${queryId}?api-version=6.0`, options);
  const workItems = response.data.workItems.map((workItem: any) => workItem.id).join(',');
  const detailResponse = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${workItems}&api-version=6.1-preview.3`, options);

  return detailResponse.data.value.map(mapWorkItem);
}

export async function getLastBuilds (organization: string, project: string, context: vscode.ExtensionContext, pat?: string): Promise<Build[]> {
  if (!pat) {
    pat = context.workspaceState.get("encryptedPAT", "");
  }

  const options = {
    headers: {
      "Authorization": `Basic ${pat}`
    }
  };

  vscode.window.showInformationMessage(`https://dev.azure.com/${organization}/${project}/_apis/build/builds?api-version=6.0`);

  const response = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/build/builds?api-version=6.0`, options);
  const builds: Build[] = response.data.value.map((build: any): Build => {
    return {
      id: build.id,
      status: build.status,
      result: build.result,
      startTime: build.startTime,
      finishTime: build.finishTime,
      originalObject: build,
      requestedFor: build.requestedFor.displayName,
      repositoryName: build.repository.name
    };
  });

  return builds;
}

export function camelCaseToSentenceCase(word: string): string {
  const result = word.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function mapWorkItem(workItem: any): WorkItem {
  return {
    assignedTo: workItem.fields["System.AssignedTo"].displayName,
    changedBy: workItem.fields["System.ChangedBy"].displayName,
    changedDate: moment(workItem.fields["System.ChangedDate"]).format('DD/MM/yyyy HH:mm:ss'),
    createdBy: workItem.fields["System.CreatedBy"].displayName,
    createdDate: moment(workItem.fields["System.CreatedDate"]).format('DD/MM/yyyy HH:mm:ss'),
    id: workItem.id,
    reason: workItem.fields["System.Reason"],
    state: workItem.fields["System.State"],
    title: workItem.fields["System.Title"],
    workItemType: workItem.fields["System.WorkItemType"],
    originalObject: workItem
  };
}