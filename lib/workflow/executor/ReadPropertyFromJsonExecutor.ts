import { ExecutionEnviroment } from "@/types/executor";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJsonTask";

export async function ReadPropertyFromJsonExecutor(
  environment: ExecutionEnviroment<typeof ReadPropertyFromJsonTask>
): Promise<boolean> {
  try {
    const jsonData = environment.getInput("JSON");

    if (!jsonData) {
      environment.log.error("input-->JSON is not defined");
    }

    const propertyName = environment.getInput("Property name");
    if (!propertyName) {
      environment.log.error("input-->Property name is not defined");
    }

    const json = JSON.parse(jsonData);
    const propertyValue = json[propertyName];
    if (propertyValue === undefined) {
      environment.log.error(`Property ${propertyName} not found in JSON`);
      return false;
    }

    environment.setOutput("Property value", propertyValue);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}