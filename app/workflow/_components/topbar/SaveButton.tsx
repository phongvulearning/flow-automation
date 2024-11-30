"use client";

import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Button } from "@/components/ui/button";
import { WorkflowStatus } from "@/types/workflow";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { CheckIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function SaveButton({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow();

  const saveMutation = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Workflow saved successfully", { id: "save-workflow" });
    },
    onError: () => {
      toast.error("Failed to save workflow", { id: "save-workflow" });
    },
  });

  return (
    <Button
      disabled={saveMutation.isPending}
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => {
        const workflowDefinition = JSON.stringify(toObject());
        saveMutation.mutate({ id: workflowId, definition: workflowDefinition });
      }}
    >
      <CheckIcon size={16} className="stroke-primary" />
      Save
    </Button>
  );
}

export default SaveButton;
