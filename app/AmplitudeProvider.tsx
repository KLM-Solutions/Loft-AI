"use client";
import { useEffect } from "react";
import { initAll } from "@amplitude/unified";
import { useUser } from "@clerk/nextjs";

// Add type declaration for window.amplitude
declare global {
  interface Window {
    amplitude: {
      setUserId: (userId: string) => void;
    };
  }
}

export default function AmplitudeProvider() {
  const { user } = useUser();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
      initAll(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
      
      // Set user identification when user is available
      if (user) {
        const firstName = user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'anonymous';
        window.amplitude.setUserId(firstName);
      }
    }
  }, [user]);

  return null;
} 