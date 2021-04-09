export interface Build {
  id: number
  status: string
  result: string
  startTime: string
  finishTime: string
  originalObject: any
  requestedFor: string
  repositoryName: string
}

export interface Command {
  command: string
  detail: string
  icon?: string
  label: string
  show?: string
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
  children?: WorkItem[]
  createdBy: string
  createdDate: string
  id: string
  originalObject: any
  reason: string
  state: string
  title: string
  wrapper?: any
  workItemType: string
}