<script setup lang="ts">
import { ref } from "vue";
import { DumasEntity, useEcsComponent, createTriggerZone, useWorldToScreen } from "@dumas/core";
import { CHECKPOINT_RADIUS, CHECKPOINT_COLOR_INACTIVE, CHECKPOINT_COLOR_ACTIVE } from "./constants";

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  label: string;
}>();

const emit = defineEmits<{
  reached: [];
}>();

const isReached = ref(false);

const { eid, transform } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: CHECKPOINT_RADIUS,
      target: [],
      onEnter() {
        if (isReached.value === false) {
          isReached.value = true;
          emit("reached");
        }
      },
    }),
  },
});

transform.posX.value = props.x;
transform.posY.value = props.y;
transform.posZ.value = props.z;

const { x: screenX, y: screenY, isVisible } = useWorldToScreen({ eid });

defineExpose({ screenX, screenY, isVisible, isReached, label: props.label });
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Translucent sphere showing the trigger zone -->
    <TresMesh>
      <TresSphereGeometry :args="[CHECKPOINT_RADIUS, 16, 16]" />
      <TresMeshStandardMaterial
        :color="isReached === true ? CHECKPOINT_COLOR_ACTIVE : CHECKPOINT_COLOR_INACTIVE"
        :transparent="true"
        :opacity="isReached === true ? 0.2 : 0.08"
      />
    </TresMesh>

    <!-- Center marker -->
    <TresMesh>
      <TresSphereGeometry :args="[0.12, 8, 8]" />
      <TresMeshStandardMaterial
        :color="isReached === true ? CHECKPOINT_COLOR_ACTIVE : CHECKPOINT_COLOR_INACTIVE"
        :emissive="isReached === true ? CHECKPOINT_COLOR_ACTIVE : CHECKPOINT_COLOR_INACTIVE"
        :emissive-intensity="1.5"
      />
    </TresMesh>
  </DumasEntity>
</template>
