/** Strip HTML tags and control chars from user text */
export function sanitizeText(input: string, maxLength = 5000): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeUsername(input: string): string {
  return sanitizeText(input, 64).replace(/[^\w\s.@\-]/g, "");
}
