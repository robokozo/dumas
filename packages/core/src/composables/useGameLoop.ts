import { useLoop } from "@tresjs/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import {
  physicsSyncSystem,
  renderSyncSystem,
  reactiveSyncSystem,
  collisionEventSystem,
} from "../ecs/systems";
import { stepPhysics } from "../physics/sync";
import type { DumasContext } from "../types";

// Wires up the per-frame game loop inside TresJS's render loop.
// Must be called from within a <TresCanvas> child.
export function useGameLoop({ ctx }: { ctx: DumasContext }): void {
  const { onBeforeRender } = useLoop();

  let eventQueue: RAPIER.EventQueue | null = null;

  onBeforeRender(({ delta, elapsed }) => {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;

    // 1. Run user-registered ECS systems (sorted by priority)
    const sortedSystems = [...ctx.systems].sort((a, b) => a.priority - b.priority);

    for (const entry of sortedSystems) {
      entry.fn({ world: ctx.ecsWorld, delta, elapsed });
    }

    // 2-3. Step physics and sync to ECS (only when Rapier is ready)
    if (rapier !== null && physicsWorld !== null) {
      if (eventQueue === null) {
        eventQueue = new rapier.EventQueue(true);
      }

      stepPhysics({ physicsWorld, eventQueue });

      collisionEventSystem({
        eventQueue,
        colliderEntityMap: ctx.colliderEntityMap,
        collisionHandlers: ctx.collisionHandlers,
      });

      physicsSyncSystem({
        ecsWorld: ctx.ecsWorld,
        entityBodyMap: ctx.entityBodyMap,
      });
    }

    // 4. Sync ECS transforms → Three.js objects
    renderSyncSystem({
      ecsWorld: ctx.ecsWorld,
      entityMeshMap: ctx.entityMeshMap,
    });

    // 5. Sync ECS transforms → Vue reactive refs (batched)
    reactiveSyncSystem({
      ecsWorld: ctx.ecsWorld,
      reactiveEntities: ctx.reactiveEntities,
    });
  });
}
