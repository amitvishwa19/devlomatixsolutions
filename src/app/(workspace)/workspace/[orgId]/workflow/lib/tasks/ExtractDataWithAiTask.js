import { BrainIcon, MousePointerClick, MousePointerClickIcon, TextIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const ExtractDataWithAiTask = {
    type: TaskType.EXTRACT_DATA_WITH_AI,
    label: 'Extract data with AI',
    icon: (props) => (
        <BrainIcon className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 4,
    inputs: [
        {
            name: 'Content',
            type: TaskParamTypes.STRING,
            required: true,
        },
        {
            name: 'Credentials',
            type: TaskParamTypes.CREDENTIAL,
            required: true,
        },
        {
            name: 'Prompt',
            type: TaskParamTypes.STRING,
            required: true,
            variant: 'textarea'
        }
    ],
    outputs: [
        {
            name: 'Extracted data',
            type: TaskParamTypes.STRING
        },
    ]
}
