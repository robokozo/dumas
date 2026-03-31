export interface MarbleState {
  id: number;
  startX: number;
  startY: number;
  startZ: number;
}

export interface CheckpointState {
  id: number;
  label: string;
  x: number;
  y: number;
  z: number;
  isReached: boolean;
}

export interface RampConfig {
  x: number;
  y: number;
  z: number;
  halfWidth: number;
  halfHeight: number;
  halfDepth: number;
  angle: number;
  color: string;
}
