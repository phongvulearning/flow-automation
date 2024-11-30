import { LaunchBrowserTask } from "./LaunchBrowserTask";
import { PageToHtmlTask } from "./PageToHtmlTask";
import { ExtractTextFromElementTask } from "./ExtractTextFromElementTask";
import { TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { FillInputTask } from "./FillInputTask";
import { ClickElementTask } from "./ClickElementTask";
import { WaitForElementTask } from "./WaitForElementTask";
import { DeliverViaWebhookTask } from "./DeliverViaWebhookTask";
import { ExtractDataWithAITask } from "./ExtractDataWithAITask";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJsonTask";
import { AddPropertyToJsonTask } from "./AddPropertyToJsonTask";
import { NavigateUrlTask } from "./NavigateUrlTask";
import { ScrollToElementTask } from "./ScrollToElementTask";

type Registry = { [K in TaskType]: WorkflowTask & { type: K } };

export const TaskRegistry: Registry = {
  FILL_INPUT: FillInputTask,
  PAGE_TO_HTML: PageToHtmlTask,
  CLICK_ELEMENT: ClickElementTask,
  LAUNCH_BROWSER: LaunchBrowserTask,
  WAIT_FOR_ELEMENT: WaitForElementTask,
  DELIVER_VIA_WEBHOOK: DeliverViaWebhookTask,
  EXTRACT_DATA_WITH_AI: ExtractDataWithAITask,
  ADD_PROPERTY_TO_JSON: AddPropertyToJsonTask,
  READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonTask,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementTask,
  NAVIGATE_URL: NavigateUrlTask,
  SCROLL_TO_ELEMENT: ScrollToElementTask,
};
