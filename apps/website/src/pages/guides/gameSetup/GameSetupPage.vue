<script setup lang="ts">
import GameSetupScene from "./GameSetupScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import gameSetupSceneSource from "./GameSetupScene.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <GameSetupScene />
    </template>

    <h1>&lt;Game&gt;</h1>
    <p>
      <code>&lt;Game&gt;</code> is the root of every Dumas scene. It mounts a
      <code>TresCanvas</code>, creates a bitECS world, and provides both down the component tree via
      <code>useGame()</code>.
    </p>

    <h2>Scene</h2>
    <p>
      <code>&lt;Scene name="…"&gt;</code> groups entities under a named context. Multiple scenes can
      be defined at once; only the active one renders. Transition between them with
      <code>loadScene({ name })</code> from <code>useGame()</code>.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="gameSetupSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
