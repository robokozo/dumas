<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";
import { useLoop } from "@tresjs/core";

const props = defineProps<{
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
}>();

const emit = defineEmits<{ destroyed: [] }>();

const { eid, groupRef } = useGameObject();

function setGroupRef(el: object | null): void {
  groupRef.value = el as (typeof groupRef)["value"];
}

const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });

useCollider({
  eid,
  shape: "sphere",
  radius: 0.5,
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
    body.setNextKinematicTranslation({
      x: Math.cos(angle) * props.orbitRadius,
      y: 0,
      z: Math.sin(angle) * props.orbitRadius,
    });
  },
});

const { onBeforeRender } = useLoop();

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
    <!-- Central hub -->
    <TresMesh>
      <TresCylinderGeometry :args="[0.18, 0.18, 0.28, 16]" />
      <TresMeshStandardMaterial color="#99aabb" :metalness="0.8" :roughness="0.2" />
    </TresMesh>

    <!-- Outer ring (torus lies in XY plane — faces the sun after lookAt) -->
    <TresMesh>
      <TresTorusGeometry :args="[0.5, 0.05, 8, 40]" />
      <TresMeshStandardMaterial color="#aabbcc" :metalness="0.7" :roughness="0.3" />
    </TresMesh>

    <!-- Spoke +X -->
    <TresMesh :position="[0.34, 0, 0]">
      <TresBoxGeometry :args="[0.32, 0.03, 0.03]" />
      <TresMeshStandardMaterial color="#778899" :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Spoke -X -->
    <TresMesh :position="[-0.34, 0, 0]">
      <TresBoxGeometry :args="[0.32, 0.03, 0.03]" />
      <TresMeshStandardMaterial color="#778899" :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Spoke +Y -->
    <TresMesh :position="[0, 0.34, 0]">
      <TresBoxGeometry :args="[0.03, 0.32, 0.03]" />
      <TresMeshStandardMaterial color="#778899" :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <!-- Spoke -Y -->
    <TresMesh :position="[0, -0.34, 0]">
      <TresBoxGeometry :args="[0.03, 0.32, 0.03]" />
      <TresMeshStandardMaterial color="#778899" :metalness="0.9" :roughness="0.2" />
    </TresMesh>

    <!-- Solar panel arms extending left and right (+X, -X) -->
    <TresMesh :position="[0.85, 0, 0]">
      <TresBoxGeometry :args="[0.55, 0.03, 0.03]" />
      <TresMeshStandardMaterial color="#667788" :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <TresMesh :position="[0.85, 0, 0]">
      <TresBoxGeometry :args="[0.48, 0.28, 0.01]" />
      <TresMeshStandardMaterial
        color="#1a3a88"
        emissive="#223366"
        :emissive-intensity="0.6"
        :roughness="0.2"
      />
    </TresMesh>

    <TresMesh :position="[-0.85, 0, 0]">
      <TresBoxGeometry :args="[0.55, 0.03, 0.03]" />
      <TresMeshStandardMaterial color="#667788" :metalness="0.9" :roughness="0.2" />
    </TresMesh>
    <TresMesh :position="[-0.85, 0, 0]">
      <TresBoxGeometry :args="[0.48, 0.28, 0.01]" />
      <TresMeshStandardMaterial
        color="#1a3a88"
        emissive="#223366"
        :emissive-intensity="0.6"
        :roughness="0.2"
      />
    </TresMesh>
  </TresGroup>
</template>
