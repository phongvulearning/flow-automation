import { AppNode } from "@/types/appNode";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useFlowValidation from "./useFlowValidation";
import { toast } from "sonner";
import {
  FlowExecutionPlanValidationError,
  FlowToExecutionPlan,
} from "@/lib/workflow/executionPlan";

const useExecutionPlan = () => {
  const { toObject } = useReactFlow();
  const { setInvalidInputs, clearErrors } = useFlowValidation();

  const handleError = useCallback(
    (error: any) => {
      switch (error.type) {
        case FlowExecutionPlanValidationError.INVALID_INPUTS:
          toast.error("Not all inputs are provided");
          setInvalidInputs(error.invalidElements);
          break;

        case FlowExecutionPlanValidationError.NO_ENTRY_POINT:
          toast.error("No entry point found");
          break;
        default:
          toast.error("Unknown error");
          break;
      }
    },
    [setInvalidInputs]
  );

  const generateExecutionPlan = useCallback(() => {
    const { nodes, edges } = toObject();

    const { executionPlan, error } = FlowToExecutionPlan(
      nodes as AppNode[],
      edges
    );

    if (error) {
      handleError(error);
      return null;
    }

    clearErrors();

    return executionPlan;
  }, [clearErrors, handleError, toObject]);

  return generateExecutionPlan;
};

export default useExecutionPlan;
