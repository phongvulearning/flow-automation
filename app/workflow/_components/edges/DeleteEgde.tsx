"use client";

import { Button } from "@/components/ui/button";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSimpleBezierPath,
  useReactFlow,
} from "@xyflow/react";

export default function DeleteEdge(props: EdgeProps) {
  const [edgePath, labelX, labelY] = getSimpleBezierPath(props);

  const { setEdges } = useReactFlow();

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={props.markerEnd}
        style={props.style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <Button
            className="size-5 border rounded-full text-xs leading-none hover:shadow-lg"
            variant="outline"
            onClick={() => {
              setEdges((edges) => edges.filter((edge) => edge.id !== props.id));
            }}
          >
            X
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
