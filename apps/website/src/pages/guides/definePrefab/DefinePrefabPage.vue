<script setup lang="ts">
import DefinePrefabGame from "./DefinePrefabGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./DefinePrefabScene.vue?raw";

const DEFINE_PREFAB_CODE = `import { definePrefab, createPhysics, createSphereCollider } from "@dumas/core";

// Define once at module scope — reusable across any component
const OrbPrefab = definePrefab({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        sphere: createSphereCollider({ radius: 0.5, restitution: 0.7 }),
      },
    }),
  },
  defaults({ transform, components }) {
    // Set initial values applied to every instance
    transform.posY.value = 5;
  },
});`;

const USE_PREFAB_CODE = `import { usePrefab } from "@dumas/core";

// In component setup — creates a fully-wired entity from the template
const { eid, transform } = usePrefab(OrbPrefab);

// Override defaults per-instance after spawning
transform.posX.value = 3;
transform.posY.value = 10;`;

const MULTIPLE_INSTANCES_CODE = `interface OrbConfig {
  startY: number;
  posX: number;
  color: string;
}

const ORB_CONFIGS: Array<OrbConfig> = [
  { startY: 6, posX: -2, color: "#ff6b6b" },
  { startY: 10, posX: 0, color: "#4ecdc4" },
  { startY: 14, posX: 2, color: "#c9b1ff" },
];

// Spawn multiple instances from the same prefab
const orbs = ORB_CONFIGS.map((config) => {
  const result = usePrefab(OrbPrefab);
  result.transform.posX.value = config.posX;
  result.transform.posY.value = config.startY;
  return { ...result, color: config.color };
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <DefinePrefabGame />
    </template>

    <h1>Prefabs</h1>
    <p>
      <code>definePrefab</code> captures a set of ECS components and an optional defaults
      initializer as a reusable entity template. Instead of repeating the same
      <code>useEcsComponent</code> configuration in every component that needs the same entity
      shape, define the template once and stamp out instances with <code>usePrefab</code>.
    </p>

    <h2>1. Define a prefab</h2>
    <p>
      Call <code>definePrefab</code> at module scope. The <code>components</code> object declares
      which component factories to attach, and the optional <code>defaults</code> callback receives
      the entity's <code>transform</code> and <code>components</code> slices so you can set initial
      values that apply to every instance.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="DEFINE_PREFAB_CODE" />
    </div>

    <h2>2. Spawn with usePrefab</h2>
    <p>
      Call <code>usePrefab(MyPrefab)</code> during component setup. It creates an entity with all
      declared components attached and runs the defaults callback. The return value is the same
      shape as <code>useEcsComponent</code> — you get <code>eid</code>, <code>transform</code>, and
      all component slices. Override any default values per-instance after the call.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="USE_PREFAB_CODE" />
    </div>

    <h2>3. Multiple instances</h2>
    <p>
      Since each <code>usePrefab</code> call creates a new entity, you can spawn many instances from
      the same prefab with different positions, colors, or other per-instance data.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="MULTIPLE_INSTANCES_CODE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
