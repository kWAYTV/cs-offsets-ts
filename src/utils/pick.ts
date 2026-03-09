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

  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in result) || result[k] == null) {
      result[k] = v;
    }
  }

  const missingKeys = requiredKeys.filter((k) => !(k in result));
  return { result, missingKeys };
}
