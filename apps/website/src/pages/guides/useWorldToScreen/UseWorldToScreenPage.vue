<script setup lang="ts">
import UseWorldToScreenGame from "./UseWorldToScreenGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useWorldToScreenSceneSource from "./UseWorldToScreenScene.vue?raw";

const BASIC_USAGE = `const { eid } = useEcsComponent({ components: {} });

// Projects the entity's 3D position to screen coordinates every frame.
const { x, y, isVisible } = useWorldToScreen({ eid });`;

const OVERLAY_TEMPLATE = `<template #overlay>
  <div
    v-show="isVisible.value === true"
    :style="{ left: x.value + 'px', top: y.value + 'px' }"
    style="position: absolute; transform: translateX(-50%); pointer-events: none"
  >
    Player Name
  </div>
</template>`;

const MULTIPLE_ENTITIES = `const entities = [playerEid, enemyEid, npcEid];

const labels = entities.map((eid) => {
  const { x, y, isVisible } = useWorldToScreen({ eid });
  return { eid, x, y, isVisible };
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseWorldToScreenGame />
    </template>

    <h1>World to Screen</h1>
    <p>
      <code>useWorldToScreen</code> projects an entity's 3D world position to 2D screen coordinates
      every frame. Use the returned <code>x</code> and <code>y</code> values to position DOM overlay
      content -- health bars, name tags, damage numbers -- directly above entities in the 3D scene.
    </p>
    <p>
      The composable also returns an <code>isVisible</code> ref that is <code>true</code> only when
      the entity is in front of the camera, so you can hide labels for entities behind the viewer.
    </p>

    <h2>Basic usage</h2>
    <p>
      Call <code>useWorldToScreen</code> with the entity ID from <code>useEcsComponent</code>. It
      reads the entity's transform position each frame and projects it through the active camera.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC_USAGE" />
    </div>

    <h2>Overlay template</h2>
    <p>
      Place DOM content in the scene's <code>#overlay</code> slot. Position it with the returned
      <code>x</code> and <code>y</code> values, and hide it when <code>isVisible</code> is
      <code>false</code>. Use <code>pointer-events: none</code> so the label does not intercept
      mouse events meant for the 3D canvas.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="vue-html" :code="OVERLAY_TEMPLATE" />
    </div>

    <h2>Multiple entities</h2>
    <p>
      Call <code>useWorldToScreen</code> once per entity. Each call registers its own system that
      updates independently, so you can track as many entities as you need.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="MULTIPLE_ENTITIES" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useWorldToScreenSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
