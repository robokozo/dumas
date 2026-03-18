import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "../features/home/HomePage.vue";
import BouncingBallPage from "../features/bouncingBall/BouncingBallPage.vue";
import BlockWallPage from "../features/blockWall/BlockWallPage.vue";
import NewtonsCradlePage from "../features/newtonsCradle/NewtonsCradlePage.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/bouncing-ball", component: BouncingBallPage },
    { path: "/block-wall", component: BlockWallPage },
    { path: "/newtons-cradle", component: NewtonsCradlePage },
  ],
});
