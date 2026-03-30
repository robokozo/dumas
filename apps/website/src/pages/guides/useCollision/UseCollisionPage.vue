<script setup lang="ts">
import UseCollisionGame from "./UseCollisionGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useCollisionSceneSource from "./UseCollisionScene.vue?raw";
import bouncingBallSource from "./BouncingBall.vue?raw";

const PER_COLLIDER_CODE = `// Collision callbacks are defined directly on the collider config —
// they close over the component's reactive state.
const health = ref(100);

const { eid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        // Each collider can have its own onCollision and onCollisionEnd.
        torso: createCuboidCollider({
          halfExtents: [0.3, 0.5, 0.3],
          onCollision: ({ otherCollider, which, otherEid }) => {
            health.value -= 10;
          },
          onCollisionEnd: ({ otherCollider, which, otherEid }) => {
            // fires when the two bodies separate
          },
        }),
        head: createSphereCollider({
          radius: 0.2,
          onCollision: ({ otherCollider, which, otherEid }) => {
            // head-shot — extra damage
            health.value -= 30;
          },
        }),
      },
    }),
  },
});`;

const CALLBACK_PARAMS = `onCollision: ({ otherCollider, which, otherEid }) => { ... }
// otherCollider — the Rapier Collider on the other body
// which         — the name of the collider on *this* entity that was hit ("torso", "head", etc.)
// otherEid      — the bitECS entity ID of the other body, or null if it has none`;

const BALL_CODE = `// The callback closes over the Vue ref — no useCollision composable needed.
const color = ref(props.leftColor);

const { eid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        shell: createSphereCollider({
          radius: 0.5,
          restitution: 1,
          onCollision: ({ otherCollider }) => {
            color.value = otherCollider.translation().x < 0
              ? props.leftColor
              : props.rightColor;
          },
        }),
      },
    }),
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
      Collision callbacks in Dumas are defined directly on the collider config, not in a separate
      composable. Because the callback is written inside <code>setup</code>, it closes over reactive
      state — refs, props, emits — without any extra wiring.
    </p>
    <p>
      Under the hood, <code>createPhysics</code> polls <code>world.contactPairsWith</code> each
      frame (via a registered system) and fires <code>onCollision</code> on the first frame two
      bodies touch and <code>onCollisionEnd</code> when they separate.
    </p>

    <h2>Per-collider callbacks</h2>
    <p>
      Each named collider inside <code>createPhysics</code> can have its own
      <code>onCollision</code> and <code>onCollisionEnd</code>. This lets different parts of a body
      (head vs. torso) trigger different logic, all in one <code>useEcsComponent</code> call.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="PER_COLLIDER_CODE" />
    </div>

    <h2>Callback parameters</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="CALLBACK_PARAMS" />
    </div>

    <h2>Demo: ball that changes color on impact</h2>
    <p>
      The ball bounces between a left and right wall. The <code>onCollision</code> callback reads
      the other collider's world X position to decide which wall was hit, then updates a
      <code>ref</code> that drives the material color.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BALL_CODE" />
    </div>

    <h2>Ball component source</h2>
    <div class="code-wrap">
      <CodeBlock :code="bouncingBallSource" lang="vue" />
    </div>

    <h2>Scene source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useCollisionSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
