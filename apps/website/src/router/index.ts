import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../features/home/HomePage.vue";

const demoRoutes: Array<RouteRecordRaw> = [
  {
    path: "/demos/world-setup",
    component: () => import("../features/demos/worldSetup/WorldSetupPage.vue"),
  },
  {
    path: "/demos/rigid-body",
    component: () => import("../features/demos/rigidBody/RigidBodyPage.vue"),
  },
  {
    path: "/demos/colliders",
    component: () => import("../features/demos/colliders/CollidersPage.vue"),
  },
  {
    path: "/demos/collision-events",
    component: () => import("../features/demos/collisionEvents/CollisionEventsPage.vue"),
  },
  {
    path: "/demos/custom-systems",
    component: () => import("../features/demos/customSystems/CustomSystemsPage.vue"),
  },
  {
    path: "/demos/joints",
    component: () => import("../features/demos/joints/JointsPage.vue"),
  },
  {
    path: "/demos/object-pooling",
    component: () => import("../features/demos/objectPooling/ObjectPoolingPage.vue"),
  },
  {
    path: "/demos/cannon-wall",
    component: () => import("../features/demos/cannonWall/CannonWallPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...demoRoutes],
});
