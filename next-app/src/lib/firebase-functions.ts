"use client";

import { getFunctions, type Functions } from "firebase/functions";
import { getFirebaseAuth } from "@/lib/firebase";

let functionsInstance: Functions | undefined;

export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(getFirebaseAuth().app, "europe-central2");
  }
  return functionsInstance;
}
