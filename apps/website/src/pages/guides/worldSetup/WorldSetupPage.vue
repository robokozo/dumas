<script setup lang="ts">
import WorldSetupScene from "./WorldSetupScene.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import spinningCubeSource from "./SpinningCube.vue?raw";
</script>

<template>
  <div class="page">
    <div class="demo">
      <WorldSetupScene />
    </div>

    <div class="content">
      <h1>World Setup</h1>
      <p>
        <code>&lt;World&gt;</code> is the root of every Dumas scene. It mounts a
        <code>TresCanvas</code>, creates a bitECS world, and provides both down the component tree
        via <code>useWorld()</code>.
      </p>

      <h2>Scene</h2>
      <p>
        <code>&lt;Scene name="…"&gt;</code> groups entities under a named context. You can have
        multiple scenes defined at once; only the active one renders. Transition between them with
        <code>loadScene({ name })</code> from <code>useWorld()</code>.
      </p>

      <h2>useSystem</h2>
      <p>
        <code>useSystem({ fn })</code> registers a per-frame callback that runs inside TresJS's
        render loop. Use it for animations and game logic — avoid Vue reactivity inside the
        callback.
      </p>

      <div class="code-wrap">
        <CodeBlock :code="spinningCubeSource" lang="vue" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  font-family: sans-serif;
  color: #eee;
  background: #111;
}

.demo {
  height: 100%;
}

.content {
  padding: 2.5rem 2rem;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}

h2 {
  font-size: 1rem;
  margin: 1.75rem 0 0.4rem;
  color: #fff;
}

p {
  font-size: 0.875rem;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

code {
  background: rgba(255, 255, 255, 0.07);
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.85em;
  color: #4af;
}

.code-wrap {
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
