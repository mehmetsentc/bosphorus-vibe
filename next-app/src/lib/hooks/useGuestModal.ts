"use client";

import { useEffect, useState } from "react";

// Lightweight module-level signal — no extra state library needed.
let _listeners: Array<(open: boolean) => void> = [];

export function triggerGuestModal() {
  _listeners.forEach((fn) => fn(true));
}

export function useGuestModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    _listeners.push(setOpen);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== setOpen);
    };
  }, []);

  function close() {
    _listeners.forEach((fn) => fn(false));
  }

  return { open, close };
}
