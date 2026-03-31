<script setup lang="ts">
import { useEcsComponent, DumasEntity } from "@dumas/core";
import { EnemyTag } from "./tags";
import { SPAWN_X, PATH_Y, PATH_Z, ENEMY_RADIUS } from "./constants";

const props = defineProps<{
  spawnOffset: number;
}>();

const { eid, transform } = useEcsComponent({
  components: { enemy: EnemyTag },
});

transform.posX.value = SPAWN_X;
transform.posY.value = PATH_Y;
transform.posZ.value = PATH_Z + props.spawnOffset;

defineExpose({ eid, transform });
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[ENEMY_RADIUS, 12, 12]" />
      <TresMeshStandardMaterial color="#ff4444" emissive="#440000" :emissive-intensity="0.6" />
    </TresMesh>
  </DumasEntity>
</template>
