
export interface JointState {
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  j5: number;
  j6: number;
}

export interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

export const INITIAL_JOINTS: JointState = {
  j1: 0,
  j2: 90,  // "L-Shape" start position
  j3: 0,
  j4: 0,
  j5: -90, // Wrist down
  j6: 0,
};

// Hyundai Robotics H220S Specifications (Calibrated from Real Controller Data)
// Data Points:
// Pose 1: H=90, B=-90 -> X=1562, Z=1718
// Pose 2: H=155, B=0  -> X=-272, Z=2502
// Pose 3: H=10, B=0   -> X=1877, Z=-608
export const JOINT_LIMITS = {
  j1: { min: -180, max: 180 },  // S (Swivel)
  j2: { min: 0, max: 160 },     // H (Lower Arm) - Observed max 155 in data
  j3: { min: -180, max: 90 },   // V (Upper Arm)
  j4: { min: -360, max: 360 },  // R2 (Roll)
  j5: { min: -180, max: 180 },  // B (Bend)
  j6: { min: -360, max: 360 },  // R1 (Twist)
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isError?: boolean;
}
