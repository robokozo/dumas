<script setup lang="ts">
import { shallowReactive, watch } from "vue";
import { OrbitControls } from "@tresjs/cientos";
import Satellite from "./Satellite.vue";
import SpaceStation from "./SpaceStation.vue";

interface SatelliteState {
  id: number;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  inclination: number;
  omega: number;
  panelW: number;
  panelH: number;
}

interface StationState {
  id: number;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
}

const props = defineProps<{
  satelliteCount: number;
  stationCount: number;
  resetKey: number;
}>();

const emit = defineEmits<{
  "sun-clicked": [];
  collision: [destroyedCount: number];
}>();

// Star field — generated once, static
const STAR_COUNT = 2000;
const starPositions = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 80 + Math.random() * 20;
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = r * Math.cos(phi);
}

// shallowReactive so splice() triggers v-for re-renders
const satellites = shallowReactive<Array<SatelliteState>>([]);
let nextId = 0;

function addSatelliteState(): void {
  const i = satellites.length;
  // Spread across shells: inner, mid, outer cycling every 3
  const shell = i % 3;
  const baseRadius = 2.4 + shell * 0.9;
  const initialAngle = (i / 3) * 2.3561 + (i % 3) * 1.2; // golden angle spread

  satellites.push({
    id: nextId++,
    orbitRadius: baseRadius + (i % 7) * 0.06,
    orbitSpeed: 0.55 - shell * 0.1 + (i % 5) * 0.025,
    initialAngle,
    inclination: ((i * 37) % 180) * (Math.PI / 180) - Math.PI / 2,
    omega: ((i * 73) % 360) * (Math.PI / 180),
    panelW: 0.28 + (i % 4) * 0.04,
    panelH: 0.14 + (i % 3) * 0.03,
  });
}

watch(
  () => props.satelliteCount,
  (count) => {
    while (satellites.length < count) {
      addSatelliteState();
    }
  },
);

function onSatelliteDestroyed(id: number): void {
  const index = satellites.findIndex((s) => s.id === id);
  if (index !== -1) {
    // satellites.splice(index, 1);
    emit("collision", 1);
  }
}

const stations = shallowReactive<Array<StationState>>([]);
let nextStationId = 0;

function addStationState(): void {
  const i = stations.length;
  // Stations orbit well beyond satellites (2.4–5.1), spread across a band 6–8
  const orbitRadius = 6.0 + (i % 5) * 0.4;
  const initialAngle = i * 2.3998; // near-golden angle, keeps stations spread
  stations.push({
    id: nextStationId++,
    orbitRadius,
    orbitSpeed: 0.12 - (i % 3) * 0.02,
    initialAngle,
  });
}

watch(
  () => props.stationCount,
  (count) => {
    while (stations.length < count) {
      addStationState();
    }
  },
);

function onStationDestroyed(id: number): void {
  const index = stations.findIndex((s) => s.id === id);
  if (index !== -1) {
    // stations.splice(index, 1);
    emit("collision", 1);
  }
}
</script>

<template>
  <!-- Ambient fill -->
  <TresAmbientLight :intensity="0.15" />

  <!-- Sun light source -->
  <TresPointLight :position="[0, 0, 0]" :intensity="80" :distance="20" color="#ffaa44" />
  <TresDirectionalLight :position="[8, 6, 4]" :intensity="0.4" color="#ffffff" />

  <!-- key forces remount on reset, which snaps camera back to initial position -->
  <TresPerspectiveCamera :key="props.resetKey" :position="[0, 4, 11]" :look-at="[0, 0, 0]" />
  <OrbitControls :key="props.resetKey" make-default />

  <!-- Star field -->
  <TresPoints>
    <TresBufferGeometry :position="[starPositions, 3]" />
    <TresPointsMaterial color="#ffffff" :size="0.12" :size-attenuation="true" />
  </TresPoints>

  <!-- Sun core (clickable) — high emissive-intensity drives tone-mapping bloom -->
  <TresMesh @click="emit('sun-clicked')">
    <TresSphereGeometry :args="[1.2, 48, 48]" />
    <TresMeshStandardMaterial color="#ffdd66" emissive="#ffaa00" :emissive-intensity="4" />
  </TresMesh>

  <!-- Inner corona — also emissive to push the bright halo -->
  <TresMesh>
    <TresSphereGeometry :args="[1.35, 32, 32]" />
    <TresMeshStandardMaterial
      color="#ff6600"
      emissive="#ff4400"
      :emissive-intensity="2"
      :transparent="true"
      :opacity="0.5"
    />
  </TresMesh>

  <!-- Satellites -->
  <Satellite
    v-for="sat in satellites"
    :key="sat.id"
    :orbit-radius="sat.orbitRadius"
    :orbit-speed="sat.orbitSpeed"
    :initial-angle="sat.initialAngle"
    :inclination="sat.inclination"
    :omega="sat.omega"
    :panel-w="sat.panelW"
    :panel-h="sat.panelH"
    @destroyed="() => onSatelliteDestroyed(sat.id)"
  />

  <!-- Space Stations -->
  <SpaceStation
    v-for="station in stations"
    :key="station.id"
    :orbit-radius="station.orbitRadius"
    :orbit-speed="station.orbitSpeed"
    :initial-angle="station.initialAngle"
    @destroyed="() => onStationDestroyed(station.id)"
  />
</template>
