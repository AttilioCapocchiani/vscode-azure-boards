import * as vscode from "vscode";
import * as moment from "moment";
import * as _ from "lodash";
import { Build, Command, WorkItem } from "../interfaces/interfaces";
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

  if (response.data.queryResultType === "workItemLink") {
    const workItems: any[] = response.data.workItemRelations;

    const mapped: any[] = workItems.map(stripUnnecessaryFields);
    const idSet: Set<number> = new Set();
    const tree = unflatten(mapped, idSet);
    const ids = Array.from(idSet).join(',');

    const detailResponse = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${ids}&api-version=6.1-preview.3`, options);
    const workItemsDetail: WorkItem[] = detailResponse.data.value
      .map(mapWorkItem)
      .map((workItem: WorkItem) => { 
        return { 
          ...workItem, 
          organization, 
          project 
        };
      });

    const result: WorkItem[] = [];

    for (let item of tree) {
      result.push(navigate(item, workItemsDetail));
    }

    return result;
  } else if (response.data.queryResultType === "workItem") {
    const workItems = response.data.workItems.map((workItem: any) => workItem.id).join(',');
    const detailResponse = await axios.get(`https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${workItems}&api-version=6.1-preview.3`, options);

    return detailResponse.data.value
      .map(mapWorkItem)
      .map((workItem: WorkItem) => { 
        return { 
          ...workItem, 
          organization, 
          project 
        };
      });
  } else {
    return [];
  }
}

export async function getLastBuilds(organization: string, project: string, context: vscode.ExtensionContext, pat?: string): Promise<Build[]> {
  if (!pat) {
    pat = context.workspaceState.get("encryptedPAT", "");
  }

  const options = {
    headers: {
      "Authorization": `Basic ${pat}`
    }
  };

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

export function mapCommandToQuickPickItem(command: Command): vscode.QuickPickItem {
  return {
    label: `$(${command.icon}) ${command.label}`,
    detail: command.detail
  };
}

function mapWorkItem(workItem: any): WorkItem {
  return {
    assignedTo: workItem.fields["System.AssignedTo"]?.displayName || 'Unassigned',
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

function stripUnnecessaryFields(workItem: any): any {
  const returnObject = {
    id: 0,
    parentid: 0
  };

  if (workItem.source) {
    returnObject.parentid = workItem.source.id || 0;
  }

  if (workItem.target) {
    returnObject.id = workItem.target.id || 0;
  }
  return returnObject;
}

function unflatten(array: any[], ids: Set<number>, parent?: any, tree?: any[]): any[] {
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = array.filter(child => child.parentid === parent.id);

  if (!_.isEmpty(children)) {
    if (parent.id === 0) {
      tree = children;
    } else {
      parent['children'] = children;
      ids.add(parent.id);
    }

    children.forEach(child => {
      ids.add(child.id);
      unflatten(array, ids, child);
    });
  }

  return tree;
}

function navigate(item: any, source: WorkItem[]): WorkItem {
  const workItem = source.find((wi: WorkItem) => wi.id === item.id)!!;

  if ('children' in item && item.children.length) {
    workItem.children = [];
    item.children.forEach((child: any) => {
      workItem.children!!.push(navigate(child, source));
    });
  }

  return workItem;
}