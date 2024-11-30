import { ExecutionEnviroment } from "@/types/executor";
import { waitFor } from "@/lib/helpers/waitFor";
import { ClickElementTask } from "../task/ClickElementTask";

export async function ClickElementExecutor(
  environment: ExecutionEnviroment<typeof ClickElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");

    if (!selector) {
      environment.log.error("input-->Selector is not defined");
    }

    await environment.getPage()!.click(selector);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
