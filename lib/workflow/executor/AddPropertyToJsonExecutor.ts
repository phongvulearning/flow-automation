import { ExecutionEnviroment } from "@/types/executor";
import { AddPropertyToJsonTask } from "../task/AddPropertyToJsonTask";

export async function AddPropertyToJsonExecutor(
  environment: ExecutionEnviroment<typeof AddPropertyToJsonTask>
): Promise<boolean> {
  try {
    const jsonData = environment.getInput("JSON");
    if (!jsonData) {
      environment.log.error("Input --> No JSON data provided");
    }

    const propertyValue = environment.getInput("Property value");
    if (!propertyValue) {
      environment.log.error("Input --> No property value provided");
    }

    const propertyName = environment.getInput("Property name");
    if (!propertyName) {
      environment.log.error("Input --> No property name provided");
    }

    const json = JSON.parse(jsonData);
    json[propertyName] = propertyValue;

    environment.setOutput("Update JSON", JSON.stringify(json));
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
