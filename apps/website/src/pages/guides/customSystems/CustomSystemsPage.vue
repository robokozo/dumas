<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CustomSystemsScene from "./CustomSystemsScene.vue";
import SpinningBoxCode from "./SpinningBox.vue?raw";
</script>

<template>
  <DemoLayout slug="custom-systems">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always">
        <CustomSystemsScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useSystem</code> registers a function that runs every frame. It receives
          <code>delta</code> (seconds since last frame) and <code>elapsed</code> (total time since
          start).
        </p>
        <p>
          Use <code>delta</code> for frame-rate-independent movement. Systems run before the physics
          step each frame and automatically unregister when the component unmounts.
        </p>
        <p>
          The box rotates at 1 radian/sec and bobs up and down using
          <code>Math.sin(elapsed)</code>.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="SpinningBoxCode" />
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
