import { NextResponse } from "next/server";

export function apiError(
  status: number,
  code: string,
  publicMessage = "Something went wrong. Please try again.",
) {
  return NextResponse.json({ error: code, message: publicMessage }, { status });
}

export function apiOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export const GENERIC_ERROR = "Something went wrong. Please try again later.";
