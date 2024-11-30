"use client";

import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NextTopLoader from "nextjs-toploader";

export function AppProviders({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NextTopLoader color="#E11D48" showSpinner={false} />
      <ThemeProvider {...props}>{children}</ThemeProvider>;
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
