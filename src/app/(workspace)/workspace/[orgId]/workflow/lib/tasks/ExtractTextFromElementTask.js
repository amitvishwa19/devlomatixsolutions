import { CodeIcon, GlobeIcon, LucideProps, TextIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const ExtractTextFromElementTask = {
    type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
    label: 'Extract text from element',
    icon: (props) => (
        <TextIcon className="stroke-rose-400" {...props} />
    ),
    isEntryPoint: false,
    credits: 2,
    inputs: [
        {
            name: 'Html',
            type: TaskParamTypes.STRING,
            required: true,
            variant: 'textarea'
        },
        {
            name: 'Selector',
            type: TaskParamTypes.STRING,
            required: true,
        }
    ],
    outputs: [
        { name: 'Extracted text', type: TaskParamTypes.STRING },
    ]
}
