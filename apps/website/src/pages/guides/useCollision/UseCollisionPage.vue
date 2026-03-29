<script setup lang="ts">
import UseCollisionGame from "./UseCollisionGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useCollisionSceneSource from "./UseCollisionScene.vue?raw";

const SETUP_CODE = `const ballCollider = computed(
  () => ballRef.value?.context?.colliders?.[0]?.collider ?? null,
);

useCollision({
  collider: ballCollider,
  onContact({ other }) {
    // other — the Rapier collider this body is touching
  },
  onContactEnd({ other }) {
    // fires when the two bodies separate
  },
});`;

const BALL_CODE = `const ballColor = shallowRef(props.leftColor);

useCollision({
  collider: ballCollider,
  onContact({ other }) {
    const wallX = other.translation().x;
    ballColor.value = wallX < 0 ? props.leftColor : props.rightColor;
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseCollisionGame />
    </template>

    <h1>Collision Events</h1>
    <p>
      <code>useCollision</code> detects when a physics body makes or breaks contact with another
      body. Pass it a ref to a Rapier collider and it polls <code>world.contactPairsWith</code> each
      frame, calling <code>onContact</code> on the first frame two bodies touch and
      <code>onContactEnd</code> when they separate.
    </p>

    <h2>Set up a collision listener</h2>
    <p>
      Derive a collider ref from the <code>&lt;RigidBody&gt;</code>'s exposed context, then pass it
      to <code>useCollision</code>. The composable must be called inside a component that is a
      descendant of <code>&lt;Physics&gt;</code>.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SETUP_CODE" />
    </div>

    <h2>Demo: ball that changes color on impact</h2>
    <p>
      The ball bounces between a left and right wall. On each contact,
      <code>onContact</code> reads the other collider's world X position to decide which wall was
      hit and updates the ball's color to match.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BALL_CODE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useCollisionSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
