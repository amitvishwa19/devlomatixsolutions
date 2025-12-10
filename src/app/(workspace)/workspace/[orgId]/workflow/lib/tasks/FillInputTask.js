import { CodeIcon, Edit3Icon, GlobeIcon, LucideProps } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const FillInputTask = {
    type: TaskType.FILL_INPUT,
    label: 'Fill input',
    icon: (props) => (
        <Edit3Icon className="stroke-orange-400" {...props} />
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
        },
        {
            name: 'Value',
            type: TaskParamTypes.STRING,
            required: true,
        }
    ],
    outputs: [
        { name: 'Web Page', type: TaskParamTypes.BROWSER_INSTANCE }
    ]
}
