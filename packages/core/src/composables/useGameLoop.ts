import { useLoop } from "@tresjs/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import {
  physicsSyncSystem,
  renderSyncSystem,
  reactiveSyncSystem,
  collisionEventSystem,
} from "../ecs/systems";
import type { DumasContext } from "../types";

// Prevent spiral of death when the tab is backgrounded or a frame takes too long.
const MAX_ACCUMULATION = 0.25;

// Wires up the per-frame game loop inside TresJS's render loop.
// Uses a fixed-timestep accumulator so physics and user systems run
// at a deterministic rate regardless of display refresh rate.
// Must be called from within a <TresCanvas> child.
export function useGameLoop({ ctx }: { ctx: DumasContext }): void {
  const { onBeforeRender } = useLoop();

  let eventQueue: RAPIER.EventQueue | null = null;
  let accumulator = 0;
  let totalElapsed = 0;

  onBeforeRender(({ delta }) => {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;
    const fixedDt = ctx.fixedTimestep;

    accumulator += Math.min(delta, MAX_ACCUMULATION);

    // Fixed-rate loop: user systems + physics step at deterministic delta
    while (accumulator >= fixedDt) {
      totalElapsed += fixedDt;

      // 1. Poll input — must happen before user systems so wasJustPressed is current
      for (const poll of ctx.inputPollCallbacks) {
        poll();
      }

      // 2. Run user-registered ECS systems (kept sorted by registerSystem)
      for (const entry of ctx.systems) {
        entry.fn({ world: ctx.ecsWorld, delta: fixedDt, elapsed: totalElapsed });
      }

      // 2-3. Step physics and process collision events
      if (rapier !== null && physicsWorld !== null) {
        if (eventQueue === null) {
          eventQueue = new rapier.EventQueue(true);
        }

        physicsWorld.step(eventQueue);

        collisionEventSystem({
          eventQueue,
          physicsWorld,
          colliderEntityMap: ctx.colliderEntityMap,
          collisionHandlers: ctx.collisionHandlers,
        });

        physicsSyncSystem({
          ecsWorld: ctx.ecsWorld,
          entityBodyMap: ctx.entityBodyMap,
        });
      }

      accumulator -= fixedDt;
    }

    // Per-frame: sync ECS transforms → Three.js objects for smooth visuals
    renderSyncSystem({
      entityBodyMap: ctx.entityBodyMap,
      entityMeshMap: ctx.entityMeshMap,
    });

    // Per-frame: sync ECS transforms → Vue reactive refs (batched)
    reactiveSyncSystem({
      ecsWorld: ctx.ecsWorld,
      reactiveEntities: ctx.reactiveEntities,
    });
  });
}
