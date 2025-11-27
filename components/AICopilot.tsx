import React, { useState, useRef, useEffect } from 'react';
import { generateRobotPose } from '../services/geminiService';
import { JointState, ChatMessage } from '../types';
import { MessageSquare, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AICopilotProps {
  joints: JointState;
  setJoints: React.Dispatch<React.SetStateAction<JointState>>;
}

export const AICopilot: React.FC<AICopilotProps> = ({ joints, setJoints }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'Hello! I am your AI Robotics Copilot. Ask me to move the robot (e.g., "Move to welding position" or "Wave hello").' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const targetJoints = await generateRobotPose(joints, userMsg);
      
      if (targetJoints) {
        setJoints(targetJoints);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Moving robot to requested position.\nTarget: J1:${targetJoints.j1}°, J2:${targetJoints.j2}°, J3:${targetJoints.j3}°...` 
        }]);
      } else {
         setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I couldn't calculate a valid pose for that request. Please try again.",
          isError: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error connecting to AI service. Make sure API Key is configured.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute bottom-6 right-6 z-20 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-amber-500 text-white rotate-90' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
        }`}
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Panel */}
      <div 
        className={`absolute bottom-20 right-6 z-20 w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="font-semibold text-slate-200">AI Copilot</h3>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-amber-600 text-white rounded-br-none' 
                    : msg.isError
                      ? 'bg-red-900/30 text-red-200 border border-red-800/50 rounded-bl-none'
                      : 'bg-slate-800 text-slate-300 rounded-bl-none'
                }`}
              >
                {msg.isError && <AlertCircle size={14} className="inline mr-1.5 -mt-0.5" />}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3">
                 <Loader2 size={16} className="animate-spin text-amber-500" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 bg-slate-800/50 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command (e.g., 'Move Up')..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};