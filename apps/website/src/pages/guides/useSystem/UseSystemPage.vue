<script setup lang="ts">
import UseSystemScene from "./UseSystemScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import spinningCubeSource from "./SpinningCube.vue?raw";
import waveSystemSource from "./WaveSystem.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseSystemScene />
    </template>

    <h1>useSystem</h1>
    <p>
      <code>useSystem({ fn })</code> registers a per-frame callback that runs inside TresJS's render
      loop. Use it for animations and game logic — avoid Vue reactivity inside the callback where
      possible.
    </p>

    <h2>Basic usage</h2>
    <p>
      Pass <code>fn</code> to run logic every frame. The callback receives
      <code>delta</code> (seconds since the last frame) and <code>elapsed</code> (total seconds
      since the loop started). Each component registers its own system and drives its own state.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="spinningCubeSource" lang="vue" />
    </div>

    <h2>Query shorthand</h2>
    <p>
      Pass <code>components</code> alongside <code>fn</code> to automatically query all matching
      entities each frame. The results arrive as <code>entities</code> in the callback — one system
      drives every entity that has a particular set of components. This is what the demo above uses.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="waveSystemSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
