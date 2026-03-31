export interface Section {
  points: number;
  color: string;
}

export const SECTIONS: Array<Section> = [
  { points: 10, color: "#4488cc" },
  { points: 25, color: "#44bb44" },
  { points: 10, color: "#4488cc" },
  { points: 50, color: "#dddd44" },
  { points: 10, color: "#4488cc" },
  { points: 25, color: "#44bb44" },
  { points: 10, color: "#4488cc" },
  { points: 100, color: "#dd4444" },
] satisfies Array<Section>;

export const SECTION_COUNT = SECTIONS.length;
export const PLATE_RADIUS = 3;
export const CUP_RADIUS = 0.45;
export const CUP_WALL_HEIGHT = 0.5;
export const CUP_PLACEMENT_RADIUS = 2.3;
export const SPIN_SPEED = 0.4;
export const BALL_RADIUS = 0.12;
export const MAX_BALLS = 30;
export const DROP_INTERVAL = 0.12;
export const SETTLE_DURATION = 4;
// 45° on the cup orbit circle (nearest the camera at [6,8,6])
export const DROP_X = CUP_PLACEMENT_RADIUS * Math.cos(Math.PI / 4);
export const DROP_Z = CUP_PLACEMENT_RADIUS * Math.sin(Math.PI / 4);
export const DROP_Y = 3;
