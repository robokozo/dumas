<script setup lang="ts">
import DysonGame from "./DysonGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <DysonGame />
    </template>

    <h1>Dyson Swarm</h1>
    <p>
      An idle clicker set in space. Click the sun to harvest energy, then spend it to build orbital
      structures that generate passive income.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>Click the sun</strong> — harvest 1 energy per click</li>
      <li>
        <strong>Build structures</strong> — spend energy on collectors, swarm segments, or stations
      </li>
      <li>
        <strong>Watch your swarm grow</strong> — structures orbit the sun and generate energy
        automatically
      </li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      Each orbiting structure is an ECS entity created with <code>useEcsComponent</code>. The
      per-entity <code>fn</code> callback drives orbital motion using <code>elapsed</code> time and
      trigonometric positioning — no physics engine required.
    </p>
    <p>
      Game state (energy, income, orbiter list) lives in the scene component as reactive refs. The
      overlay UI reads props and emits build events. Structures are rendered with
      <code>v-for</code> over a <code>shallowRef</code> array, each spawning its own ECS entity on
      mount.
    </p>
  </GuideLayout>
</template>
