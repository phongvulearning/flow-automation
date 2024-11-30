import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import React from "react";
import NodeParamField from "./NodeParamField";
import { ColorForHandle } from "./common";
import useFlowValidation from "@/components/hooks/useFlowValidation";

export function NodeInputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
}: {
  input: TaskParam;
  nodeId: string;
}) {
  const edges = useEdges();
  const { invalidInputs } = useFlowValidation();

  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name
  );

  const hasError = invalidInputs
    .find((invalidInput) => invalidInput.nodeId === nodeId)
    ?.inputs.find((invalidName) => invalidName === input.name);

  return (
    <div
      className={cn(
        "flex justify-start relative p-3 bg-secondary w-full",
        hasError && "bg-destructive border-2"
      )}
    >
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />
      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !-left-2 !size-4",
            ColorForHandle[input.type]
          )}
        />
      )}
    </div>
  );
}
