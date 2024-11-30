"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParamProps } from "@/types/appNode";
import React, { useEffect, useId, useState } from "react";

function StringParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: ParamProps) {
  const [internalValue, setInternalValue] = useState(value);
  const id = useId();

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  let Component: any = Input;

  if (param.variant === "textarea") {
    Component = Textarea;
  }

  return (
    <div className="space-y-1 w-full p-1">
      <Label htmlFor={id} className="text-xs flex">
        {param.name}
        {param.required && <p className="text-rose-400 px-1">*</p>}
      </Label>
      <Component
        disabled={disabled}
        value={internalValue}
        className="text-xs"
        placeholder="Enter value here"
        onChange={(e: any) => setInternalValue(e.target.value)}
        onBlur={(e: any) => updateNodeParamValue(e.target.value)}
        id={id}
      />
      {param.helperText && (
        <p className="text-muted-foreground px-2">{param.helperText}</p>
      )}
    </div>
  );
}

export default StringParam;
