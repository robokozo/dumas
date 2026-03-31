<script setup lang="ts">
import { useEcsComponent, DumasEntity } from "@dumas/core";
import { ProjectileTag } from "./tags";
import { PROJECTILE_RADIUS } from "./constants";

const props = defineProps<{
  startX: number;
  startY: number;
  startZ: number;
}>();

const { eid, transform } = useEcsComponent({
  components: { projectile: ProjectileTag },
});

transform.posX.value = props.startX;
transform.posY.value = props.startY;
transform.posZ.value = props.startZ;

defineExpose({ eid, transform });
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[PROJECTILE_RADIUS, 8, 8]" />
      <TresMeshStandardMaterial color="#ffff44" emissive="#ffaa00" :emissive-intensity="2" />
    </TresMesh>
  </DumasEntity>
</template>
