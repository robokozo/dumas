<script setup lang="ts">
import RelationshipsGame from "./RelationshipsGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./RelationshipsScene.vue?raw";

const INTRO_CODE = `import { ChildOf, useRelationship } from "@dumas/core";

// Create the relationship helper — call once in setup
const rel = useRelationship({ relation: ChildOf });`;

const SET_PARENT_CODE = `// Link a child entity to a parent entity
rel.setParent({ child: swordEid, parent: playerEid });

// Under the hood this calls:
// addComponents(world, swordEid, [Pair(ChildOf, playerEid)]);`;

const GET_PARENT_CODE = `// Query who the parent is — returns the parent eid or null
const parentId = rel.getParent({ child: swordEid });

if (parentId !== null) {
  console.log("Sword is held by entity", parentId);
}`;

const REMOVE_PARENT_CODE = `// Unlink a child from its parent
rel.removeParent({ child: swordEid, parent: playerEid });`;

const ENTITY_REF_CODE = `import { useEcsComponent, useEntityRef, useRelationship, ChildOf } from "@dumas/core";

// Parent entity
const parent = useEcsComponent({});

// Child entity
const child = useEcsComponent({});

// Link child to parent
const rel = useRelationship({ relation: ChildOf });
rel.setParent({ child: child.eid, parent: parent.eid });

// Read parent's transform reactively from the child's perspective
const parentRef = useEntityRef({ eid: parent.eid });

useSystem({
  fn: () => {
    const parentTransform = parentRef.transform;
    if (parentTransform !== null) {
      // Follow parent with an offset
      child.transform.posX.value = parentTransform.posX.value + 1.5;
      child.transform.posY.value = parentTransform.posY.value;
    }
  },
});`;

const BITECS_DIRECT_CODE = `import { addComponents, Pair, getRelationTargets } from "bitecs";
import { ChildOf } from "@dumas/core";
import { useGame } from "@dumas/core";

const { world } = useGame();

// Link child to parent using bitECS directly
addComponents(world, childEid, [Pair(ChildOf, parentEid)]);

// Query the parent from a child
const [parentId] = getRelationTargets(world, childEid, ChildOf);`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <RelationshipsGame />
    </template>

    <h1>Relationships</h1>
    <p>
      bitECS relationships model links between entities: parent-child hierarchies, equipment slots,
      ownership, team membership. Dumas provides the <code>ChildOf</code> relation out of the box
      and the <code>useRelationship</code> composable for ergonomic access.
    </p>

    <h2>ChildOf</h2>
    <p>
      <code>ChildOf</code> is an exclusive, auto-cleanup relation. Exclusive means each entity can
      have at most one parent. Auto-cleanup means when the parent entity is removed from the world,
      the child's relationship is automatically cleaned up.
    </p>
    <p>
      This makes it ideal for scene graphs, inventory systems, and any hierarchy where an entity
      belongs to exactly one owner.
    </p>

    <h2>Setting up the composable</h2>
    <p>
      Call <code>useRelationship</code> once in your component's <code>setup</code>. Pass the
      relation you want to manage. It returns helpers for linking, unlinking, and querying entities.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="INTRO_CODE" />
    </div>

    <h2>Setting a parent</h2>
    <p>
      <code>setParent</code> links a child to a parent. Because <code>ChildOf</code> is exclusive,
      calling <code>setParent</code> again with a different parent automatically replaces the
      previous one.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SET_PARENT_CODE" />
    </div>

    <h2>Querying the parent</h2>
    <p>
      <code>getParent</code> returns the parent entity ID, or <code>null</code> if the child has no
      parent.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="GET_PARENT_CODE" />
    </div>

    <h2>Removing a parent</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="REMOVE_PARENT_CODE" />
    </div>

    <h2>Using with useEntityRef</h2>
    <p>
      Combine <code>ChildOf</code> with <code>useEntityRef</code> to read a parent's transform
      reactively. This lets child entities follow their parent by reading position data each frame
      and applying an offset.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="ENTITY_REF_CODE" />
    </div>

    <h2>Using bitECS directly</h2>
    <p>
      For advanced use cases, you can use bitECS primitives directly. <code>ChildOf</code> is a
      standard bitECS relation created with <code>createRelation</code>, so all bitECS relation APIs
      work with it.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BITECS_DIRECT_CODE" />
    </div>

    <h2>Demo source</h2>
    <p>
      The demo shows a parent sphere orbiting in a circle with two child cubes following via
      <code>ChildOf</code>. The children read the parent's transform through
      <code>useEntityRef</code> and apply offsets with lerp smoothing.
    </p>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
