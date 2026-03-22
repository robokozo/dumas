import { shallowRef } from "vue";
import { tryOnUnmounted, watchOnce } from "@vueuse/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import { useDumasContext } from "./useDumasContext";
import { createJoint } from "../physics/joints";
import type { JointOptions, JointReturn } from "../types";

export function useJoint(options: JointOptions): JointReturn {
  const ctx = useDumasContext();

  const joint = shallowRef<RAPIER.ImpulseJoint | null>(null);

  function initJoint(): void {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;

    if (rapier === null || physicsWorld === null) {
      return;
    }

    const j = createJoint({ physicsWorld, rapier, options });
    joint.value = j;
    ctx.jointMap.set(j.handle, j);
  }

  if (ctx.isReady.value === true) {
    initJoint();
  } else {
    watchOnce(ctx.isReady, () => {
      initJoint();
    });
  }

  tryOnUnmounted(() => {
    const physicsWorld = ctx.physicsWorld.value;
    if (joint.value !== null && physicsWorld !== null) {
      ctx.jointMap.delete(joint.value.handle);
      physicsWorld.removeImpulseJoint(joint.value, true);
    }
  });

  return { joint };
}
