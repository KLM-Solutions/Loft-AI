"use client";
import { useEffect } from "react";
import { initAll } from "@amplitude/unified";

export default function AmplitudeProvider() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
      initAll(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
    }
  }, []);
  return null;
} 