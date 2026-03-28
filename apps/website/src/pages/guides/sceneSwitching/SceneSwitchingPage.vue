<script setup lang="ts">
import SceneSwitchingGame from "./SceneSwitchingGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSwitchingSceneSource from "./SceneSwitchingGame.vue?raw";
import sceneControlsSource from "./SceneControls.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <SceneSwitchingGame />
    </template>

    <h1>Scene Switching</h1>
    <p>
      Each <code>&lt;Scene name="…"&gt;</code> only renders when it is the active scene. Use
      <code>loadScene({ name })</code> from <code>useGame()</code> to transition between them. The
      <code>:default="true"</code> prop marks which scene renders on first load before any
      transition has occurred.
    </p>

    <h2>Overlay UI</h2>
    <p>
      The <code>#overlay</code> slot renders on top of the canvas with
      <code>pointer-events: none</code> by default — set <code>pointer-events: auto</code> on
      individual elements that need to receive clicks. Components in the overlay can call
      <code>useGame()</code> because they are still descendants of <code>&lt;Game&gt;</code>.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="sceneSwitchingSceneSource" lang="vue" />
    </div>

    <div class="code-wrap">
      <CodeBlock :code="sceneControlsSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
