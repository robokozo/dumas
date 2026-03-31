<script setup lang="ts">
import { DumasEntity, useEcsComponent } from "@dumas/core";
import type { Orbiter, BuildOption } from "./types";
import { BUILD_OPTIONS } from "./types";

const props = defineProps<{
  orbiter: Orbiter;
}>();

const emit = defineEmits<{
  passiveEnergy: [{ amount: number }];
}>();

const option = BUILD_OPTIONS.find((o) => o.type === props.orbiter.type) as BuildOption;

let energyAccumulator = 0;

const { eid, transform } = useEcsComponent({
  components: {},
  fn: ({ delta, elapsed }) => {
    const angle = props.orbiter.startAngle + elapsed * props.orbiter.orbitSpeed;
    const r = props.orbiter.orbitRadius;

    transform.posX.value = Math.cos(angle) * r;
    transform.posZ.value = Math.sin(angle) * r;
    transform.posY.value = 0.5;

    // Face the sun (origin)
    transform.lookAt({ x: 0, z: 0 });

    // Accumulate passive energy
    energyAccumulator += props.orbiter.energyPerSecond * delta;
    if (energyAccumulator >= 1) {
      const whole = Math.floor(energyAccumulator);
      energyAccumulator -= whole;
      emit("passiveEnergy", { amount: whole });
    }
  },
});
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Solar Collector: two angled panels on a central mast -->
    <template v-if="props.orbiter.type === 'collector'">
      <!-- Solar panel — flat rectangle, thin in Z to face the sun -->
      <TresMesh>
        <TresBoxGeometry :args="[0.4, 0.25, 0.015]" />
        <TresMeshStandardMaterial
          :color="option.color"
          :emissive="option.color"
          :emissive-intensity="0.5"
        />
      </TresMesh>
      <!-- Boom — cylinder through the panel along Z -->
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresCylinderGeometry :args="[0.02, 0.02, 0.4, 4]" />
        <TresMeshStandardMaterial color="#445566" />
      </TresMesh>
    </template>

    <!-- Dyson Swarm Segment: three vertical panels along a horizontal boom -->
    <template v-if="props.orbiter.type === 'swarm'">
      <!-- Boom — horizontal along X connecting the panels -->
      <TresMesh :rotation="[0, 0, Math.PI / 2]">
        <TresCylinderGeometry :args="[0.02, 0.02, 0.7, 4]" />
        <TresMeshStandardMaterial color="#886630" />
      </TresMesh>
      <!-- Panel left — vertical, thin in Z to face sun -->
      <TresMesh :position="[-0.25, 0, 0]">
        <TresBoxGeometry :args="[0.2, 0.2, 0.015]" />
        <TresMeshStandardMaterial
          :color="option.color"
          :emissive="option.color"
          :emissive-intensity="0.4"
        />
      </TresMesh>
      <!-- Panel center -->
      <TresMesh>
        <TresBoxGeometry :args="[0.2, 0.2, 0.015]" />
        <TresMeshStandardMaterial
          :color="option.color"
          :emissive="option.color"
          :emissive-intensity="0.4"
        />
      </TresMesh>
      <!-- Panel right -->
      <TresMesh :position="[0.25, 0, 0]">
        <TresBoxGeometry :args="[0.2, 0.2, 0.015]" />
        <TresMeshStandardMaterial
          :color="option.color"
          :emissive="option.color"
          :emissive-intensity="0.4"
        />
      </TresMesh>
    </template>

    <!-- Space Station: central hub, solar panels on booms, habitat ring -->
    <template v-if="props.orbiter.type === 'station'">
      <!-- Central hub -->
      <TresMesh>
        <TresBoxGeometry :args="[0.2, 0.2, 0.2]" />
        <TresMeshStandardMaterial
          :color="option.color"
          :emissive="option.color"
          :emissive-intensity="0.3"
        />
      </TresMesh>
      <!-- Habitat ring -->
      <TresMesh :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.35, 0.04, 8, 16]" />
        <TresMeshStandardMaterial color="#aaaabc" :emissive="'#6666aa'" :emissive-intensity="0.2" />
      </TresMesh>
      <!-- Left boom -->
      <TresMesh :position="[-0.35, 0, 0]" :rotation="[0, 0, Math.PI / 2]">
        <TresCylinderGeometry :args="[0.015, 0.015, 0.5, 4]" />
        <TresMeshStandardMaterial color="#667788" />
      </TresMesh>
      <!-- Left solar panel — vertical, thin in Z, faces sun -->
      <TresMesh :position="[-0.55, 0, 0]">
        <TresBoxGeometry :args="[0.25, 0.3, 0.015]" />
        <TresMeshStandardMaterial color="#5577aa" :emissive="'#3355aa'" :emissive-intensity="0.4" />
      </TresMesh>
      <!-- Right boom -->
      <TresMesh :position="[0.35, 0, 0]" :rotation="[0, 0, Math.PI / 2]">
        <TresCylinderGeometry :args="[0.015, 0.015, 0.5, 4]" />
        <TresMeshStandardMaterial color="#667788" />
      </TresMesh>
      <!-- Right solar panel — vertical, thin in Z, faces sun -->
      <TresMesh :position="[0.55, 0, 0]">
        <TresBoxGeometry :args="[0.25, 0.3, 0.015]" />
        <TresMeshStandardMaterial color="#5577aa" :emissive="'#3355aa'" :emissive-intensity="0.4" />
      </TresMesh>
      <!-- Antenna -->
      <TresMesh :position="[0, 0.18, 0]">
        <TresCylinderGeometry :args="[0.01, 0.01, 0.16, 3]" />
        <TresMeshStandardMaterial color="#ccccdd" />
      </TresMesh>
      <TresMesh :position="[0, 0.27, 0]">
        <TresSphereGeometry :args="[0.025, 5, 5]" />
        <TresMeshStandardMaterial color="#ffffff" :emissive="'#aaaaff'" :emissive-intensity="0.5" />
      </TresMesh>
    </template>
  </DumasEntity>
</template>
