import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { RobotModel } from './RobotModel';
import { JointState } from '../types';

interface SceneProps {
  joints: JointState;
}

export const Scene: React.FC<SceneProps> = ({ joints }) => {
  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows>
        {/* Adjusted camera for larger robot scale (approx 3m height) */}
        <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={50} />
        <OrbitControls makeDefault target={[0, 1.5, 0]} minDistance={2} maxDistance={15} />
        
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        <Environment preset="warehouse" />

        <group position={[0, 0, 0]}>
          <RobotModel joints={joints} />
        </group>

        <Grid 
          position={[0, 0, 0]} 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#475569" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#64748b" 
          fadeDistance={25} 
          fadeStrength={1}
          infiniteGrid 
        />
        <ContactShadows opacity={0.6} scale={20} blur={2.5} far={4} resolution={512} color="#000000" />
      </Canvas>
    </div>
  );
};