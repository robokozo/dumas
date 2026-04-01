<script setup lang="ts">
import { shallowRef } from "vue";
import { DumasEntity, useEcsComponent, createTriggerZone } from "@dumas/core";
import { ProjectileTag, PlayerTag } from "./tags";
import {
  PROJECTILE_SPEED,
  PROJECTILE_RADIUS,
  PROJECTILE_LIFETIME,
  PROJECTILE_COLOR,
  PROJECTILE_TRIGGER_RADIUS,
  ARENA_HALF_SIZE,
} from "./constants";
import type { ProjectileSpawn } from "./types";

const props = defineProps<{
  spawn: ProjectileSpawn;
}>();

const emit = defineEmits<{
  hitPlayer: [{ projectileId: number }];
  expired: [{ projectileId: number }];
}>();

const isActive = shallowRef(true);
const lifetime = shallowRef(0);

const { eid, transform } = useEcsComponent({
  components: {
    projectile: ProjectileTag,
    trigger: createTriggerZone({
      radius: PROJECTILE_TRIGGER_RADIUS,
      target: [PlayerTag],
      onEnter() {
        if (isActive.value === true) {
          isActive.value = false;
          emit("hitPlayer", { projectileId: props.spawn.id });
        }
      },
    }),
  },
  fn: ({ delta }) => {
    if (isActive.value === false) {
      return;
    }

    lifetime.value += delta;

    if (lifetime.value >= PROJECTILE_LIFETIME) {
      isActive.value = false;
      emit("expired", { projectileId: props.spawn.id });
      return;
    }

    const nextX = transform.posX.value + props.spawn.dirX * PROJECTILE_SPEED * delta;
    const nextZ = transform.posZ.value + props.spawn.dirZ * PROJECTILE_SPEED * delta;

    // Remove if it leaves the arena
    if (Math.abs(nextX) > ARENA_HALF_SIZE || Math.abs(nextZ) > ARENA_HALF_SIZE) {
      isActive.value = false;
      emit("expired", { projectileId: props.spawn.id });
      return;
    }

    transform.posX.value = nextX;
    transform.posZ.value = nextZ;
  },
});

// Set initial position
transform.posX.value = props.spawn.x;
transform.posY.value = 0.5;
transform.posZ.value = props.spawn.z;
</script>

<template>
  <DumasEntity v-if="isActive === true" :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[PROJECTILE_RADIUS, 8, 8]" />
      <TresMeshStandardMaterial
        :color="PROJECTILE_COLOR"
        :emissive="PROJECTILE_COLOR"
        :emissive-intensity="0.8"
      />
    </TresMesh>
  </DumasEntity>
</template>
