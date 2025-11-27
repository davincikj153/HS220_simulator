
import React, { useMemo } from 'react';
import { JointState, JOINT_LIMITS } from '../types';
import { calculateForwardKinematics } from '../utils/kinematics';
import { RotateCw, RotateCcw, RefreshCcw } from 'lucide-react';

interface ControlsProps {
  joints: JointState;
  setJoints: React.Dispatch<React.SetStateAction<JointState>>;
}

// Axis Alias Mapping: S, H, V, R2, B, R1
const AXIS_ALIASES: Record<keyof JointState, { code: string; name: string }> = {
  j1: { code: 'S', name: 'Swivel' },
  j2: { code: 'H', name: 'Lower' },
  j3: { code: 'V', name: 'Upper' },
  j4: { code: 'R2', name: 'Roll 2' },
  j5: { code: 'B', name: 'Bend' },
  j6: { code: 'R1', name: 'Roll 1' },
};

export const Controls: React.FC<ControlsProps> = ({ joints, setJoints }) => {
  
  const pose = useMemo(() => calculateForwardKinematics(joints), [joints]);

  const handleChange = (axis: keyof JointState, value: number) => {
    // Basic NaN check
    if (isNaN(value)) return;
    
    // Clamp value to joint limits
    const limit = JOINT_LIMITS[axis];
    const clampedValue = Math.min(Math.max(value, limit.min), limit.max);

    setJoints(prev => ({
      ...prev,
      [axis]: clampedValue
    }));
  };

  const handleReset = () => {
    setJoints({ j1: 0, j2: 90, j3: 0, j4: 0, j5: -90, j6: 0 });
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl text-slate-100 max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col">
      
      {/* Header */}
      <div className="p-4 pb-2 flex justify-between items-center border-b border-slate-800">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
          Robot Controls
        </h2>
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Reset to Pose 1"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* Controller Data Grid (Matches Screenshot Style) */}
      <div className="m-4 rounded-md overflow-hidden border border-slate-700 text-xs font-mono">
        {/* Header Row */}
        <div className="grid grid-cols-2 bg-slate-800 text-center font-bold text-slate-400 border-b border-slate-700">
          <div className="py-1 border-r border-slate-700">직교좌표 (Cartesian)</div>
          <div className="py-1">축좌표 (Joint)</div>
        </div>
        
        {/* Data Rows */}
        <div className="bg-black/40">
           {/* Row 1: X / S */}
           <div className="grid grid-cols-2 border-b border-slate-800/50">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">X</span>
                 {/* Pose is already in MM from kinematics */}
                 <span className="text-blue-300">{pose.x.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">S</span>
                 <span className="text-blue-300">{joints.j1.toFixed(2)}</span>
              </div>
           </div>
           {/* Row 2: Y / H */}
           <div className="grid grid-cols-2 border-b border-slate-800/50">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">Y</span>
                 <span className="text-blue-300">{pose.y.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">H</span>
                 <span className="text-blue-300 bg-slate-800/80 -mx-1 px-1 rounded">{joints.j2.toFixed(2)}</span>
              </div>
           </div>
           {/* Row 3: Z / V */}
           <div className="grid grid-cols-2 border-b border-slate-800/50">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">Z</span>
                 <span className="text-blue-300">{pose.z.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">V</span>
                 <span className="text-blue-300">{joints.j3.toFixed(2)}</span>
              </div>
           </div>
           {/* Row 4: RX / R2 */}
           <div className="grid grid-cols-2 border-b border-slate-800/50">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">RX</span>
                 <span className="text-blue-300">{pose.rx.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">R2</span>
                 <span className="text-blue-300">{joints.j4.toFixed(2)}</span>
              </div>
           </div>
           {/* Row 5: RY / B */}
           <div className="grid grid-cols-2 border-b border-slate-800/50">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">RY</span>
                 <span className="text-blue-300">{pose.ry.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">B</span>
                 <span className="text-blue-300">{joints.j5.toFixed(2)}</span>
              </div>
           </div>
           {/* Row 6: RZ / R1 */}
           <div className="grid grid-cols-2">
              <div className="flex justify-between px-3 py-1 border-r border-slate-800/50">
                 <span className="text-slate-400">RZ</span>
                 <span className="text-blue-300">{pose.rz.toFixed(1)}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                 <span className="text-slate-400">R1</span>
                 <span className="text-blue-300">{joints.j6.toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Joint Sliders */}
      <div className="px-5 py-3 space-y-4">
        {(Object.keys(JOINT_LIMITS) as Array<keyof JointState>).map((axis) => (
          <div key={axis} className="group">
            <div className="flex justify-between items-center mb-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-500 transition-colors"></span>
                <span className="font-mono font-bold text-slate-200">
                  {AXIS_ALIASES[axis].code}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-medium">
                  {AXIS_ALIASES[axis].name}
                </span>
              </div>
              {/* Added Limits Display */}
              <span className="text-[10px] text-slate-600 font-mono">
                [{JOINT_LIMITS[axis].min}° ~ {JOINT_LIMITS[axis].max}°]
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                onClick={() => handleChange(axis, Math.max(JOINT_LIMITS[axis].min, joints[axis] - 1))}
              >
                <RotateCcw size={12} />
              </button>
              
              <input
                type="range"
                min={JOINT_LIMITS[axis].min}
                max={JOINT_LIMITS[axis].max}
                step={0.01}
                value={joints[axis]}
                onChange={(e) => handleChange(axis, parseFloat(e.target.value))}
                className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 min-w-0"
              />
              
              <button 
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                onClick={() => handleChange(axis, Math.min(JOINT_LIMITS[axis].max, joints[axis] + 1))}
              >
                <RotateCw size={12} />
              </button>

              <input
                type="number"
                min={JOINT_LIMITS[axis].min}
                max={JOINT_LIMITS[axis].max}
                step={0.01}
                value={joints[axis]} // Keep raw value
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleChange(axis, val);
                }}
                className="w-16 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-1 py-0.5 rounded focus:border-amber-500 focus:outline-none text-right font-mono flex-shrink-0 ml-1"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Presets - Calibrated Poses */}
      <div className="px-5 pb-5 mt-auto border-t border-slate-800 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setJoints({ j1: 0, j2: 90, j3: 0, j4: 0, j5: -90, j6: 0 })}
            className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
            title="L-Shape: X=1562, Z=1718"
          >
            Pose 1 (Ready)
          </button>
          <button 
            onClick={() => setJoints({ j1: 0, j2: 155, j3: 0, j4: 0, j5: 0, j6: 0 })}
            className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
            title="Back: X=-272, Z=2502"
          >
            Pose 2 (High)
          </button>
          <button 
             onClick={() => setJoints({ j1: 0, j2: 10, j3: 0, j4: 0, j5: 0, j6: 0 })}
            className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
            title="Fwd: X=1877, Z=-608"
          >
            Pose 3 (Low)
          </button>
        </div>
      </div>
    </div>
  );
};
