"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        // console.debug("SW registered", reg.scope);
      } catch (err) {
        // console.error("SW registration failed", err);
      }
    };

    register();

    return () => {
      // Optional: cleanup logic if needed
    };
  }, []);

  return null;
}
