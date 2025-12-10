import { SendIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const DeliverViaWebhookTask = {
    type: TaskType.DELIVER_VIA_WEBHOOK,
    label: 'Deliver via webhook',
    icon: (props) => (
        <SendIcon className="stroke-blue-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
    inputs: [
        {
            name: 'Target URL',
            type: TaskParamTypes.STRING,
            required: true,
        },
        {
            name: 'Body',
            type: TaskParamTypes.STRING,
            required: true,
        }
    ],
    outputs: []

}
