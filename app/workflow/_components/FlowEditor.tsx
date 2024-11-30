"use client";

import React, { useCallback, useEffect } from "react";
import { Workflow } from "@prisma/client";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  FitViewOptions,
  getOutgoers,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/NodeComponent";
import { NodeType } from "@/types/node";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/types/task";
import { AppNode } from "@/types/appNode";
import DeleteEdge from "./edges/DeleteEgde";
import { TaskRegistry } from "@/lib/workflow/task/registry";

const nodeTypes = {
  [NodeType.NODE]: NodeComponent,
};

const edgeTypes = {
  default: DeleteEdge,
};

const snapGrid: [number, number] = [50, 50];

const fitViewOptions: FitViewOptions = {
  padding: 1,
};

function FlowEditor({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition);
      if (!flow) return;
      const { edges = [], nodes = [], viewport } = flow;
      setEdges(edges);
      setNodes(nodes);

      if (!viewport) return;

      const { x = 0, y = 0, zoom = 1.5 } = viewport;

      setViewport({ x, y, zoom });
    } catch (error) {}
  }, [setEdges, setNodes, setViewport, workflow.definition]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const taskType = e.dataTransfer.getData("application/reactflow");

      if (typeof taskType === "undefined" || !taskType) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newNode = CreateFlowNode(taskType as TaskType, position);

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));

      if (!connection.targetHandle) return;

      const node = nodes.find((node) => node.id === connection.target);
      if (!node) return;
      const nodeInputs = node.data?.inputs;
      if (!nodeInputs) return;

      delete nodeInputs[connection.targetHandle];
      updateNodeData(node.id, {
        inputs: nodeInputs,
      });
    },
    [nodes, setEdges, updateNodeData]
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;

      if (connection.source === connection.target) return false;

      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);

      if (!source || !target) {
        console.log("Invalid connection: source or target not found");
        return false;
      }

      const sourceTask = TaskRegistry[source.data?.type];
      const targetTask = TaskRegistry[target.data?.type];

      if (!sourceTask || !targetTask) {
        console.log("Invalid connection: task not found");
        return false;
      }

      const output = sourceTask.outputs.find(
        (output) => output.name === connection.sourceHandle
      );

      if (!output) {
        console.log("Invalid connection: output not found");
        return false;
      }

      const input = targetTask.inputs.find(
        (input) => input.name === connection.targetHandle
      );

      if (!input) {
        console.log("Invalid connection: input not found");
        return false;
      }

      if (input.type !== output.type) {
        console.log("Invalid connection: type mismatch");
        return false;
      }

      const hasCycle = (node: AppNode, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;

      const deletedCycle = hasCycle(target);
      return !deletedCycle;
    },
    [edges, nodes]
  );

  return (
    <main className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
        }}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={snapGrid}
        fitView
        fitViewOptions={fitViewOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
      >
        <Controls position="top-left" />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}

export default FlowEditor;
