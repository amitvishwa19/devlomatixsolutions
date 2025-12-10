import { CodeIcon, GlobeIcon, LucideProps } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const PageToHtmlTask = {
    type: TaskType.PAGE_TO_HTML,
    label: 'Get html from page',
    icon: (props) => (
        <CodeIcon className="stroke-rose-400" {...props} />
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
