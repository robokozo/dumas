<script setup lang="ts">
import DungeonGame from "./DungeonGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <DungeonGame />
    </template>

    <h1>Dungeon Explorer</h1>
    <p>
      A Zelda-style top-down game with WASD movement, camera follow, and scene transitions triggered
      by walking through doorways.
    </p>

    <h2>Controls</h2>
    <ul>
      <li><strong>WASD / Arrow keys</strong> — move the character</li>
      <li><strong>Left stick</strong> — gamepad movement</li>
      <li><strong>Walk into the cave</strong> — transition to the cave scene</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      Movement uses <code>defineInputMap</code> to bind WASD, arrow keys, and the gamepad left stick
      to four directional actions. <code>useInput</code> runs the movement function each frame,
      reading <code>held</code> state for smooth continuous motion.
    </p>
    <p>
      Scene transitions use <code>loadScene()</code>. When the player walks into the cave entrance
      (proximity check in the scene's move handler), the engine transitions to the cave scene. The
      cave reads <code>transitionState.from</code> to spawn the character at the exit side.
    </p>
    <p>
      The camera follows the player by updating reactive position refs from the character's
      <code>moved</code> emit. The camera offset is applied in the template binding.
    </p>
  </GuideLayout>
</template>
