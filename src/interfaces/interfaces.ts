export interface Command {
    label: string
    detail: string
    command: string
    icon: string
}
export interface QueryConfiguration {
    organization: string | undefined
    project: string | undefined
    queryId: string | undefined
    queryName: string | undefined
}