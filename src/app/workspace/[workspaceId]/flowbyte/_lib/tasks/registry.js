import { LaunchBrowserTask } from "./LaunchBrowserTask";
import { PageToHtmlTask } from "./PageToHtmlTask";
import { ExtractTextFromElementTask } from "./ExtractTextFromElementTask";
import { ClickElementTask } from "./ClickElementTask";
import { FillInputTask } from "./FillInputTask";
import { ExtractDataWithAiTask } from "./ExtractDataWithAiTask";
import { DeliverViaWebhookTask } from "./DeliverViaWebhookTask";

export const TaskRegistry = {
    LAUNCH_BROWSER: LaunchBrowserTask,
    PAGE_TO_HTML: PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementTask,
    CLICK_ELEMENT: ClickElementTask,
    FILL_INPUT: FillInputTask,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAiTask,
    DELIVER_VIA_WEBHOOK: DeliverViaWebhookTask,
};
