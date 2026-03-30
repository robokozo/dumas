<script setup lang="ts">
import UseEcsComponentGame from "./UseEcsComponentGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import orbitingCubeSource from "./OrbitingCube.vue?raw";

const BASIC_USAGE = `const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({ type: "dynamic", colliders: { box: createCuboidCollider({ halfExtents: [0.5, 0.5, 0.5] }) } }),
    health:  createHealth({ max: 100 }),
  },
});

// Set the initial position right after — physics reads it before the first step.
transform.posX.value = 0;
transform.posY.value = 5;
transform.posZ.value = 0;`;

const TRANSFORM_INFO = `// transform is always present — you never need to add it manually.
const { eid, transform } = useEcsComponent({ components: {} });

transform.posX.value   // ShallowRef<number> — X position
transform.posY.value   // ShallowRef<number> — Y position
transform.posZ.value   // ShallowRef<number> — Z position
transform.rotX.value   // ShallowRef<number> — quaternion X
transform.rotY.value   // ShallowRef<number> — quaternion Y
transform.rotZ.value   // ShallowRef<number> — quaternion Z
transform.rotW.value   // ShallowRef<number> — quaternion W (defaults to 1)
transform.scaleX.value // ShallowRef<number> — scale X (defaults to 1)
transform.scaleY.value // ShallowRef<number> — scale Y (defaults to 1)
transform.scaleZ.value // ShallowRef<number> — scale Z (defaults to 1)`;

const FN_USAGE = `// fn receives delta, elapsed, and all component slices + transform.
// It runs every frame as a registered system — no separate useSystem call needed.
const { eid, transform } = useEcsComponent({
  components: {},
  fn: ({ delta, elapsed, transform }) => {
    transform.posY.value = Math.sin(elapsed * 2.5) * 1.5;
    transform.rotY.value += delta * 1.2;
  },
});`;

const DUMAS_ENTITY = `<!-- DumasEntity wraps a THREE.Group and syncs transform → group each frame. -->
<!-- Nest any TresJS geometry inside it. -->
<DumasEntity :eid="eid">
  <TresMesh>
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial color="#4ecdc4" />
  </TresMesh>
</DumasEntity>`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseEcsComponentGame />
    </template>

    <h1>useEcsComponent</h1>
    <p>
      <code>useEcsComponent</code> creates a bitECS entity and attaches the declared component
      factories to it. It is the primary way to introduce a game object into the world. Components
      are registered synchronously in setup and cleaned up automatically on unmount.
    </p>

    <h2>Transform — always attached</h2>
    <p>
      Every entity has a transform. You never include it in your component map — it is added
      automatically, like Unity's mandatory <code>Transform</code> component. The returned
      <code>transform</code> object holds ten <code>ShallowRef</code> fields: position, quaternion
      rotation, and scale.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="TRANSFORM_INFO" />
    </div>

    <h2>Attaching components</h2>
    <p>
      Pass component factories in the <code>components</code> map. Each factory is called once to
      produce a shared store, then the entity's slot in that store is initialised. Set initial
      transform values immediately after the call returns.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC_USAGE" />
    </div>

    <h2>Per-entity frame logic</h2>
    <p>
      Pass an optional <code>fn</code> to co-locate per-frame behavior with the entity. It receives
      <code>delta</code>, <code>elapsed</code>, <code>transform</code>, and slices of every
      component store. No separate <code>useSystem</code> call is needed.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="FN_USAGE" />
    </div>

    <h2>Rendering with DumasEntity</h2>
    <p>
      <code>&lt;DumasEntity :eid="eid"&gt;</code> wraps a <code>THREE.Group</code> and registers a
      priority-100 system that writes the entity's transform store values to the group's position,
      quaternion, and scale every frame. Nest TresJS geometry inside it.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="html" :code="DUMAS_ENTITY" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="orbitingCubeSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
