import { CodeIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../_utils/types";

export const PageToHtmlTask = {
    type: TaskType.PAGE_TO_HTML,
    label: 'Get HTML from page',
    icon: (props) => (
        <CodeIcon className="stroke-rose-500" {...props} />
    ),
    isEntryPoint: false,
    credits: 4,
    inputs: [{
        name: 'Web Page',
        type: TaskParamTypes.BROWSER_INSTANCE,
        required: true,
    }],
    outputs: [
        { name: 'Html', type: TaskParamTypes.STRING },
        { name: 'Web Page', type: TaskParamTypes.BROWSER_INSTANCE }
    ]
}
