import { waitFor } from "@/lib/helpers/waitFor";
import { ExecutionEnviroment } from "@/types/executor";
import { PageToHtmlTask } from "../task/PageToHtmlTask";

export async function PageToHtmlExecutor(
  environment: ExecutionEnviroment<typeof PageToHtmlTask>
): Promise<boolean> {
  try {
    const html = await environment.getPage()!?.content();

    environment.setOutput("Html", html);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
