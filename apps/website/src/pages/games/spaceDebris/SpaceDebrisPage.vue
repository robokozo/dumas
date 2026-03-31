<script setup lang="ts">
import SpaceDebrisGame from "./SpaceDebrisGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <SpaceDebrisGame />
    </template>

    <h1>Space Debris Cleaner</h1>
    <p>
      Pilot a cleanup vessel through an orbital debris field. Activate the tractor beam to pull
      nearby debris toward your ship and collect it. New waves of debris appear periodically, so
      stay alert and keep the lanes clear.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>WASD / Arrow Keys</strong> — move the ship across the XZ plane</li>
      <li>
        <strong>Space or Click</strong> — activate the tractor beam, pulling nearby debris toward
        the ship
      </li>
      <li>
        <strong>Collect debris</strong> — when pulled debris reaches the ship it is collected and
        you earn points
      </li>
      <li>
        <strong>New waves</strong> — fresh debris spawns periodically, increasing the challenge
      </li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The player ship uses <code>useInput</code> with <code>defineInputMap</code> for WASD movement
      and <code>transform.lookAt</code> to face the direction of travel. Each debris piece is an ECS
      entity with <code>useEcsComponent</code>, using <code>transform.setEuler</code> for tumbling
      rotation at varying speeds.
    </p>
    <p>
      The tractor beam uses <code>useEntityRef</code> to read the ship's transform from each debris
      entity, calculating distance and applying a pull force when within range. Wave spawning is
      driven by <code>useSystem</code> with a timer. Four distinct debris types (rock, panel, hull,
      crystal) showcase different Three.js geometries rendered via <code>DumasEntity</code>.
    </p>
  </GuideLayout>
</template>
