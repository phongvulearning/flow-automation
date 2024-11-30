import { ExecutionEnviroment } from "@/types/executor";
import { FillInputTask } from "../task/FillInputTask";
import { waitFor } from "@/lib/helpers/waitFor";

export async function FillInputExecutor(
  environment: ExecutionEnviroment<typeof FillInputTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");

    if (!selector) {
      environment.log.error("input-->Selector is not defined");
    }

    await environment.getPage()!.type(selector, environment.getInput("Value")!);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
