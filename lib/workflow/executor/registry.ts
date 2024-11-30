import { TaskType } from "@/types/task";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExcutor";
import { ExecutionEnviroment } from "@/types/executor";
import { WorkflowTask } from "@/types/workflow";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { ExtractDataWithAIExecutor } from "./ExtractDataWithAIExecutor";
import { ReadPropertyFromJsonExecutor } from "./ReadPropertyFromJsonExecutor";
import { AddPropertyToJsonExecutor } from "./AddPropertyToJsonExecutor";
import { NavigateUrlExecutor } from "./NavigateUrlExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";

type ExecutorFn<T extends WorkflowTask> = (
  environment: ExecutionEnviroment<T>
) => Promise<boolean>;

type Registry = { [K in TaskType]: ExecutorFn<WorkflowTask & { type: K }> };

export const ExecutorRegistry: Registry = {
  FILL_INPUT: FillInputExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
  CLICK_ELEMENT: ClickElementExecutor,
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  WAIT_FOR_ELEMENT: WaitForElementExecutor,
  DELIVER_VIA_WEBHOOK: DeliverViaWebhookExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
  EXTRACT_DATA_WITH_AI: ExtractDataWithAIExecutor,
  READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor,
  ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor,
  NAVIGATE_URL: NavigateUrlExecutor,
  SCROLL_TO_ELEMENT: ScrollToElementExecutor,
};
