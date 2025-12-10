import { GlobeIcon, LucideProps } from "lucide-react";
import { TaskParamTypes, TaskType } from "../../types/types";

export const LaunchBrowserTask = {
    type: TaskType.LAUNCH_BROWSER,
    label: 'Launch Browser',
    icon: (props) => (
        <GlobeIcon className="stroke-pink-400" {...props} />
    ),
    isEntryPoint: true,
    credits: 5,
    inputs: [{
        name: 'Website URL',
        type: TaskParamTypes.STRING,
        helperText: 'https://www.devlomatix.online',
        required: true,
        hideHandle: false
    }],
    outputs: [
        { name: 'Web Page', type: TaskParamTypes.BROWSER_INSTANCE },
    ]
}
