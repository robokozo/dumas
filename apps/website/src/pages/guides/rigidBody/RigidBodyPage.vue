<script setup lang="ts">
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import RigidBodyScene from "./RigidBodyScene.vue";
import RigidBodyCode from "./RigidBodyScene.vue?raw";
</script>

<template>
  <DemoLayout slug="rigid-body">
    <template #scene>
      <SiteCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <RigidBodyScene />
      </SiteCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>RigidBody</code> attaches a physics body to a <code>GameObject</code>. The
          <code>type</code> prop controls behavior:
        </p>
        <ul>
          <li><strong>dynamic</strong> — affected by gravity and forces</li>
          <li><strong>fixed</strong> — immovable, used for floors and walls</li>
          <li><strong>kinematicPosition</strong> — moved via script, pushes dynamic bodies</li>
        </ul>
        <p>
          The blue ball falls under gravity (dynamic). The gray platform stays in place (fixed). The
          orange sphere slides back and forth (kinematicPosition).
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="RigidBodyCode" />
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

ul {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.8;
  padding-left: 1.25rem;
  margin: 0 0 0.5rem;
}

strong {
  color: #ccc;
}

code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #ccc;
}
</style>
