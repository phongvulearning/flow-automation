import { ExecutionEnviroment } from "@/types/executor";
import { ExtractTextFromElementTask } from "../task/ExtractTextFromElementTask";
import * as cherrio from "cheerio";

export async function ExtractTextFromElementExecutor(
  environment: ExecutionEnviroment<typeof ExtractTextFromElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");

    if (!selector) {
      environment.log.error("selector is not provided");
      console.log("Selector is empty");
      return false;
    }

    const html = environment.getInput("Html");

    if (!html) {
      environment.log.error("Html is not provided");
      console.log("Html is empty");
      return false;
    }

    const $ = cherrio.load(html);

    const element = $(selector)!;

    if (!element) {
      environment.log.error("Element not found");
      console.error("Element not found");
      return false;
    }

    const extractedText = $.text(element);

    if (!extractedText) {
      environment.log.error("Extracted text has no text");
      console.error("Extracted text is empty");
      return false;
    }

    environment.setOutput("Extracted text", extractedText);

    return true;
  } catch (error: any) {
    console.log(error);
    environment.log.error(error.message);
    return false;
  }
}
