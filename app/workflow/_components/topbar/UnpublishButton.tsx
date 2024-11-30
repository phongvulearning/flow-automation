"use client";

import React from "react";
import { toast } from "sonner";
import { UnpublishWorkflow } from "@/actions/workflows/unpublishWorkflow";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { DownloadIcon } from "lucide-react";
import useExecutionPlan from "@/components/hooks/useExecutionPlan";

function UnpublishButton({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationFn: UnpublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow unpublished", {
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

        toast.loading("Unpublishing workflow...", { id: workflowId });
        mutation.mutate({
          id: workflowId,
        });
      }}
      disabled={mutation.isPending}
    >
      <DownloadIcon size={16} className="stroke-primary" />
      Unpublish
    </Button>
  );
}

export default UnpublishButton;
