export function applyDefaults(
  resultObj: Record<string, number>,
  defaults: Record<string, number>
): void {
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in resultObj) || resultObj[k] == null) {
      resultObj[k] = v;
    }
  }
}

export function pickRequiredKeys(
  merged: Record<string, number>,
  requiredKeys: readonly string[],
  defaults: Record<string, number>
): { result: Record<string, number>; missingKeys: string[] } {
  const result: Record<string, number> = {};
  for (const key of requiredKeys) {
    if (key in merged) {
      result[key] = merged[key];
    }
  }

  applyDefaults(result, defaults);

  const missingKeys = requiredKeys.filter((k) => !(k in result));
  return { result, missingKeys };
}
