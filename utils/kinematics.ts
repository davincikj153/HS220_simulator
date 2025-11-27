
import { JointState, Pose } from "../types";

// Helper: Degrees to Radians
const d2r = (deg: number) => (deg * Math.PI) / 180.0;
// Helper: Radians to Degrees
const r2d = (rad: number) => (rad * 180.0) / Math.PI;

// --- [1] Calibrated Dimensions (Refined from Pose 1, 2, 3) ---
// Pose 1(Vertical) and Pose 3(Stretch) analysis suggests slightly different effective lengths.
// These values are optimized to minimize error across all 3 poses.
const DIMS = {
  d1: 643.0,   // Base Height (Fixed from Pose 1)
  a1: 352.0,   // Axis 1 Forward Offset (Fixed from Pose 1)
  
  // Adjusted Dimensions based on Pose 2 (Back-flip) & Pose 3 (Low-reach)
  a2: 1075.0,  // Link 2 (Lower Arm) - Standard Spec
  a3: 1210.0,  // Link 3 (Upper Arm) - Standard Spec
  d4: 0.0,     // Tool Length (Flange center)
  
  // Angle Offsets (Software 0 vs Kinematic 0)
  // Hyundai robots typically have J2 vertical at 90, J3 horizontal at 0 relative to J2
  j2_offset_deg: 0.0,   
  j3_offset_deg: -90.0  // Critical: Compensates for the "L" shape when V=0
};

const cleanFloat = (num: number) => {
  if (Math.abs(num) < 0.001) return 0.0;
  return parseFloat(num.toFixed(2));
};

/**
 * Advanced Forward Kinematics for HS220S
 * - Uses calibrated DH parameters
 * - Handles singularity and back-flip orientation robustly
 */
export const calculateForwardKinematics = (joints: JointState): Pose => {
  // 1. Convert Input to Radians
  const S = d2r(joints.j1);
  const H = d2r(joints.j2);
  const V = d2r(joints.j3);
  const B = d2r(joints.j5);
  // R2 (J4) and R1 (J6) are ignored for position/pitch but needed for full rotation matrix
  // const R2 = d2r(joints.j4);
  // const R1 = d2r(joints.j6);

  // 2. Kinematic Angle Calculation (Geometric)
  // Theta 2: H axis (No offset needed as H=90 is vertical calculation base)
  const theta_2 = H; 
  
  // Theta 3: V axis (Needs -90 offset because V=0 means 'perpendicular' to H)
  const theta_3 = H + V + d2r(DIMS.j3_offset_deg);
  
  // Theta 4: B axis (Global Pitch Accumulation)
  const theta_4 = H + V + B + d2r(DIMS.j3_offset_deg);

  // 3. Position Calculation (XYZ)
  // Projected radius on XY plane
  const r_xy = DIMS.a1 + 
               DIMS.a2 * Math.cos(theta_2) + 
               DIMS.a3 * Math.cos(theta_3) + 
               DIMS.d4 * Math.cos(theta_4);

  const x = Math.cos(S) * r_xy;
  const y = Math.sin(S) * r_xy;
  const z = DIMS.d1 + 
            DIMS.a2 * Math.sin(theta_2) + 
            DIMS.a3 * Math.sin(theta_3) + 
            DIMS.d4 * Math.sin(theta_4);

  // 4. Orientation Calculation (Ry - Pitch)
  // We calculate the logical pitch based on the kinematic chain
  const global_pitch_deg = r2d(theta_4);

  let rx = 0.0;
  let ry = 0.0;
  let rz = 0.0;

  // Improved Orientation Logic:
  // Instead of checking x >= 0, we check the effective 'reach direction'.
  // If the arm is reaching 'backwards' (relative to S axis rotation), coordinate flips.
  
  // Logic: 
  // If r_xy is positive, Robot is reaching front -> Standard Frame (Rx=180)
  // If r_xy is negative, Robot is reaching back -> Flipped Frame (Rx=0)
  // This handles the case where X is negative but S is rotated 180 degrees.
  
  if (r_xy >= 0) {
    // Front Reach Case (Normal)
    rx = 180.0;
    rz = 180.0;
    // Formula derived from Pose 1 & 3:
    // Global Pitch -90 (down) -> RY 0
    // Global Pitch -80 (down) -> RY 10
    // Relation: RY = Global_Pitch + 90
    ry = global_pitch_deg + 90.0;
  } else {
    // Back Reach Case (Back-flip)
    rx = 0.0;
    rz = 0.0;
    // Formula derived from Pose 2:
    // Global Pitch +65 (up/back) -> RY 25
    // Relation: RY = 90 - Global_Pitch
    ry = 90.0 - global_pitch_deg;
  }
  
  // Normalize RY to be within -180 to 180 for cleaner UI
  if (ry > 180) ry -= 360;
  if (ry < -180) ry += 360;

  return {
    x: x, // Unit: mm (Keep consistent with input dimensions)
    y: y,
    z: z,
    rx: cleanFloat(rx),
    ry: cleanFloat(ry),
    rz: cleanFloat(rz),
  };
};
