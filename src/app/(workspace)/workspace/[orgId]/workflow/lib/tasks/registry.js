import { ClickElementTask } from "./ClickElementTask";
import { DeliverViaWebhookTask } from "./DeliverViaWebhookTask";
import { ExtractDataWithAiTask } from "./ExtractDataWithAiTask";
import { ExtractTextFromElementTask } from "./ExtractTextFromElementTask";
import { FillInputTask } from "./FillInputTask";
import { LaunchBrowserTask } from "./LaunchBrowserTask";
import { PageToHtmlTask } from "./PageToHtmlTask";
import { ReadProperyFromJSONTask } from "./ReadProperyFromJSONTask";
import { WaitForElementTask } from "./WaitForElementTask";


export const TaskRegistry = {
    LAUNCH_BROWSER: LaunchBrowserTask,
    PAGE_TO_HTML: PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementTask,
    FILL_INPUT: FillInputTask,
    CLICK_ELEMENT: ClickElementTask,
    WAIT_FOR_ELEMENT: WaitForElementTask,
    DELIVER_VIA_WEBHOOK: DeliverViaWebhookTask,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAiTask,
    READ_PROPERTY_FROM_JSON: ReadProperyFromJSONTask

}