<script setup lang="ts">
import { ref } from "vue";
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CannonWallScene from "./CannonWallScene.vue";
import CannonWallCode from "./CannonWallScene.vue?raw";

const fireCount = ref<number>(0);

function handleFire(): void {
  fireCount.value++;
}
</script>

<template>
  <DemoLayout slug="cannon-wall">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <CannonWallScene :fire-count="fireCount" />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>Putting it all together</h2>
        <p>
          This demo combines everything: <code>DumasCanvas</code> with gravity,
          <code>GameObject</code> + <code>RigidBody</code> + <code>Collider</code> for the wall
          blocks, <code>useObjectPool</code> for cannonball recycling, and
          <code>useSystem</code> for cleanup logic.
        </p>
        <p>
          Click the button below or click in the scene to fire cannonballs at the wall. Use orbit
          controls to change the camera angle.
        </p>
      </section>
      <section>
        <button @click="handleFire">Fire Cannonball</button>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="CannonWallCode" />
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

button {
  background: #4af;
  color: #111;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

button:hover {
  background: #5bf;
}
</style>
