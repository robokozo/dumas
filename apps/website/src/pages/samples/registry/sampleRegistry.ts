export interface SampleEntry {
  slug: string;
  title: string;
  description: string;
}

export const SAMPLES: Array<SampleEntry> = [
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
];
