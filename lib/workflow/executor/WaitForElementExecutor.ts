import { ExecutionEnviroment } from "@/types/executor";
import { WaitForElementTask } from "../task/WaitForElementTask";

export async function WaitForElementExecutor(
  environment: ExecutionEnviroment<typeof WaitForElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");

    if (!selector) {
      environment.log.error("input-->Selector  not defined");
    }

    const visibility = environment.getInput("Visibility");

    if (!visibility) {
      environment.log.error("input-->Visibility  not defined");
    }

    await environment.getPage()!.waitForSelector(selector, {
      visible: visibility === "visible",
      hidden: visibility === "hidden",
    });

    environment.log.info(`Waited for element ${selector} to be ${visibility}`);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
