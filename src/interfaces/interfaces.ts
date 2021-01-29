export interface Command {
  command: string
  detail: string
  icon: string
  label: string
}
export interface QueryConfiguration {
  organization: string
  project: string
  queryId: string
  queryName: string
}

export interface WorkItem {
  assignedTo: string
  changedBy: string
  changedDate: string
  createdBy: string
  createdDate: string
  id: string
  reason: string
  state: string
  title: string
  workItemType: string
  originalObject: any
}