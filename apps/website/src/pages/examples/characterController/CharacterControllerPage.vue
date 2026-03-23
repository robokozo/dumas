<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CharacterControllerScene from "./CharacterControllerScene.vue";
import CharacterControllerCode from "./CharacterControllerScene.vue?raw";
</script>

<template>
  <DemoLayout slug="character-controller">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always">
        <CharacterControllerScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useCharacterController</code> creates a kinematic character backed by Rapier's
          native KCC. Gravity, slope handling, and ground detection are managed internally — you
          provide horizontal input each frame and call <code>jump()</code> when needed.
        </p>
        <p>
          <code>isGrounded</code> is a reactive ref updated every frame. The character turns
          <strong style="color: #4af">blue</strong> when grounded and
          <strong style="color: #f8a">pink</strong> while airborne.
        </p>
        <p>
          Use <strong>A / D</strong> or <strong>← →</strong> to move,
          <strong>Space / W / ↑</strong> to jump. Try landing on the elevated platform.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="CharacterControllerCode" />
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
