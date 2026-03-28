<script setup lang="ts">
import WorldSetupScene from "./WorldSetupScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import worldSetupSceneSource from "./WorldSetupScene.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <WorldSetupScene />
    </template>

    <h1>&lt;World&gt;</h1>
    <p>
      <code>&lt;World&gt;</code> is the root of every Dumas scene. It mounts a
      <code>TresCanvas</code>, creates a bitECS world, and provides both down the component tree via
      <code>useWorld()</code>.
    </p>

    <h2>Scene</h2>
    <p>
      <code>&lt;Scene name="…"&gt;</code> groups entities under a named context. Multiple scenes can
      be defined at once; only the active one renders. Transition between them with
      <code>loadScene({ name })</code> from <code>useWorld()</code>.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="worldSetupSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
