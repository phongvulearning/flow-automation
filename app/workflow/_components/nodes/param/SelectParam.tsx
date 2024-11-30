"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParamProps } from "@/types/appNode";
import React, { useEffect, useId, useState } from "react";

export type OptionType = {
  label: string;
  value: string;
};

function SelectParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: ParamProps) {
  const id = useId();

  return (
    <div className="flex flex-col w-full gap-1">
      <Label htmlFor={id} className="text-xs flex">
        {param.name}
        {param.required && <p className="text-rose-400 px-2">*</p>}
      </Label>
      <Select
        defaultValue={value}
        onValueChange={(value) => updateNodeParamValue(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Options</SelectLabel>
            {param.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectParam;
