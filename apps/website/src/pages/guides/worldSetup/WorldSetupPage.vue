<script setup lang="ts">
import WorldSetupScene from "./WorldSetupScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import spinningCubeSource from "./SpinningCube.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <WorldSetupScene />
    </template>

    <h1>World Setup</h1>
    <p>
      <code>&lt;World&gt;</code> is the root of every Dumas scene. It mounts a
      <code>TresCanvas</code>, creates a bitECS world, and provides both down the component tree via
      <code>useWorld()</code>.
    </p>

    <h2>Scene</h2>
    <p>
      <code>&lt;Scene name="…"&gt;</code> groups entities under a named context. You can have
      multiple scenes defined at once; only the active one renders. Transition between them with
      <code>loadScene({ name })</code> from <code>useWorld()</code>.
    </p>

    <h2>useSystem</h2>
    <p>
      <code>useSystem({ fn })</code> registers a per-frame callback that runs inside TresJS's render
      loop. Use it for animations and game logic — avoid Vue reactivity inside the callback.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="spinningCubeSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
