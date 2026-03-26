<script setup lang="ts">
import { ref } from "vue";
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import MageViewerScene from "./MageViewerScene.vue";
import MageViewerCode from "./MageViewerScene.vue?raw";

const camX = ref(0);
const camY = ref(0);
const camZ = ref(0);
const targetX = ref(0);
const targetY = ref(0);
const targetZ = ref(0);

function onCameraChange(
  px: number,
  py: number,
  pz: number,
  tx: number,
  ty: number,
  tz: number,
): void {
  camX.value = px;
  camY.value = py;
  camZ.value = pz;
  targetX.value = tx;
  targetY.value = ty;
  targetZ.value = tz;
}
</script>

<template>
  <DemoLayout slug="3d-models">
    <template #scene>
      <div class="scene-wrapper">
        <SiteCanvas clear-color="#111" render-mode="always">
          <MageViewerScene
            @camera-change="(px, py, pz, tx, ty, tz) => onCameraChange(px, py, pz, tx, ty, tz)"
          />
        </SiteCanvas>
        <div class="cam-debug">
          <div>pos &nbsp;[{{ camX }}, {{ camY }}, {{ camZ }}]</div>
          <div>look [{{ targetX }}, {{ targetY }}, {{ targetZ }}]</div>
        </div>
      </div>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useGLTF</code> from <code>@tresjs/cientos</code> loads a <code>.glb</code> or
          <code>.gltf</code> file and returns the parsed scene graph along with nodes, materials,
          and animation clips.
        </p>
        <p>
          The loaded GLTF is available as <code>state.scene</code> — a standard Three.js
          <code>Group</code>. Pass it to <code>&lt;primitive :object="state.scene" /&gt;</code> to
          insert it into the TresJS scene tree.
        </p>
        <p>
          <code>useGLTF</code> is async — use <code>await</code> directly in
          <code>&lt;script setup&gt;</code>. TresJS provides a Suspense boundary inside the canvas
          so the scene renders once the model is ready.
        </p>
      </section>
      <section>
        <h2>Placing model files</h2>
        <p>
          Put <code>.glb</code> files in <code>apps/website/public/models/</code>. Vite serves the
          <code>public/</code> directory at the root, so <code>public/models/Mage.glb</code> is
          available at <code>/models/Mage.glb</code> at runtime.
        </p>
      </section>
      <section>
        <h2>Adding animations</h2>
        <p>
          If the GLB includes embedded animation clips, <code>useGLTF</code> returns them in the
          <code>animations</code> array. Pass those alongside the <code>scene</code> to
          <code>useAnimations</code> to get named <code>AnimationAction</code> objects you can play
          and crossfade.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="MageViewerCode" />
      </section>
    </template>
  </DemoLayout>
</template>

<style scoped>
.scene-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.cam-debug {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  color: #4af;
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  pointer-events: none;
}

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
