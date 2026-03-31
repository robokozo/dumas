<script setup lang="ts">
import PuzzlePlatformerGame from "./PuzzlePlatformerGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <PuzzlePlatformerGame />
    </template>

    <h1>Puzzle Platformer</h1>
    <p>
      A 2.5D side-scrolling puzzle platformer built with Dumas. Navigate platforms, step on pressure
      plates to activate mechanical bridges and gates, collect a key, and reach the exit door.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>A / Left Arrow</strong> — move left</li>
      <li><strong>D / Right Arrow</strong> — move right</li>
      <li><strong>Space / W / Up Arrow</strong> — jump</li>
    </ul>

    <h2>Objectives</h2>
    <ul>
      <li>
        Step on <strong>pressure plate 1</strong> (lower-left platform) to lower the drawbridge
      </li>
      <li>Cross the bridge to the middle platform</li>
      <li>Step on <strong>pressure plate 2</strong> (middle platform) to swing open the gate</li>
      <li>Reach the upper-right platform and collect the <strong>golden key</strong></li>
      <li>Return to the <strong>exit door</strong> (ground level, far right) with the key</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The player character uses <code>useCharacterController</code> with a
      <code>kinematicPositionBased</code> capsule body for smooth, responsive platformer movement
      including slope handling, step climbing, and snap-to-ground.
    </p>
    <p>
      Two <code>useJoint</code> revolute joints power the bridge and gate. When a pressure plate
      fires, <code>setMotorPosition</code> drives the joint to the target angle with configurable
      stiffness and damping — producing a satisfying mechanical swing.
    </p>
    <p>
      Pressure plates and the key pickup use <code>createTriggerZone</code> with
      <code>defineTag</code> to target only the player entity. The trigger zone's
      <code>onEnter</code> and <code>onExit</code> callbacks handle all game logic — no polling or
      per-frame distance checks needed in user code.
    </p>
    <p>
      The exit door is another trigger zone that checks a reactive <code>hasKey</code> flag. All
      game state flows through Vue's reactivity system, so the HUD updates automatically.
    </p>
  </GuideLayout>
</template>
