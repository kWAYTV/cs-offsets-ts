export type DllMap = Record<string, Record<string, number> | undefined>;

const CLIENT_DLL = "client.dll" as const;

type ClientClasses = Record<
  string,
  { fields?: Record<string, number> } | undefined
>;

function isClientDllShape(
  raw: unknown
): raw is { [CLIENT_DLL]: { classes?: ClientClasses } } {
  return Boolean(raw && typeof raw === "object" && CLIENT_DLL in raw);
}

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

export function flattenClientJson(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || !isClientDllShape(raw)) {
    return {};
  }

  const client = raw[CLIENT_DLL];
  if (!client?.classes || typeof client.classes !== "object") {
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
