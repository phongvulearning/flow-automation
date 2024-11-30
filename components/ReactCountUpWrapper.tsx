"use client";

import React from "react";

import CountUp from "react-countup";

function ReactCountUpWrapper({ value }: { value: number }) {
  const [mouted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mouted) {
    return "-";
  }

  return <CountUp duration={0.5} preserveValue end={value} decimals={0} />;
}

export default ReactCountUpWrapper;
