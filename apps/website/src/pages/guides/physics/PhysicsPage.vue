<script setup lang="ts">
import PhysicsGame from "./PhysicsGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./PhysicsScene.vue?raw";
import boxSource from "./PhysicsBox.vue?raw";

const INIT_CODE = `// Call once at the top of a scene's setup.
// WASM loads in the background — no await needed, no <Suspense> required.
usePhysics({ gravity: [0, -9.81, 0] });`;

const CREATE_PHYSICS = `// createPhysics returns a ComponentFactory.
// It can be called inline in component setup — a stable __type symbol is used
// as the storeRegistry key, so the same shared store is reused across renders.
const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.5, 0.5, 0.5] }),
      },
    }),
  },
});

// Set transform values after useEcsComponent returns.
// createPhysics reads them in a vueOnMounted hook before the first physics step,
// so the body spawns at exactly this position.
transform.posX.value = props.position[0];
transform.posY.value = props.position[1];
transform.posZ.value = props.position[2];`;

const SYNC_EXPLANATION = `// No usePhysicsSync call needed.
// createPhysics registers a priority-0 system automatically that writes:
//   body.translation() → transform.posX/Y/Z
//   body.rotation()    → transform.rotX/Y/Z/W
//
// DumasEntity's priority-100 system then reads those values and updates the
// THREE.Group position/quaternion/scale — so the mesh follows the body.`;

const BODY_OPTIONS = `createPhysics({
  type: "dynamic",          // "dynamic" | "fixed" | "kinematicPositionBased" | "kinematicVelocityBased"
  gravityScale: 1,
  linearDamping: 0,
  angularDamping: 0,
  lockTranslations: false,
  lockRotations: false,
  enabledTranslations: [true, true, true],
  enabledRotations: [true, true, true],
  linvel: { x: 0, y: 0, z: 0 },
  angvel: { x: 0, y: 0, z: 0 },
  enableCcd: false,
  colliders: { ... },
})`;

const COLLIDER_FACTORIES = `// createCuboidCollider — box-shaped collider
createCuboidCollider({ halfExtents: [0.5, 0.5, 0.5], friction: 0.5, restitution: 0 })

// createSphereCollider — sphere-shaped collider
createSphereCollider({ radius: 0.5, friction: 0.5, restitution: 0 })

// createCapsuleCollider — capsule-shaped collider
createCapsuleCollider({ halfHeight: 0.5, radius: 0.25 })`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <PhysicsGame />
    </template>

    <h1>Physics</h1>
    <p>
      Dumas physics is powered by <code>@dimforge/rapier3d-compat</code> and integrated directly
      into the ECS. A physics body is just another component — attach it with
      <code>createPhysics</code>, render with <code>&lt;DumasEntity&gt;</code>. No separate
      <code>&lt;Physics&gt;</code> tree or sync composable needed.
    </p>

    <h2>1. Initialize the world</h2>
    <p>
      Call <code>usePhysics({ gravity })</code> once at the top of a scene's <code>setup</code>. It
      starts loading the Rapier WASM binary in the background and creates a
      <code>RAPIER.World</code> once ready. The call is synchronous from the component's perspective
      — no <code>await</code>, no <code>&lt;Suspense&gt;</code> needed. Physics bodies are created
      lazily and the physics step registers itself at priority <code>-100</code> so it always runs
      before any other system. Two physics scenes can switch cleanly because scene transitions are
      synchronous.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="INIT_CODE" />
    </div>

    <h2>2. Attach a body with createPhysics</h2>
    <p>
      Pass <code>createPhysics(options)</code> as a component factory to
      <code>useEcsComponent</code>. It can be called inline — a stable <code>__type</code> symbol
      keeps the store registry lookup correct across re-renders. Set initial position by writing to
      <code>transform</code> right after the call; the body is placed there before the first physics
      step.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="CREATE_PHYSICS" />
    </div>

    <h2>3. Transform sync is automatic</h2>
    <p>
      <code>createPhysics</code> registers its own priority-0 system that copies
      <code>body.translation()</code> and <code>body.rotation()</code> into the entity's
      <code>TransformStore</code> every frame. <code>&lt;DumasEntity&gt;</code> then reads those
      values at priority 100 and updates the <code>THREE.Group</code>. You don't call
      <code>usePhysicsSync</code> — it no longer exists.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SYNC_EXPLANATION" />
    </div>

    <h2>Body options</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BODY_OPTIONS" />
    </div>

    <h2>Collider factories</h2>
    <p>
      Colliders are plain config objects — not <code>ComponentFactory</code>s. They are nested
      inside <code>createPhysics</code> and get a name that can be used for collision filtering.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="COLLIDER_FACTORIES" />
    </div>

    <h2>Scene source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
    <h2>Box component source</h2>
    <div class="code-wrap">
      <CodeBlock :code="boxSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
