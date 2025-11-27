import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import { AICopilot } from './components/AICopilot';
import { JointState, INITIAL_JOINTS } from './types';

const App: React.FC = () => {
  const [joints, setJoints] = useState<JointState>(INITIAL_JOINTS);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      
      {/* Background/Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene joints={joints} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Pointer events auto used for children, none for container to let clicks pass to canvas */}
        
        {/* Title / Header */}
        <div className="absolute top-0 right-0 p-6 text-right pointer-events-auto">
          <h1 className="text-3xl font-black text-white tracking-tighter opacity-90 drop-shadow-lg">
            HYUNDAI <span className="text-blue-500">H220</span>
          </h1>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
            220kg Payload Industrial Robot
          </p>
        </div>

        {/* Interactive Components (re-enable pointer events) */}
        <div className="pointer-events-auto">
           <Controls joints={joints} setJoints={setJoints} />
           <AICopilot joints={joints} setJoints={setJoints} />
        </div>
      </div>
    </div>
  );
};

export default App;