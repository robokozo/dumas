<script setup lang="ts">
import QuickDropGame from "./QuickDropGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <QuickDropGame />
    </template>

    <h1>Quick Drop</h1>
    <p>
      An arcade timing game. A spinning turntable has colored sections worth different points. Press
      the button to release a batch of balls and try to time it so they land on the high-value
      sections.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>Click "Drop Balls"</strong> — release 12 balls from above the turntable</li>
      <li>
        <strong>Time your drop</strong> — the turntable spins, so different sections pass under the
        drop zone
      </li>
      <li>
        <strong>Score points</strong> — balls are scored based on which section they settle on
      </li>
    </ul>

    <h2>Scoring</h2>
    <ul>
      <li>Blue sections — 10 points</li>
      <li>Green sections — 25 points</li>
      <li>Yellow section — 50 points</li>
      <li>Red section — 100 points</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The spinning turntable is a <code>kinematicPositionBased</code> rigid body whose rotation
      quaternion is updated each frame via <code>setNextKinematicRotation</code>. Balls are
      <code>dynamic</code> sphere colliders that interact with the turntable through friction.
    </p>
    <p>
      Scoring uses the ECS transform store directly — after balls settle, the scene reads each
      ball's world position from <code>TransformStore</code>, computes its angle relative to the
      turntable rotation, and maps it to a section.
    </p>
  </GuideLayout>
</template>
