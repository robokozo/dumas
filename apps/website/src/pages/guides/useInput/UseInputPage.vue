<script setup lang="ts">
import UseInputGame from "./UseInputGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useInputSceneSource from "./UseInputScene.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseInputGame />
    </template>

    <h1>Input</h1>
    <p>
      <code>useInput</code> maps physical inputs — keyboard keys and gamepad buttons — to named game
      actions. Game code only ever reads actions, never raw keys. Rebinding a control means changing
      one line in the input map.
    </p>

    <h2>Define an input map</h2>
    <p>
      <code>defineInputMap</code> takes an object where each key is an action name and each value is
      a function that receives the current input sources and returns a
      <code>boolean</code> (digital) or <code>number</code> (analog). Define it once at module level
      — it's pure data.
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`const INPUT_MAP = defineInputMap({
  left:   ({ keys }) => keys.a?.value === true || keys.arrowleft?.value === true,
  right:  ({ keys }) => keys.d?.value === true || keys.arrowright?.value === true,
  action: ({ keys }) => keys.space?.value === true,

  // Gamepad example:
  // moveX: ({ gamepad }) => gamepad.value?.axes[0] ?? 0,
});`"
      />
    </div>

    <h2>Read actions</h2>
    <p>
      Call <code>useInput({ map })</code> inside a component that lives inside a
      <code>&lt;Scene&gt;</code>. It returns three objects, one per edge type:
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`const { held, pressed, released } = useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed, released }) => {
    // held    — true every frame the action is active
    // pressed — true for exactly one frame when the action becomes active
    // released— true for exactly one frame when the action becomes inactive
    if (held.left.value)      position.x -= speed * delta;
    if (pressed.action.value)  spawnProjectile();  // fires once per press
    if (released.action.value) playLandAnimation();
  },
});`"
      />
    </div>

    <h2>Analog actions</h2>
    <p>
      When the map function returns a <code>number</code>, <code>held</code> carries the raw analog
      value. <code>pressed</code> and <code>released</code> trigger when the value crosses the
      built-in deadzone threshold (0.1).
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`const INPUT_MAP = defineInputMap({
  moveX: ({ keys, gamepad }) => {
    if (keys.a?.value === true) return -1;
    if (keys.d?.value === true) return  1;
    return gamepad.value?.axes[0] ?? 0;
  },
});

const { held } = useInput({ map: INPUT_MAP });
// held.moveX.value is a number from -1 to 1`"
      />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useInputSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
