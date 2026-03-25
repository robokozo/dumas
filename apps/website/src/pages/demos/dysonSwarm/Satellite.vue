<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";
import { useLoop } from "@tresjs/core";

const props = defineProps<{
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  inclination: number;
  omega: number;
  panelW: number;
  panelH: number;
}>();

const emit = defineEmits<{
  destroyed: [];
}>();

const { eid, groupRef } = useGameObject();

function setGroupRef(el: object | null): void {
  groupRef.value = el as (typeof groupRef)["value"];
}
const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });

useCollider({
  eid,
  shape: "sphere",
  radius: 0.2,
  isSensor: true,
  onCollision: ({ type }) => {
    if (type === "started") {
      emit("destroyed");
    }
  },
});

let angle = props.initialAngle;

useSystem({
  fn: ({ delta }) => {
    const body = rigidBody.value;
    if (body === null) return;

    angle += delta * props.orbitSpeed;

    const r = props.orbitRadius;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const cosI = Math.cos(props.inclination);
    const sinI = Math.sin(props.inclination);
    const cosO = Math.cos(props.omega);
    const sinO = Math.sin(props.omega);

    const bx = r * cosA;
    const by = r * sinA * sinI;
    const bz = r * sinA * cosI;

    body.setNextKinematicTranslation({
      x: bx * cosO - bz * sinO,
      y: by,
      z: bx * sinO + bz * cosO,
    });
  },
});

const { onBeforeRender } = useLoop();

// lookAt runs after renderSyncSystem has updated mesh.position from the physics body
onBeforeRender(() => {
  const mesh = groupRef.value;
  if (mesh === null) return;
  mesh.lookAt(0, 0, 0);
});
</script>

<template>
  <TresGroup
    :ref="
      (el: any) => {
        setGroupRef(el);
      }
    "
  >
    <!-- Main panel -->
    <TresMesh>
      <TresBoxGeometry :args="[panelW, panelH, 0.018]" />
      <TresMeshStandardMaterial
        color="#1a3a88"
        emissive="#223366"
        :emissive-intensity="0.4"
        :metalness="0.7"
        :roughness="0.2"
      />
    </TresMesh>
    <!-- Central strut -->
    <TresMesh>
      <TresBoxGeometry :args="[0.025, 0.025, 0.12]" />
      <TresMeshStandardMaterial color="#888888" :metalness="0.9" :roughness="0.3" />
    </TresMesh>
  </TresGroup>
</template>
