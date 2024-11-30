import { ExecutionEnviroment } from "@/types/executor";
import { FillInputTask } from "../task/FillInputTask";
import { ScrollToElementTask } from "../task/ScrollToElementTask";

export async function ScrollToElementExecutor(
  environment: ExecutionEnviroment<typeof ScrollToElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");

    if (!selector) {
      environment.log.error("input-->Selector is not defined");
    }

    await environment.getPage()!.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element with selector ${selector} not found`);
      }
      const y = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y });
    }, selector);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
