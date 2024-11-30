import { ExecutionEnviroment } from "@/types/executor";
import { NavigateUrlTask } from "../task/NavigateUrlTask";

export async function NavigateUrlExecutor(
  environment: ExecutionEnviroment<typeof NavigateUrlTask>
): Promise<boolean> {
  try {
    const url = environment.getInput("Url");

    if (!url) {
      environment.log.error("input-->Url is not defined");
    }

    await environment.getPage()!.goto(url);

    environment.log.info(`visited ${url}`);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
