<script setup lang="ts">
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import JointsScene from "./JointsScene.vue";
import PendulumCode from "./Pendulum.vue?raw";
</script>

<template>
  <DemoLayout slug="joints">
    <template #scene>
      <SiteCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <JointsScene />
      </SiteCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useJoint</code> creates a constraint between two rigid bodies. You specify anchor
          points on each body and a joint type:
        </p>
        <ul>
          <li><strong>spherical</strong> — ball-and-socket, free rotation</li>
          <li><strong>revolute</strong> — hinge, rotates around one axis</li>
          <li><strong>fixed</strong> — locks bodies together rigidly</li>
          <li><strong>prismatic</strong> — slides along one axis</li>
        </ul>
        <p>
          This pendulum uses a spherical joint connecting a fixed anchor to a dynamic ball. Gravity
          does the rest.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="PendulumCode" />
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
