import { MousePointerClick } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../_utils/types";

export const ClickElementTask = {
    type: TaskType.CLICK_ELEMENT,
    label: 'Click element',
    icon: (props) => (
        <MousePointerClick className="stroke-rose-500" {...props} />
    ),
    isEntryPoint: false,
    credits: 2,
    inputs: [
        {
            name: 'Web Page',
            type: TaskParamTypes.BROWSER_INSTANCE,
            required: true,
        },
        {
            name: 'Selector',
            type: TaskParamTypes.STRING,
            required: true,
        }
    ],
    outputs: [
        { name: 'Web Page', type: TaskParamTypes.BROWSER_INSTANCE },
    ]
}
