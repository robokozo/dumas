import { describe, it, expect } from "vite-plus/test";
import { initRapier, createPhysicsWorld } from "./init";

describe("initRapier", () => {
  it("initialises and returns the RAPIER module", async () => {
    const rapier = await initRapier();
    expect(rapier).toBeDefined();
    expect(rapier.World).toBeDefined();
  });

  it("returns the same promise on repeated calls", async () => {
    const [a, b] = await Promise.all([initRapier(), initRapier()]);
    expect(a).toStrictEqual(b);
  });
});

describe("createPhysicsWorld", () => {
  it("creates a world with the given gravity", async () => {
    await initRapier();
    const world = createPhysicsWorld({ gravity: { x: 0, y: -9.81, z: 0 } });
    expect(world.gravity.y).toBeCloseTo(-9.81);
  });
});
