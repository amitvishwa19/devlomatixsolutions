import { GlobeIcon } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../_utils/types";

export const LaunchBrowserTask = {
    type: TaskType.LAUNCH_BROWSER,
    label: 'Launch Browser',
    icon: (props) => (
        <GlobeIcon className="stroke-blue-500" {...props} />
    ),
    isEntryPoint: true,
    credits: 5,
    inputs: [{
        name: 'Website URL',
        type: TaskParamTypes.STRING,
        helperText: 'https://www.google.com',
        required: true,
        hideHandle: false
    }],
    outputs: [
        { name: 'Web Page', type: TaskParamTypes.BROWSER_INSTANCE },
    ]
}
