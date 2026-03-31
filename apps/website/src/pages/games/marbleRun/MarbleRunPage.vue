<script setup lang="ts">
import MarbleRunGame from "./MarbleRunGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <MarbleRunGame />
    </template>

    <h1>Marble Run</h1>
    <p>
      A physics-based marble run course. Drop marbles from the top and watch them roll down ramps,
      tip a seesaw, bounce off a spring-loaded bumper, and funnel into the goal at the bottom.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>Space</strong> — drop a marble (max 3 on the course at once)</li>
      <li>Marbles score points for passing through checkpoints and reaching the goal</li>
      <li>A timer tracks how long the run takes</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The seesaw is built with <code>useJoint</code> using a <strong>revolute</strong> (hinge) joint
      with angle limits. When a marble rolls onto one side, its weight tips the plank, creating
      dynamic routing through the course.
    </p>
    <p>
      The spring bumper uses a <strong>spring</strong> joint connecting a dynamic pad to a fixed
      wall. When a marble hits the pad, the spring compresses and rebounds, launching the marble
      sideways.
    </p>
    <p>
      Checkpoints use <code>createTriggerZone</code> for proximity-based detection without requiring
      physics colliders. Each checkpoint changes color when a marble passes through and awards bonus
      points.
    </p>
    <p>
      Checkpoint labels are positioned using <code>useWorldToScreen</code> to project 3D entity
      positions into screen-space CSS coordinates for the HTML overlay.
    </p>
  </GuideLayout>
</template>
