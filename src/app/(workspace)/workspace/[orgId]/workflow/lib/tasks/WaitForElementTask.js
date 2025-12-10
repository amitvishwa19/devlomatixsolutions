import { EyeIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const WaitForElementTask = {
    type: TaskType.WAIT_FOR_ELEMENT,
    label: 'Wait for element',
    icon: (props) => (
        <EyeIcon className="stroke-amber-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
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
        },
        {
            name: 'Visibility',
            type: TaskParamTypes.SELECT,
            hideHandle: true,
            required: true,
            options: [
                { lable: 'Visible', value: 'visible' },
                { lable: 'Hidden', value: 'hidden' }
            ]
        }
    ],
    outputs: [
        { name: 'Web page', type: TaskParamTypes.BROWSER_INSTANCE },
    ]
}
