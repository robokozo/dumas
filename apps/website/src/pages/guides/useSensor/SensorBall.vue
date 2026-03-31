<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createSphereCollider } from "@dumas/core";

const props = defineProps<{
  startX: number;
  color: string;
}>();

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      gravityScale: 0,
      linearDamping: 0.5,
      lockRotations: true,
      enabledTranslations: [true, false, false],
      linvel: { x: props.startX > 0 ? -4 : 4, y: 0, z: 0 },
      colliders: {
        shell: createSphereCollider({ radius: 0.4, restitution: 1, friction: 0 }),
      },
    }),
  },
});

transform.posX.value = props.startX;
transform.posY.value = 0;
transform.posZ.value = 0;
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[0.4, 16, 16]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </DumasEntity>
</template>
