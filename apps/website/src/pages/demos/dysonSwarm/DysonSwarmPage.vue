<script setup lang="ts">
import { ref, computed } from "vue";
import { useIntervalFn } from "@vueuse/core";
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import DysonSwarmScene from "./DysonSwarmScene.vue";

const BASE_SATELLITE_COST = 10;
const COST_SCALE = 1.18;
const SATELLITE_ENERGY_RATE = 0.8; // energy per second per satellite
const BASE_STATION_COST = 500;
const STATION_COST_SCALE = 2.5;
const STATION_ENERGY_RATE = 8; // energy per second per station
const CPS_TICK_MS = 100;

const energy = ref(0);
const satelliteCount = ref(0);
const stationCount = ref(0);
const resetKey = ref(0);
const satellitesLost = ref(0);

function resetCamera(): void {
  resetKey.value += 1;
}

const nextCost = computed(() =>
  Math.floor(BASE_SATELLITE_COST * Math.pow(COST_SCALE, satelliteCount.value)),
);
const nextStationCost = computed(() =>
  Math.floor(BASE_STATION_COST * Math.pow(STATION_COST_SCALE, stationCount.value)),
);
const energyPerSecond = computed(
  () => satelliteCount.value * SATELLITE_ENERGY_RATE + stationCount.value * STATION_ENERGY_RATE,
);
const canBuy = computed(() => energy.value >= nextCost.value);
const canBuyStation = computed(() => energy.value >= nextStationCost.value);

const MILESTONES: Array<{ count: number; label: string }> = [
  { count: 1, label: "First satellite online." },
  { count: 5, label: "Proto-swarm detected." },
  { count: 10, label: "Energy collection rising." },
  { count: 25, label: "Significant stellar coverage." },
  { count: 50, label: "Dyson swarm operational." },
  { count: 100, label: "Kardashev Type II achieved." },
];

const milestone = computed(() => {
  let current: string | null = null;
  for (const m of MILESTONES) {
    if (satelliteCount.value >= m.count) {
      current = m.label;
    }
  }
  return current;
});

// Passive energy accumulation from satellites and stations
useIntervalFn(() => {
  const totalRate =
    satelliteCount.value * SATELLITE_ENERGY_RATE + stationCount.value * STATION_ENERGY_RATE;
  if (totalRate > 0) {
    energy.value += (totalRate * CPS_TICK_MS) / 1000;
  }
}, CPS_TICK_MS);

function onSunClicked(): void {
  energy.value += 1;
}

function onTouch(event: TouchEvent): void {
  // Each changedTouch is a finger that just made contact — fire once per finger
  for (let i = 0; i < event.changedTouches.length; i++) {
    onSunClicked();
  }
}

function onCollision(destroyedCount: number): void {
  // satellitesLost.value += destroyedCount;
  // satelliteCount.value = Math.max(0, satelliteCount.value - destroyedCount);
}

function buySatellite(): void {
  if (canBuy.value === false) return;
  energy.value -= nextCost.value;
  satelliteCount.value += 1;
}

function buyStation(): void {
  if (canBuyStation.value === false) return;
  energy.value -= nextStationCost.value;
  stationCount.value += 1;
}
</script>

<template>
  <DemoLayout>
    <template #scene>
      <!-- touchstart.prevent fires per finger and blocks the subsequent click to avoid double-counting -->
      <div class="touch-layer" @touchstart.prevent="(e) => onTouch(e)">
        <SiteCanvas clear-color="#03030f" render-mode="always" :gravity="{ x: 0, y: 0, z: 0 }">
          <DysonSwarmScene
            :satellite-count="satelliteCount"
            :station-count="stationCount"
            :reset-key="resetKey"
            @sun-clicked="onSunClicked"
            @collision="(n) => onCollision(n)"
          />
        </SiteCanvas>
      </div>
    </template>

    <template #hud>
      <div class="hud">
        <!-- Energy display -->
        <div class="panel energy-panel">
          <span class="label">Energy</span>
          <span class="value">{{ Math.floor(energy).toLocaleString() }}</span>
          <span v-if="energyPerSecond > 0" class="cps">
            +{{ energyPerSecond.toFixed(1) }}/sec
          </span>
        </div>

        <!-- Collision counter -->
        <div v-if="satellitesLost > 0" class="panel collision-panel">
          <span class="label">Satellites Lost</span>
          <span class="value collision-value">{{ satellitesLost }}</span>
        </div>

        <!-- Buy satellite -->
        <div class="panel buy-panel">
          <div class="swarm-header">
            <span class="label">Dyson Swarm</span>
            <span class="swarm-count">{{ satelliteCount }}</span>
          </div>
          <button
            class="buy-btn"
            :class="{ enabled: canBuy }"
            :disabled="!canBuy"
            @click="buySatellite"
          >
            Deploy Satellite
            <span class="cost">{{ nextCost.toLocaleString() }} ⚡</span>
          </button>
          <p v-if="milestone !== null" class="milestone">{{ milestone }}</p>
        </div>

        <!-- Buy station -->
        <div class="panel buy-panel">
          <div class="swarm-header">
            <span class="label">Space Stations</span>
            <span class="swarm-count">{{ stationCount }}</span>
          </div>
          <button
            class="buy-btn"
            :class="{ enabled: canBuyStation }"
            :disabled="!canBuyStation"
            @click="buyStation"
          >
            Deploy Station
            <span class="cost">{{ nextStationCost.toLocaleString() }} ⚡</span>
          </button>
        </div>
      </div>

      <button class="recenter-btn" @click="resetCamera">Re-center</button>

      <p class="hint">Click the sun to collect energy</p>
    </template>
  </DemoLayout>
</template>

<style scoped>
.touch-layer {
  height: 100%;
  width: 100%;
}

.hud {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  font-family: sans-serif;
}

.panel {
  background: rgba(6, 8, 20, 0.75);
  border: 1px solid rgba(255, 160, 50, 0.2);
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  min-width: 190px;
}

.label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 160, 50, 0.6);
  margin-bottom: 0.2rem;
}

.collision-value {
  color: #ff7755;
}

.value {
  display: block;
  font-size: 1.7rem;
  font-weight: 700;
  color: #ffdd88;
  line-height: 1.1;
}

.cps {
  display: block;
  font-size: 0.72rem;
  color: rgba(255, 200, 80, 0.55);
  margin-top: 0.15rem;
}

.swarm-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.swarm-count {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffdd88;
}

.buy-btn {
  pointer-events: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.6rem 0.8rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 160, 50, 0.2);
  border-radius: 7px;
  color: rgba(255, 220, 100, 0.4);
  font-family: sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: not-allowed;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.buy-btn.enabled {
  border-color: rgba(255, 160, 50, 0.6);
  color: #ffdd88;
  cursor: pointer;
}

.buy-btn.enabled:hover {
  background: rgba(255, 140, 30, 0.15);
}

.cost {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.75;
}

.milestone {
  margin: 0.6rem 0 0;
  font-size: 0.68rem;
  color: rgba(255, 200, 80, 0.5);
  font-style: italic;
  text-align: center;
}

.recenter-btn {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  pointer-events: auto;
  background: rgba(6, 8, 20, 0.75);
  border: 1px solid rgba(255, 160, 50, 0.3);
  border-radius: 7px;
  color: rgba(255, 220, 100, 0.6);
  font-family: sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.recenter-btn:hover {
  background: rgba(255, 140, 30, 0.12);
  border-color: rgba(255, 160, 50, 0.6);
  color: #ffdd88;
}

.hint {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: rgba(255, 255, 255, 0.2);
  font-family: sans-serif;
  font-size: 0.72rem;
  white-space: nowrap;
  pointer-events: none;
}
</style>
