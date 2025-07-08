/** replaces curly quotes with straight quotes */
export function quoteNormalized(value: string) {
  return value.replace(/[“”]/g, '"').replace(/[’’]/g, "'");
}

export function serialize(value: any) {
  return JSON.stringify(value, null, 2);
}
