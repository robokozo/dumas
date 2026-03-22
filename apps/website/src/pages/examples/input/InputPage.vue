<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import InputScene from "./InputScene.vue";
import InputSceneCode from "./InputScene.vue?raw";
</script>

<template>
  <DemoLayout slug="player-input">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <InputScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useInput</code> maps physical keys or gamepad buttons to the standard hardware
          layout: <code>south</code>, <code>east</code>, <code>lb</code>, <code>dpadUp</code>, etc.
        </p>
        <p>
          <code>useActionMap</code> sits on top and translates hardware names into game-specific
          semantics. Map <code>south</code> to <code>"jump"</code>, <code>leftStick</code> to
          <code>"move"</code> — then game code only ever references action names, never keys.
        </p>
        <p>
          The same action map can be shared across multiple players using different input sources.
          Swap in a gamepad instance for P2 and the game logic stays identical.
        </p>
      </section>
      <section>
        <h2>Controls</h2>
        <table>
          <tbody>
            <tr>
              <td><kbd>W A S D</kbd> or arrows</td>
              <td>Move</td>
            </tr>
            <tr>
              <td><kbd>Space</kbd></td>
              <td>Jump</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="InputSceneCode" />
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

table {
  border-collapse: collapse;
  font-size: 0.85rem;
  color: #999;
}

td {
  padding: 0.3rem 1rem 0.3rem 0;
  vertical-align: middle;
}

kbd {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: #ccc;
}
</style>
