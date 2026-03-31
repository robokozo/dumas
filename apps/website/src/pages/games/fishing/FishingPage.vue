<script setup lang="ts">
import FishingGame from "./FishingGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <FishingGame />
    </template>

    <h1>Fishing Game</h1>
    <p>
      A small fishing demo showcasing several Dumas features working together. Stand on the dock,
      cast your line, and reel in fish when they bite.
    </p>

    <h2>Controls</h2>
    <ul>
      <li><strong>A / D</strong> — Walk left / right along the dock</li>
      <li><strong>Space</strong> — Cast line (when idle) or reel in (when a fish bites)</li>
    </ul>

    <h2>What it demonstrates</h2>
    <ul>
      <li>
        <code>useJoint</code> (spring) — The fishing line connects the rod tip to the bobber via a
        spring joint, creating a natural arc and bounce when cast.
      </li>
      <li>
        <code>usePhysics</code> — The bobber is a dynamic body with damping, the rod tip is a
        kinematic body that follows the character, and the dock is a fixed body.
      </li>
      <li>
        <code>useWorldToScreen</code> — The "Fish on!" indicator is a DOM overlay positioned in
        screen-space using the bobber's world position.
      </li>
      <li>
        <code>useInput</code> / <code>defineInputMap</code> — Keyboard input drives character
        movement and cast/reel actions via named action mapping.
      </li>
      <li>
        <code>useSystem</code> — Fish swim back and forth via per-frame transform updates, the rod
        tip follows the character, and proximity-based bite detection runs each frame.
      </li>
    </ul>

    <h2>Fish species</h2>
    <ul>
      <li><strong style="color: #4ecdc4">Bluegill</strong> — Common, swims slowly</li>
      <li><strong style="color: #ff6b6b">Salmon</strong> — Medium speed</li>
      <li><strong style="color: #ffe66d">Goldfish</strong> — Fast and flashy</li>
      <li><strong style="color: #c9b1ff">Catfish</strong> — Slow bottom-dweller</li>
    </ul>
  </GuideLayout>
</template>
