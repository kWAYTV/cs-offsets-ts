export type DllMap = Record<string, Record<string, number> | undefined>;

export function flattenDllMap(
  obj: DllMap | null | undefined
): Record<string, number> {
  const flat: Record<string, number> = {};
  for (const dll of Object.values(obj ?? {})) {
    if (dll && typeof dll === "object") {
      Object.assign(flat, dll);
    }
  }
  return flat;
}

interface ClassField {
  fields?: Record<string, number>;
}
type ClientClasses = Record<string, ClassField | undefined>;

function isClientDllShape(
  raw: unknown
): raw is { "client.dll": { classes?: ClientClasses } } {
  return Boolean(raw && typeof raw === "object" && "client.dll" in raw);
}

export function flattenClientJson(remoteData: unknown): Record<string, number> {
  if (!remoteData || typeof remoteData !== "object") {
    return {};
  }
  if (!isClientDllShape(remoteData)) {
    return {};
  }

  const client = remoteData["client.dll"];
  if (!client || typeof client !== "object") {
    return {};
  }
  if (!client.classes || typeof client.classes !== "object") {
    return {};
  }

  const flat: Record<string, number> = {};
  for (const cls of Object.values(client.classes)) {
    if (cls?.fields && typeof cls.fields === "object") {
      Object.assign(flat, cls.fields);
    }
  }
  return flat;
}
