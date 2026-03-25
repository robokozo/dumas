export interface DemoEntry {
  slug: string;
  title: string;
  description: string;
}

export const DEMOS: Array<DemoEntry> = [
  {
    slug: "cannon-wall",
    title: "Cannon Wall",
    description: "Click anywhere to fire cannonballs at a wall of blocks.",
  },
  {
    slug: "platformer",
    title: "Platformer",
    description: "Jump between platforms and collect all the coins. Fall into the lava to respawn.",
  },
  {
    slug: "isometric",
    title: "Isometric",
    description:
      "Click the ground to move a character around an isometric world and collect spheres.",
  },
  {
    slug: "dialog-demo",
    title: "Dialog Demo",
    description:
      "Walk a character into trigger zones to open HTML dialog boxes — showing how game events can drive reactive UI.",
  },
  {
    slug: "dyson-swarm",
    title: "Dyson Swarm",
    description:
      "Click the sun to collect energy. Buy satellites to generate energy passively and build a Dyson swarm.",
  },
  {
    slug: "ball-dropper",
    title: "Ball Dropper",
    description:
      "Click to drop balls onto a spinning plate. Land in colored bowls to score points — 100 balls per round.",
  },
];
