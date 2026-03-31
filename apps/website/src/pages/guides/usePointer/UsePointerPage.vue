<script setup lang="ts">
import UsePointerGame from "./UsePointerGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import usePointerSceneSource from "./UsePointerScene.vue?raw";

const BASIC_USAGE = `import { usePointer, useSystem } from "@dumas/core";

const pointer = usePointer();

// pointer.x          — screen X (pixels, relative to canvas)
// pointer.y          — screen Y (pixels, relative to canvas)
// pointer.ndcX       — normalized device coordinate X (-1 to 1)
// pointer.ndcY       — normalized device coordinate Y (-1 to 1)
// pointer.isDown     — true while the pointer is held
// pointer.isPressed  — true for one frame when pressed
// pointer.isReleased — true for one frame when released
// pointer.isOver     — true when the pointer is over the canvas`;

const READING_POSITION = `useSystem({
  fn: () => {
    // All values are ShallowRefs — read .value inside the system.
    const ndc = {
      x: pointer.ndcX.value,
      y: pointer.ndcY.value,
    };
    console.log("Pointer NDC:", ndc.x, ndc.y);
  },
});`;

const RAYCAST_ON_CLICK = `import { usePointer, useSystem } from "@dumas/core";
import type { Mesh } from "three";

const pointer = usePointer();
const cubeRef = shallowRef<Mesh | null>(null);

useSystem({
  fn: () => {
    if (pointer.isPressed.value === true) {
      // Raycast against specific objects, or omit to hit the whole scene.
      const hits = pointer.raycast({ objects: [cubeRef.value!] });

      if (hits.length > 0) {
        console.log("Hit!", hits[0].point);
      }
    }
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UsePointerGame />
    </template>

    <h1>Pointer Input</h1>
    <p>
      <code>usePointer</code> tracks pointer and touch state relative to the TresCanvas. It provides
      screen-space coordinates, normalized device coordinates (NDC), one-frame press/release edge
      detection, and a built-in raycasting helper for picking 3D objects.
    </p>
    <p>
      Call <code>usePointer()</code> inside any component that is a descendant of
      <code>&lt;TresCanvas&gt;</code>. The returned refs update automatically as the user moves,
      presses, or releases the pointer.
    </p>

    <h2>Basic usage</h2>
    <p>
      The composable returns shallow refs for position, press state, and a
      <code>raycast</code> function. Use these inside a <code>useSystem</code> callback to react
      every frame.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC_USAGE" />
    </div>

    <h2>Reading pointer position</h2>
    <p>
      Screen-space coordinates (<code>x</code>, <code>y</code>) are in pixels relative to the
      canvas. NDC coordinates (<code>ndcX</code>, <code>ndcY</code>) range from -1 to 1 and are used
      for raycasting internally.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="READING_POSITION" />
    </div>

    <h2>Raycasting on click</h2>
    <p>
      The <code>raycast</code> method casts a ray from the camera through the current pointer
      position. Pass specific objects to test against, or omit the parameter to raycast against the
      entire scene. The return value is an array of Three.js <code>Intersection</code> objects,
      sorted by distance.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="RAYCAST_ON_CLICK" />
    </div>

    <h2>Demo source</h2>
    <p>Click the cubes to toggle their color. The overlay shows the current NDC coordinates.</p>
    <div class="code-wrap">
      <CodeBlock :code="usePointerSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
