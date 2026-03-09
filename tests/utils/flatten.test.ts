import { describe, expect, it } from "bun:test";
import {
  type DllMap,
  flattenClientJson,
  flattenDllMap,
} from "../../src/utils/flatten.js";

describe("flattenDllMap", () => {
  it("flattens dll map to record", () => {
    const dllMap: DllMap = {
      "client.dll": { dwLocalPlayerPawn: 0x1_23, dwEntityList: 0x4_56 },
      "server.dll": { m_iHealth: 0x7_89 },
    };
    const flat = flattenDllMap(dllMap);
    expect(flat).toEqual({
      dwLocalPlayerPawn: 0x1_23,
      dwEntityList: 0x4_56,
      m_iHealth: 0x7_89,
    });
  });

  it("skips undefined dll entries", () => {
    const dllMap: DllMap = {
      "client.dll": { a: 1 },
      "missing.dll": undefined,
    };
    expect(flattenDllMap(dllMap)).toEqual({ a: 1 });
  });

  it("merges overlapping keys (later wins)", () => {
    const dllMap: DllMap = {
      dll1: { x: 1, y: 2 },
      dll2: { y: 3, z: 4 },
    };
    expect(flattenDllMap(dllMap)).toEqual({ x: 1, y: 3, z: 4 });
  });

  it("returns empty object for null/undefined", () => {
    expect(flattenDllMap(null)).toEqual({});
    expect(flattenDllMap(undefined)).toEqual({});
  });

  it("returns empty for empty map", () => {
    expect(flattenDllMap({})).toEqual({});
  });
});

describe("flattenClientJson", () => {
  it("extracts fields from client.dll.classes", () => {
    const raw = {
      "client.dll": {
        classes: {
          C_CSPlayerPawn: {
            fields: { m_iHealth: 0x1_00, m_lifeState: 0x1_04 },
          },
          C_BaseEntity: { fields: { m_pGameSceneNode: 0x2_00 } },
        },
      },
    };
    expect(flattenClientJson(raw)).toEqual({
      m_iHealth: 0x1_00,
      m_lifeState: 0x1_04,
      m_pGameSceneNode: 0x2_00,
    });
  });

  it("returns empty for non-object", () => {
    expect(flattenClientJson(null)).toEqual({});
    expect(flattenClientJson(undefined)).toEqual({});
    expect(flattenClientJson("string")).toEqual({});
    expect(flattenClientJson(42)).toEqual({});
  });

  it("returns empty when client.dll missing", () => {
    expect(flattenClientJson({})).toEqual({});
    expect(flattenClientJson({ other: 1 })).toEqual({});
  });

  it("returns empty when classes missing or invalid", () => {
    expect(flattenClientJson({ "client.dll": {} })).toEqual({});
    expect(flattenClientJson({ "client.dll": { classes: null } })).toEqual({});
    expect(flattenClientJson({ "client.dll": { classes: [] } })).toEqual({});
  });

  it("skips classes without fields", () => {
    const raw = {
      "client.dll": {
        classes: {
          HasFields: { fields: { x: 1 } },
          NoFields: {},
          NullFields: { fields: null },
        },
      },
    };
    expect(flattenClientJson(raw)).toEqual({ x: 1 });
  });
});
