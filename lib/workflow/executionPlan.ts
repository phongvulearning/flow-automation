import { Edge } from "@xyflow/react";
import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import {
  WorkflowExecutionPlan,
  WorkflowExecutionPlanPhase,
} from "@/types/workflow";
import { TaskRegistry } from "./task/registry";

export enum FlowExecutionPlanValidationError {
  INVALID_INPUTS = "INVALID_INPUTS",
  NO_ENTRY_POINT = "NO_ENTRY_POINT",
}

type FlowExecutionPlan = {
  executionPlan?: WorkflowExecutionPlan;
  error?: {
    type: FlowExecutionPlanValidationError;
    invalidElements?: AppNodeMissingInputs[];
  };
};

export function FlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[]
): FlowExecutionPlan {
  const entryPoint = nodes.find(
    (node) => TaskRegistry[node.data.type].isEntryPoint
  );

  if (!entryPoint) {
    return {
      error: {
        type: FlowExecutionPlanValidationError.NO_ENTRY_POINT,
      },
    };
  }
  const invalidWithErrors: AppNodeMissingInputs[] = [];
  const planned = new Set<string>();
  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];

  planned.add(entryPoint.id);

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);

  if (invalidInputs.length > 0) {
    invalidWithErrors.push({
      nodeId: entryPoint.id,
      inputs: invalidInputs,
    });
  }

  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkflowExecutionPlanPhase = {
      phase,
      nodes: [],
    };

    for (let currentNode of nodes) {
      if (planned.has(currentNode.id)) {
        //Node already put in the execution plan
        continue;
      }

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);

      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          invalidWithErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputs,
          });
        } else {
          continue;
        }
      }

      nextPhase.nodes.push(currentNode);
      planned.add(currentNode.id);
    }
    executionPlan.push(nextPhase);
  }

  if (invalidWithErrors.length > 0) {
    return {
      error: {
        type: FlowExecutionPlanValidationError.INVALID_INPUTS,
        invalidElements: invalidWithErrors,
      },
    };
  }

  return { executionPlan };
}

function getInvalidInputs(
  node: AppNode,
  edges: Edge[],
  planned: Set<string>
): string[] {
  const invalidInputs: string[] = [];
  const inputs = TaskRegistry[node.data.type].inputs;

  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;

    if (inputValueProvided) {
      // this input is fine , so we can move on to the next one
      continue;
    }

    //If a value is not provided by the user then we need to check
    // If there is an output linked to current input
    const incomingEdges = edges.filter((edge) => edge.target === node.id);

    const inputLinkedByOutput = incomingEdges.find(
      (edge) => edge.targetHandle === input.name
    );

    const requiredInputProvidedByVisitedOutput =
      input.required &&
      inputLinkedByOutput &&
      planned.has(inputLinkedByOutput.source);

    if (requiredInputProvidedByVisitedOutput) {
      continue;
    } else if (!input.required) {
      if (!inputLinkedByOutput) continue;
      if (inputLinkedByOutput && planned.has(inputLinkedByOutput.source)) {
        continue;
      }
    }
    invalidInputs.push(input.name);
  }

  return invalidInputs;
}

function getIncomers(node: AppNode, nodes: AppNode[], edges: Edge[]) {
  if (!node.id) {
    return [];
  }

  const incomertIds = new Set<string>();

  edges.forEach((edge) => {
    if (edge.target === node.id) {
      incomertIds.add(edge.source);
    }
  });

  return nodes.filter((node) => incomertIds.has(node.id));
}
