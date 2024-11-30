import { AppNodeMissingInputs } from "@/types/appNode";
import { createContext, useState } from "react";

type FlowValidationContextType = {
  invalidInputs: AppNodeMissingInputs[];
  setInvalidInputs: (invalidInputs: AppNodeMissingInputs[]) => void;
  clearErrors: () => void;
};

export const FlowValidationContext =
  createContext<FlowValidationContextType | null>(null!);

export const FlowValidationProvider = FlowValidationContext.Provider;

export function FlowValidationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInputs[]>(
    []
  );

  const clearErrors = () => {
    setInvalidInputs([]);
  };

  return (
    <FlowValidationProvider
      value={{
        invalidInputs,
        setInvalidInputs,
        clearErrors,
      }}
    >
      {children}
    </FlowValidationProvider>
  );
}
