import { FileJson2Icon, MousePointerClick, MousePointerClickIcon, TextIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const ReadProperyFromJSONTask = {
    type: TaskType.READ_PROPERTY_FROM_JSON,
    label: 'Read property from JSON',
    icon: (props) => (
        <FileJson2Icon className="stroke-sky-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 1,
    inputs: [
        {
            name: 'JSON',
            type: TaskParamTypes.STRING,
            required: true,
        },
        {
            name: 'Property name',
            type: TaskParamTypes.STRING,
            required: true,
        }
    ],
    outputs: [
        {
            name: 'Property value',
            type: TaskParamTypes.STRING
        },
    ]
}
