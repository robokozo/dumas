<script setup lang="ts">
import UseCollisionGame from "./UseCollisionGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useCollisionSceneSource from "./UseCollisionScene.vue?raw";

const SETUP_CODE = `const wallCollision = useCollision({
  onContact({ source, target }) {
    // source — the body the handler is attached to
    // target — the other body involved in the contact
  },
  onContactEnd({ source, target }) {
    // fires when the two bodies separate
  },
});`;

const BIND_CODE = `<RigidBody
  type="fixed"
  :active-collision="true"
  @collision-enter="wallCollision.onCollisionEnter"
>
  ...
</RigidBody>`;

const COVERAGE_CODE = `const redWallCollision = useCollision({
  onContact() { ballColor.value = RED_COLOR; },
});

const blueWallCollision = useCollision({
  onContact() { ballColor.value = BLUE_COLOR; },
});

// Ball handler: fires when the ball is the primary body.
// Reads the target collider's world X to identify which wall was hit.
const ballCollision = useCollision({
  onContact({ target }) {
    const wallX = target.context.collider.translation().x;
    ballColor.value = wallX < 0 ? RED_COLOR : BLUE_COLOR;
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
      <code>useCollision</code> wraps <code>@tresjs/rapier</code>'s collision events into typed
      callbacks. Enable <code>activeCollision</code> on any <code>&lt;RigidBody&gt;</code>, bind the
      returned handlers, and react whenever two bodies make or break contact.
    </p>

    <h2>Set up a collision listener</h2>
    <p>
      Call <code>useCollision</code> with an <code>onContact</code> callback. It returns
      <code>onCollisionEnter</code> and <code>onCollisionExit</code> handlers to bind in the
      template. The callback receives the full <code>source</code> and <code>target</code> context
      for both bodies — including their Rapier collider and rigid body instances.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SETUP_CODE" />
    </div>

    <h2>Bind to a RigidBody</h2>
    <p>
      Add <code>:active-collision=&quot;true&quot;</code> to each body that should generate events,
      then wire the handler to <code>@collision-enter</code>.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="vue" :code="BIND_CODE" />
    </div>

    <h2>Coverage across both sides</h2>
    <p>
      Rapier fires the collision event on exactly one body per contact pair — whichever it assigns
      as the primary handle. To guarantee the callback fires regardless of ordering, attach handlers
      to all participating bodies. The demo below attaches handlers to both walls
      <em>and</em> the ball; the wall handlers know their own color, and the ball's handler reads
      the target's world position to decide which wall it hit.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="COVERAGE_CODE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useCollisionSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
