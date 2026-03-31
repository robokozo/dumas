<script setup lang="ts">
import { shallowRef } from "vue";
import { DumasEntity, useEcsComponent, defineInputMap, useInput, usePointer } from "@dumas/core";
import { SHIP_SPEED, TRACTOR_BEAM_RADIUS } from "./constants";

const emit = defineEmits<{
  positionUpdate: [{ x: number; z: number; eid: number }];
}>();

const AXIS_THRESHOLD = 0.5;

const INPUT_MAP = defineInputMap({
  up: ({ keys, gamepad }) =>
    keys.w?.value === true ||
    keys.arrowup?.value === true ||
    (gamepad.value?.axes[1] ?? 0) < -AXIS_THRESHOLD,
  down: ({ keys, gamepad }) =>
    keys.s?.value === true ||
    keys.arrowdown?.value === true ||
    (gamepad.value?.axes[1] ?? 0) > AXIS_THRESHOLD,
  left: ({ keys, gamepad }) =>
    keys.a?.value === true ||
    keys.arrowleft?.value === true ||
    (gamepad.value?.axes[0] ?? 0) < -AXIS_THRESHOLD,
  right: ({ keys, gamepad }) =>
    keys.d?.value === true ||
    keys.arrowright?.value === true ||
    (gamepad.value?.axes[0] ?? 0) > AXIS_THRESHOLD,
  tractor: ({ keys }) => keys.space?.value === true,
});

const isTractorActive = shallowRef(false);
const pointer = usePointer();

const { eid, transform } = useEcsComponent({
  components: {},
  fn: () => {},
});

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held }) => {
    let dx = 0;
    let dz = 0;

    if (held.up.value === true) dz -= 1;
    if (held.down.value === true) dz += 1;
    if (held.left.value === true) dx -= 1;
    if (held.right.value === true) dx += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) {
      dx = (dx / len) * SHIP_SPEED * delta;
      dz = (dz / len) * SHIP_SPEED * delta;
      transform.posX.value += dx;
      transform.posZ.value += dz;

      // Face movement direction
      transform.lookAt({
        x: transform.posX.value + dx * 10,
        z: transform.posZ.value + dz * 10,
      });
    }

    isTractorActive.value = held.tractor.value === true || pointer.isDown.value === true;

    emit("positionUpdate", {
      x: transform.posX.value,
      z: transform.posZ.value,
      eid,
    });
  },
});

defineExpose({ isTractorActive, eid });
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Ship body — wedge shape -->
    <TresMesh>
      <TresConeGeometry :args="[0.3, 0.8, 4]" />
      <TresMeshStandardMaterial color="#4488ff" :emissive="'#2244aa'" :emissive-intensity="0.6" />
    </TresMesh>

    <!-- Engine glow -->
    <TresMesh :position="[0, 0.1, 0.3]">
      <TresSphereGeometry :args="[0.12, 8, 8]" />
      <TresMeshStandardMaterial color="#ff6600" :emissive="'#ff4400'" :emissive-intensity="2" />
    </TresMesh>

    <!-- Tractor beam range indicator — visible when active -->
    <TresMesh v-if="isTractorActive" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[TRACTOR_BEAM_RADIUS - 0.05, TRACTOR_BEAM_RADIUS, 48]" />
      <TresMeshBasicMaterial color="#44ffaa" :transparent="true" :opacity="0.25" :side="2" />
    </TresMesh>

    <!-- Tractor beam disc — visible when active -->
    <TresMesh v-if="isTractorActive" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[TRACTOR_BEAM_RADIUS, 48]" />
      <TresMeshBasicMaterial color="#44ffaa" :transparent="true" :opacity="0.05" :side="2" />
    </TresMesh>
  </DumasEntity>
</template>
