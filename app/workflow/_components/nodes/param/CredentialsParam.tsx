"use client";

import { GetCredentialsForUser } from "@/actions/credentials/getCredentialsForUser";
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
import { useQuery } from "@tanstack/react-query";
import React, { useId } from "react";

export type OptionType = {
  label: string;
  value: string;
};

function CredentialsParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: ParamProps) {
  const id = useId();
  const query = useQuery({
    queryKey: ["credentials-for-user"],
    queryFn: () => GetCredentialsForUser(),
    refetchInterval: 10000, // 10 seconds
  });

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
            <SelectLabel>Credentials</SelectLabel>
            {query.data?.map((credential) => (
              <SelectItem value={credential.id} key={credential.id}>
                {credential.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default CredentialsParam;
