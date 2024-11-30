import { Browser, Page } from "puppeteer";
import { WorkflowTask } from "./workflow";
import { LogCollector } from "./log";

export type Enviroment = {
  page?: Page;
  browser?: Browser;
  //Phases with nodeId as key
  phases: Record<
    string, // nodeId
    { inputs: Record<string, string>; outputs: Record<string, string> }
  >;
};

export type ExecutionEnviroment<T extends WorkflowTask> = {
  getInput(name: T["inputs"][number]["name"]): string;
  setOutput(name: T["outputs"][number]["name"], value: string): void;

  getBrowser(): Browser | undefined;
  setBrowser(browser: Browser): void;

  getPage(): Page | undefined;
  setPage(page: Page): void;

  log: LogCollector;
};
