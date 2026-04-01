<script setup lang="ts">
import { ref, shallowRef, toRef } from "vue";
import {
  DumasEntity,
  useEcsComponent,
  useEntityRef,
  useWorldToScreen,
  createTriggerZone,
} from "@dumas/core";
import { EnemyTag, PlayerTag } from "./tags";
import {
  ENEMY_SPEED,
  ENEMY_MAX_HEALTH,
  ENEMY_COLOR,
  ARENA_HALF_SIZE,
  ENEMY_TRIGGER_RADIUS,
  ENEMY_LERP,
} from "./constants";
import type { EnemySpawn } from "./types";

const props = defineProps<{
  spawn: EnemySpawn;
  playerEid: number;
}>();

const emit = defineEmits<{
  contactPlayer: [];
  defeated: [{ enemyId: number }];
}>();

const health = ref(props.spawn.health);
const isAlive = shallowRef(true);

const playerRef = useEntityRef({ eid: toRef(() => props.playerEid) });

const { eid, transform } = useEcsComponent({
  components: {
    enemy: EnemyTag,
    trigger: createTriggerZone({
      radius: ENEMY_TRIGGER_RADIUS,
      target: [PlayerTag],
      onEnter() {
        if (isAlive.value === true) {
          emit("contactPlayer");
        }
      },
    }),
  },
  fn: ({ delta }) => {
    if (isAlive.value === false) {
      return;
    }

    const playerTransform = playerRef.transform;
    if (playerTransform === null) {
      return;
    }

    const px = playerTransform.posX.value;
    const pz = playerTransform.posZ.value;

    const ex = transform.posX.value;
    const ez = transform.posZ.value;

    // Direction toward player
    const dx = px - ex;
    const dz = pz - ez;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.8) {
      // Move toward player
      const nx = dx / dist;
      const nz = dz / dist;

      const targetX = ex + nx * ENEMY_SPEED * delta;
      const targetZ = ez + nz * ENEMY_SPEED * delta;

      // Clamp to arena bounds
      transform.posX.value = Math.max(
        -ARENA_HALF_SIZE + 1,
        Math.min(ARENA_HALF_SIZE - 1, ex + (targetX - ex) * ENEMY_LERP * 60),
      );
      transform.posZ.value = Math.max(
        -ARENA_HALF_SIZE + 1,
        Math.min(ARENA_HALF_SIZE - 1, ez + (targetZ - ez) * ENEMY_LERP * 60),
      );

      // Face player
      transform.lookAt({ x: px, z: pz });
    }
  },
});

// Set initial position
transform.posX.value = props.spawn.x;
transform.posY.value = 0.5;
transform.posZ.value = props.spawn.z;

const { x: screenX, y: screenY, isVisible } = useWorldToScreen({ eid });

function takeDamage({ amount }: { amount: number }): void {
  if (isAlive.value === false) {
    return;
  }
  health.value = Math.max(0, health.value - amount);
  if (health.value <= 0) {
    isAlive.value = false;
    emit("defeated", { enemyId: props.spawn.id });
  }
}

defineExpose({ eid, takeDamage, screenX, screenY, isVisible, health, isAlive });
</script>

<template>
  <DumasEntity v-if="isAlive === true" :eid="eid">
    <!-- Enemy body — cylinder, slightly wider than player -->
    <TresMesh>
      <TresCylinderGeometry :args="[0.45, 0.45, 1, 8]" />
      <TresMeshStandardMaterial
        :color="ENEMY_COLOR"
        :emissive="ENEMY_COLOR"
        :emissive-intensity="0.2"
      />
    </TresMesh>
    <!-- Head — angular look with octahedron -->
    <TresMesh :position="[0, 0.65, 0]">
      <TresOctahedronGeometry :args="[0.25, 0]" />
      <TresMeshStandardMaterial :color="ENEMY_COLOR" />
    </TresMesh>
  </DumasEntity>
</template>
