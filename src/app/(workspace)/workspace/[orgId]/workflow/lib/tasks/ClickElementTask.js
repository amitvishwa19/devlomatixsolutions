import { MousePointerClick, MousePointerClickIcon, TextIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const ClickElementTask = {
    type: TaskType.CLICK_ELEMENT,
    label: 'Click element',
    icon: (props) => (
        <MousePointerClick className="stroke-rose-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 2,
    inputs: [
        {
            name: 'Web page',
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
        { name: 'Web page', type: TaskParamTypes.BROWSER_INSTANCE },
    ]
}
