<script setup lang="ts">
import { ref, computed } from "vue";
import { DumasEntity, useEcsComponent, createPhysics, createSphereCollider } from "@dumas/core";

const props = defineProps<{
  leftColor: string;
  rightColor: string;
}>();

// Reactive color — updated in the onCollision callback and drives the material.
const color = ref(props.leftColor);
const emissiveColor = computed(() => color.value);

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      gravityScale: 0,
      linearDamping: 0,
      lockRotations: true,
      enabledTranslations: [true, false, false],
      linvel: { x: 6, y: 0, z: 0 },
      colliders: {
        shell: createSphereCollider({
          radius: 0.5,
          restitution: 1,
          friction: 0,
          onCollision: ({ otherCollider }) => {
            color.value = otherCollider.translation().x < 0 ? props.leftColor : props.rightColor;
          },
        }),
      },
    }),
  },
});

transform.posX.value = 0;
transform.posY.value = 0;
transform.posZ.value = 0;
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[0.5, 32, 32]" />
      <TresMeshStandardMaterial
        :color="color"
        :emissive="emissiveColor"
        :emissive-intensity="0.5"
      />
    </TresMesh>
  </DumasEntity>
</template>
