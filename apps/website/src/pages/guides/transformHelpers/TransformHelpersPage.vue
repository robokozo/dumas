<script setup lang="ts">
import TransformHelpersGame from "./TransformHelpersGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import transformHelpersSceneSource from "./TransformHelpersScene.vue?raw";

const SET_ROTATION_Y_CODE = `// Spin an entity around the Y axis over time.
// setRotationY converts a single radian angle into quaternion values,
// so you never touch sin/cos yourself.
useSystem({
  fn: ({ elapsed }) => {
    transform.setRotationY({ angle: elapsed });
  },
});`;

const SET_EULER_CODE = `// Animate rotation on all three axes independently.
// setEuler converts Euler angles (radians, intrinsic XYZ) to a quaternion.
useSystem({
  fn: ({ elapsed }) => {
    transform.setEuler({
      x: elapsed * 0.7,
      y: elapsed * 1.3,
      z: elapsed * 0.5,
    });
  },
});`;

const LOOK_AT_CODE = `// Make an entity face a target position on the XZ plane.
// lookAt computes the Y-axis rotation from the entity's current position
// to the target coordinates.
useSystem({
  fn: () => {
    transform.lookAt({ x: target.posX.value, z: target.posZ.value });
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <TransformHelpersGame />
    </template>

    <h1>Transform Helpers</h1>
    <p>
      Entity transforms in Dumas store rotation as a quaternion (<code>rotX</code>,
      <code>rotY</code>, <code>rotZ</code>, <code>rotW</code>). Quaternions avoid gimbal lock and
      interpolate smoothly, but writing raw quaternion math for everyday rotations is tedious and
      error-prone. The sliced transform returned by <code>useEcsComponent</code> includes three
      helper methods that convert friendly inputs into the underlying quaternion, eliminating manual
      <code>Math.sin</code> / <code>Math.cos</code>
      calls.
    </p>

    <h2>setRotationY</h2>
    <p>
      Sets a pure Y-axis rotation from an angle in radians. Useful for turntable-style spinning,
      facing a compass direction, or any rotation that stays upright.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SET_ROTATION_Y_CODE" />
    </div>

    <h2>setEuler</h2>
    <p>
      Converts Euler angles (radians, intrinsic XYZ order) to a quaternion. Each axis is optional
      and defaults to <code>0</code>. Use this when you need independent control over pitch, yaw,
      and roll simultaneously.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SET_EULER_CODE" />
    </div>

    <h2>lookAt</h2>
    <p>
      Rotates the entity around the Y axis so it faces a target position on the XZ plane. The method
      reads the entity's current <code>posX</code> and <code>posZ</code> to compute the direction,
      so it works correctly regardless of where the entity is placed.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="LOOK_AT_CODE" />
    </div>

    <h2>Scene source</h2>
    <div class="code-wrap">
      <CodeBlock :code="transformHelpersSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
