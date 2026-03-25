<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import WorldSetupScene from "./WorldSetupScene.vue";
import WorldSetupCode from "./WorldSetupScene.vue?raw";
</script>

<template>
  <DemoLayout slug="world-setup">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always">
        <WorldSetupScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>DumasCanvas</code> initializes the Rapier physics engine, creates the ECS world, and
          sets up the render loop. It wraps TresCanvas and waits for the WASM module to load before
          rendering children.
        </p>
        <p>
          <code>GameObject</code> creates an entity and places it in the scene. Pass
          <code>position</code> as <code>[x, y, z]</code>, <code>rotation</code> as a quaternion
          <code>[x, y, z, w]</code>, and <code>scale</code> as <code>[x, y, z]</code>.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="WorldSetupCode" />
      </section>
    </template>
  </DemoLayout>
</template>

<style scoped>
section {
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.5rem;
}

p {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 0.5rem;
}

code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #ccc;
}
</style>
