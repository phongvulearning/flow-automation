"use client";

import { Input } from "@/components/ui/input";
import { TaskParam, TaskParamType } from "@/types/task";
import React, { useCallback } from "react";
import StringParam from "./param/StringParam";
import { Node, useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import BrowserInstanceParam from "./param/BrowserInstanceParam";
import SelectParam from "./param/SelectParam";
import CredentialsParam from "./param/CredentialsParam";

function NodeParamField({
  param,
  nodeId,
  disabled,
}: {
  param: TaskParam;
  nodeId: string;
  disabled: boolean;
}) {
  const { updateNodeData, getNode } = useReactFlow();
  const node = getNode(nodeId) as AppNode;

  const value = node?.data?.inputs?.[param.name] ?? "";

  const updateNodeParamValue = useCallback(
    (newValue: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...(node?.data?.inputs || {}),
          [param.name]: newValue,
        },
      });
    },
    [updateNodeData, param.name, node?.data?.inputs, nodeId]
  );

  switch (param.type) {
    case TaskParamType.STRING:
      return (
        <StringParam
          param={param}
          value={value}
          disabled={disabled}
          updateNodeParamValue={updateNodeParamValue}
        />
      );
    case TaskParamType.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
        />
      );
    case TaskParamType.SELECT:
      return (
        <SelectParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
        />
      );
    case TaskParamType.CREDENTIALS:
      return (
        <CredentialsParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
        />
      );
    default:
      return (
        <div className="h-full">
          <p className="text-xs text-muted-foreground">Not implemented!</p>
        </div>
      );
  }
}

export default NodeParamField;