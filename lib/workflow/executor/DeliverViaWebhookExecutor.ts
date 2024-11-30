import { ExecutionEnviroment } from "@/types/executor";
import { DeliverViaWebhookTask } from "../task/DeliverViaWebhookTask";

export async function DeliverViaWebhookExecutor(
  environment: ExecutionEnviroment<typeof DeliverViaWebhookTask>
): Promise<boolean> {
  try {
    const targetUrl = environment.getInput("Target URL");

    if (!targetUrl) {
      environment.log.error("input-->targetUrl  not defined");
    }

    const body = environment.getInput("Body");

    if (!body) {
      environment.log.error("input-->body  not defined");
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });

    const statusCode = res.status;

    if (statusCode !== 200) {
      environment.log.error(
        `Failed to deliver via webhook, status code: ${statusCode}`
      );
      return false;
    }

    const responseBody = await res.json();

    environment.log.info(
      `Delivered via webhook, status code: ${statusCode}, response body: ${JSON.stringify(
        responseBody,
        null,
        4
      )}`
    );

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
