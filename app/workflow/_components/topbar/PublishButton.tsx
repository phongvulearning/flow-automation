"use client";

import { PublishWorkflow } from "@/actions/workflows/publishWorkflow";
import { RunWorkflow } from "@/actions/workflows/runWorkflow";
import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon, UploadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function PublishButton({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationFn: PublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow published", {
        id: workflowId,
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: workflowId,
      });
    },
  });

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => {
        const plan = generate();

        if (!plan) {
          return;
        }

        toast.loading("publishing workflow...", { id: workflowId });
        mutation.mutate({
          id: workflowId,
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
      disabled={mutation.isPending}
    >
      <UploadIcon size={16} className="stroke-primary" />
      Publish
    </Button>
  );
}

export default PublishButton;
