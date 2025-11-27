
import React from 'react';
import { JointState } from '../types';
import { Cylinder, Box, Sphere } from '@react-three/drei';

interface RobotModelProps {
  joints: JointState;
}

// Helper to convert degrees to radians
const d2r = (deg: number) => (deg * Math.PI) / 180;

// Industrial Yellow/Orange Robot Color Scheme (H220)
const COLORS = {
  yellow: '#EAB308',     // Main Body (Industrial Yellow)
  orange: '#EA580C',     // Base (Safety Orange)
  black: '#171717',      // Motors & Caps
  metal: '#CBD5E1',      // Pistons/Shafts
  darkMetal: '#475569',  // Joints/Flanges
  tool: '#EF4444'        // TCP Tip
};

export const RobotModel: React.FC<RobotModelProps> = ({ joints }) => {
  // Calibrated Visual Dimensions (Matches Python Script constants)
  // Unit: Meters
  const DIMENSIONS = {
    baseHeight: 0.643,    // d1
    j1OffsetX: 0.352,     // a1
    link2Length: 1.075,   // a2
    link3Length: 1.210,   // a3
    // d4 is 0 in kinematic script, but we need a physical wrist size.
    // We'll treat a3 as reaching the wrist center, and add a small visual tip.
  };

  // Rotation Logic
  // Kinematics define X as forward. In 3D (Y-up), rotating around Z moves in X-Y plane.
  // J2 (H) needs -90 deg offset because H=90 is vertical (Y).
  // H=90 -> Vis=0 (Up). H=0 -> Vis=-90 (Forward +X).
  const j2Rot = d2r(joints.j2 - 90); 
  
  // J3 (V) needs -90 deg offset because V=0 means orthogonal to J2 in the kinematic formula.
  const j3Rot = d2r(joints.j3 - 90); 

  return (
    <group position={[0, 0, 0]}>
      {/* ================= BASE (FIXED) ================= */}
      <group position={[0, 0, 0]}>
        {/* Floor Mounting Plate (Orange) */}
        <Box args={[1.0, 0.1, 1.0]} position={[0, 0.05, 0]}>
          <meshStandardMaterial color={COLORS.orange} />
        </Box>
        {/* Base Main Casting (Orange) */}
        <group position={[0, 0.35, 0]}>
           <Cylinder args={[0.35, 0.45, 0.5, 32]} >
             <meshStandardMaterial color={COLORS.orange} />
           </Cylinder>
           {/* Front connector box detail (Aligned to +X) */}
           <Box args={[0.3, 0.3, 0.5]} position={[0.4, -0.1, 0]}>
              <meshStandardMaterial color={COLORS.orange} />
           </Box>
        </group>

        {/* ================= J1 AXIS (SWIVEL - S) ================= */}
        {/* Rotates around Y. +S rotates towards +Y in math (X->Y), 
            In 3D Right-Handed: Y-Up. +RotY turns Z->X? 
            Let's stick to standard [0, S, 0] for simple turn. */}
        <group rotation={[0, d2r(joints.j1), 0]} position={[0, DIMENSIONS.baseHeight, 0]}>
          
          {/* Turret / Shoulder Base (Yellow) */}
          <group position={[0, -0.1, 0]}>
            <Cylinder args={[0.38, 0.38, 0.4, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color={COLORS.yellow} />
            </Cylinder>
            
            {/* J2 Axis Motor Housing (Black, Rear) - Negative X direction */}
            <Box args={[0.4, 0.5, 0.4]} position={[-0.3, 0.1, 0]}>
               <meshStandardMaterial color={COLORS.black} />
            </Box>

            {/* ================= J2 AXIS (LOWER ARM - H) ================= */}
            {/* Axis shifted forward in +X by a1 (0.352) */}
            {/* ROTATION AXIS: Z (0,0,1) to move in X-Y plane (Side View) */}
            <group position={[DIMENSIONS.j1OffsetX, 0.1, 0]} rotation={[0, 0, j2Rot]}>
              
              {/* J2 Pivot Cap (Black) - Aligned to Z-axis */}
              <Cylinder args={[0.32, 0.32, 0.65, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color={COLORS.black} />
              </Cylinder>

              {/* Link 2: Lower Arm (Yellow) */}
              <group position={[0, 0, 0]}>
                 {/* Main Arm Structure (Y-Up local) */}
                 <Box args={[0.4, DIMENSIONS.link2Length + 0.3, 0.5]} position={[0, DIMENSIONS.link2Length/2, 0]}>
                    <meshStandardMaterial color={COLORS.yellow} />
                 </Box>

                 {/* Decorative Cutout / Side details */}
                 <Box args={[0.42, 0.6, 0.3]} position={[0, 0.4, 0]}>
                    <meshStandardMaterial color={COLORS.yellow} />
                 </Box>

                 {/* Balancer Piston (Silver) */}
                 <group position={[-0.35, 0.3, 0]} rotation={[0, 0, -0.1]}>
                    <Cylinder args={[0.08, 0.08, 0.8, 16]} position={[0, 0.4, 0]}>
                       <meshStandardMaterial color={COLORS.metal} roughness={0.3} metalness={0.8} />
                    </Cylinder>
                 </group>

                 {/* ================= J3 AXIS (UPPER ARM - V) ================= */}
                 {/* Moves up local Y to Elbow */}
                 <group position={[0, DIMENSIONS.link2Length, 0]} rotation={[0, 0, j3Rot]}>
                    
                    {/* J3 Pivot Cap (Black) */}
                    <Cylinder args={[0.25, 0.25, 0.55, 32]} rotation={[Math.PI/2, 0, 0]}>
                       <meshStandardMaterial color={COLORS.black} />
                    </Cylinder>

                    {/* J3 Motor Box (Black, Rear) */}
                    <Box args={[0.3, 0.4, 0.3]} position={[0, -0.2, 0]}>
                       <meshStandardMaterial color={COLORS.black} />
                    </Box>

                    {/* Link 3: Upper Arm (Yellow) */}
                    <group position={[0, 0, 0]}>
                       {/* Elbow Joint Area */}
                       <Box args={[0.35, 0.35, 0.45]} position={[0, 0.1, 0]}>
                          <meshStandardMaterial color={COLORS.yellow} />
                       </Box>
                       
                       {/* Forearm Cylinder (Yellow) */}
                       <Cylinder args={[0.18, 0.22, DIMENSIONS.link3Length, 24]} position={[0, DIMENSIONS.link3Length/2, 0]}>
                          <meshStandardMaterial color={COLORS.yellow} />
                       </Cylinder>

                       {/* ================= J4 AXIS (ROLL - R2) ================= */}
                       {/* Rotates around local Y (Arm Axis) */}
                       <group position={[0, DIMENSIONS.link3Length, 0]} rotation={[0, -d2r(joints.j4), 0]}>
                          
                          {/* Wrist Housing (Yellow) */}
                          <Cylinder args={[0.16, 0.18, 0.2, 24]} position={[0, 0.1, 0]}>
                             <meshStandardMaterial color={COLORS.yellow} />
                          </Cylinder>

                          {/* ================= J5 AXIS (PITCH - B) ================= */}
                          {/* Rotates around Z to pitch up/down in X-Y plane */}
                          <group position={[0, 0.2, 0]} rotation={[0, 0, d2r(joints.j5)]}>
                             
                             {/* J5 Pivot Cap (Black) */}
                             <Cylinder args={[0.14, 0.14, 0.32, 32]} rotation={[Math.PI/2, 0, 0]}>
                                <meshStandardMaterial color={COLORS.black} />
                             </Cylinder>

                             {/* Hand Base (Yellow) */}
                             <Box args={[0.2, 0.25, 0.2]} position={[0, 0.15, 0]}>
                                <meshStandardMaterial color={COLORS.yellow} />
                             </Box>

                             {/* ================= J6 AXIS (TWIST - R1) ================= */}
                             {/* Rotates around local Y (Tool Axis) */}
                             <group position={[0, 0.28, 0]} rotation={[0, -d2r(joints.j6), 0]}>
                                {/* Flange (Dark Metal) */}
                                <Cylinder args={[0.12, 0.12, 0.04, 32]} position={[0, 0, 0]}>
                                   <meshStandardMaterial color={COLORS.darkMetal} />
                                </Cylinder>

                                {/* Tool / Tip (Red Arrow - Visualization) */}
                                <group position={[0, 0.02, 0]}>
                                   <Cylinder args={[0.01, 0.01, 0.2, 8]} position={[0, 0.1, 0]}>
                                      <meshStandardMaterial color={COLORS.tool} opacity={0.5} transparent />
                                   </Cylinder>
                                   <Sphere args={[0.02]} position={[0, 0.2, 0]}>
                                      <meshStandardMaterial color={COLORS.tool} />
                                   </Sphere>
                                </group>

                             </group> {/* End J6 */}
                          </group> {/* End J5 */}
                       </group> {/* End J4 */}
                    </group> {/* End Link 3 */}
                 </group> {/* End J3 */}
              </group> {/* End Link 2 */}
            </group> {/* End J2 */}
          </group> {/* End Link 1 */}
        </group> {/* End J1 */}
      </group> {/* End Base */}
    </group>
  );
};
