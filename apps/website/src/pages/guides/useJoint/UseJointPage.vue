<script setup lang="ts">
import UseJointGame from "./UseJointGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseJointScene.vue?raw";

const REVOLUTE_CODE = `const { eid: anchorEid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        point: createCuboidCollider({ halfExtents: [0.15, 0.15, 0.15] }),
      },
    }),
  },
});

const { eid: pendulumEid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.4, 0.4, 0.4] }),
      },
    }),
  },
});

// Hinge joint — swings around the Z axis.
const hinge = useJoint({
  type: "revolute",
  bodyA: anchorEid,
  bodyB: pendulumEid,
  axis: { x: 0, y: 0, z: 1 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: 2, z: 0 },
  limits: { min: -Math.PI / 4, max: Math.PI / 4 },
});

// Motor control — spin the hinge at 1.5 rad/s with up to 200 N of force.
hinge.setMotor({ targetVelocity: 1.5, maxForce: 200 });`;

const SPRING_CODE = `const spring = useJoint({
  type: "spring",
  bodyA: boxAEid,
  bodyB: boxBEid,
  anchorA: { x: 0, y: -0.5, z: 0 },
  anchorB: { x: 0, y: 0.5, z: 0 },
  restLength: 1.5,
  stiffness: 40,
  damping: 1,
});`;

const FIXED_CODE = `// Fixed joint — locks two bodies together so they move as one.
useJoint({
  type: "fixed",
  bodyA: chassisEid,
  bodyB: turretEid,
  anchorA: { x: 0, y: 0.5, z: 0 },
  anchorB: { x: 0, y: 0, z: 0 },
});`;

const PRISMATIC_CODE = `// Prismatic (slide) joint — allows translation along one axis.
useJoint({
  type: "prismatic",
  bodyA: railEid,
  bodyB: sliderEid,
  axis: { x: 1, y: 0, z: 0 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: 0, z: 0 },
  limits: { min: -3, max: 3 },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseJointGame />
    </template>

    <h1>Joints</h1>
    <p>
      <code>useJoint</code> connects two physics bodies with a Rapier joint. It accepts entity IDs
      from <code>useEcsComponent</code> and creates the underlying
      <code>RAPIER.ImpulseJoint</code> once both bodies are ready. The joint is automatically
      removed when the component unmounts.
    </p>

    <h2>Joint types</h2>
    <ul>
      <li><strong>fixed</strong> — locks two bodies together so they move as one rigid unit.</li>
      <li>
        <strong>revolute</strong> (hinge) — allows rotation around a single axis. Supports optional
        limits and a motor.
      </li>
      <li>
        <strong>prismatic</strong> (slide) — allows translation along a single axis. Supports
        optional limits.
      </li>
      <li>
        <strong>spring</strong> — connects two bodies with a spring that has configurable rest
        length, stiffness, and damping.
      </li>
    </ul>

    <h2>Revolute joint with limits and motor</h2>
    <p>
      A revolute joint creates a hinge between two bodies. The <code>axis</code> vector defines the
      rotation axis, and <code>anchorA</code> / <code>anchorB</code> set the attachment points in
      each body's local space. Optional <code>limits</code> restrict the rotation range, and
      <code>setMotor</code> applies a velocity target with a force cap.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="REVOLUTE_CODE" />
    </div>

    <h2>Spring joint</h2>
    <p>
      A spring joint pulls two bodies toward a target separation defined by
      <code>restLength</code>. The <code>stiffness</code> value controls how aggressively the spring
      corrects, and <code>damping</code> reduces oscillation.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SPRING_CODE" />
    </div>

    <h2>Fixed joint</h2>
    <p>
      A fixed joint welds two bodies into a single rigid unit. Useful for attaching decorations or
      sub-parts to a main body without merging their colliders.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="FIXED_CODE" />
    </div>

    <h2>Prismatic joint</h2>
    <p>
      A prismatic joint constrains motion to a single axis — like a drawer sliding on rails. The
      <code>axis</code> vector sets the slide direction and optional <code>limits</code> clamp the
      travel distance.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="PRISMATIC_CODE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
