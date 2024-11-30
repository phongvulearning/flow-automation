import Logo from "@/components/Logo";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full justify-center items-center gap-4">
      <Logo />
      {children}
    </div>
  );
}

export default AuthLayout;
