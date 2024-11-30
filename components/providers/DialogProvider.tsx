"use client";

import { useEffect, useState } from "react";

export const DialogProvider = () => {
  const [mouted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mouted) {
    return null;
  }

  return <></>;
};
