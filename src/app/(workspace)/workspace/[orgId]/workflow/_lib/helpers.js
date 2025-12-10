import { TaskRegistry } from "../lib/tasks/registry";

export function CalculateWOrkflowCost(nodes) {
    return nodes.reduce((acc, node) => {
        return acc + TaskRegistry[node.data.type].credits
    }, 0)
}

export function getAppUrl(path) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    return `${appUrl}/${path}`
}