<script setup lang="ts">
import { ref, shallowRef, computed } from "vue";
import { Scene } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import { BUILD_OPTIONS } from "./types";
import type { Orbiter } from "./types";
import DysonSun from "./DysonSun.vue";
import DysonOrbiter from "./DysonOrbiter.vue";
import DysonStarfield from "./DysonStarfield.vue";
import DysonUI from "./DysonUI.vue";

const COST_MULTIPLIER = 1.15;

const energy = ref(0);
const orbiters = shallowRef<Array<Orbiter>>([]);
const counts = ref<Record<string, number>>({ collector: 0, swarm: 0, station: 0 });
let nextId = 1;

const incomePerSecond = ref(0);

const currentCosts = computed(() =>
  BUILD_OPTIONS.map((option) =>
    Math.floor(option.cost * Math.pow(COST_MULTIPLIER, counts.value[option.type] ?? 0)),
  ),
);

function recalcIncome(): void {
  let total = 0;
  for (const o of orbiters.value) {
    total += o.energyPerSecond;
  }
  incomePerSecond.value = total;
}

function onSunClicked(): void {
  energy.value += 1;
}

function onBuild({ index }: { index: number }): void {
  const option = BUILD_OPTIONS[index];
  const cost = currentCosts.value[index];
  if (energy.value < cost) {
    return;
  }

  energy.value -= cost;
  counts.value = { ...counts.value, [option.type]: (counts.value[option.type] ?? 0) + 1 };

  const orbiter: Orbiter = {
    id: nextId++,
    type: option.type,
    orbitRadius: option.orbitRadius + (Math.random() - 0.5) * 1.5,
    orbitSpeed: 0.3 + Math.random() * 0.4,
    startAngle: Math.random() * Math.PI * 2,
    energyPerSecond: option.energyPerSecond,
  };

  orbiters.value = [...orbiters.value, orbiter];
  recalcIncome();
}

function onPassiveEnergy({ amount }: { amount: number }): void {
  energy.value += amount;
}
</script>

<template>
  <Scene name="dyson" :default="true">
    <TresPerspectiveCamera :position="[0, 8, 14]" :look-at="[0, 0, 0]" :fov="50" />
    <OrbitControls :enable-pan="false" :target="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.15" />

    <DysonStarfield />

    <DysonSun @clicked="onSunClicked" />

    <DysonOrbiter
      v-for="orbiter in orbiters"
      :key="orbiter.id"
      :orbiter="orbiter"
      @passive-energy="(amt) => onPassiveEnergy(amt)"
    />

    <template #overlay>
      <DysonUI
        :energy="energy"
        :income-per-second="incomePerSecond"
        :costs="currentCosts"
        @build="(evt) => onBuild(evt)"
      />
    </template>
  </Scene>
</template>
