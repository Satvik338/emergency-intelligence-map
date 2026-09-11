import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle } from 'lucide-react';

interface DamageAssessmentProps {
  incidentType: string;
  severity: string;
}

export default function DamageAssessment({ incidentType, severity }: DamageAssessmentProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

  // Generate mock "before" and "after" imagery using CSS gradients
  const beforeGradient = getBeforeGradient(incidentType);
  const afterGradient = getAfterGradient(incidentType, severity);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={14} className="text-purple-400" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Post-Disaster AI Damage Assessment</h4>
      </div>

      <p className="text-[10px] text-slate-400 mb-3">Satellite imagery analysis — drag the slider to compare before and after states</p>

      <div
        ref={containerRef}
        className="relative w-full h-48 rounded-xl overflow-hidden cursor-ew-resize border border-white/10 select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* After image (full width, underneath) */}
        <div className="absolute inset-0" style={{ background: afterGradient }}>
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-[9px] font-bold text-red-400 uppercase">After</span>
          </div>
          {/* Damage markers */}
          <div className="absolute top-4 left-6 flex items-center gap-1 bg-red-500/30 backdrop-blur-sm px-2 py-1 rounded-full">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-[8px] text-red-300 font-bold">STRUCTURAL DAMAGE</span>
          </div>
          <div className="absolute top-1/2 left-1/3 flex items-center gap-1 bg-orange-500/30 backdrop-blur-sm px-2 py-1 rounded-full">
            <AlertTriangle size={10} className="text-orange-400" />
            <span className="text-[8px] text-orange-300 font-bold">FLOOD ZONE</span>
          </div>
        </div>

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0"
          style={{
            background: beforeGradient,
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          }}
        >
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-[9px] font-bold text-green-400 uppercase">Before</span>
          </div>
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Slider handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg flex items-center justify-center cursor-ew-resize">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-slate-600 rounded-full" />
              <div className="w-0.5 h-3 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assessment Summary */}
      <div className="mt-3 glass rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🤖</span>
          <span className="text-[10px] font-bold text-white">AI Assessment Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Damage Index', value: severity === 'critical' ? '87%' : severity === 'high' ? '72%' : severity === 'moderate' ? '45%' : '20%', color: severity === 'critical' ? 'text-red-400' : severity === 'high' ? 'text-orange-400' : severity === 'moderate' ? 'text-yellow-400' : 'text-green-400' },
            { label: 'Structures', value: severity === 'critical' ? '340+' : severity === 'high' ? '120+' : severity === 'moderate' ? '45+' : '10+', color: 'text-white' },
            { label: 'Recovery ETA', value: severity === 'critical' ? '14 days' : severity === 'high' ? '7 days' : severity === 'moderate' ? '3 days' : '1 day', color: 'text-blue-400' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[9px] text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getBeforeGradient(type: string): string {
  switch (type) {
    case 'flood':
      return 'linear-gradient(135deg, #1a472a 0%, #2d5a3e 30%, #3a7553 60%, #1a472a 100%)';
    case 'fire':
      return 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 30%, #1a472a 60%, #0d2818 100%)';
    case 'landslide':
      return 'linear-gradient(135deg, #2d4a3e 0%, #4a6b5a 30%, #6b8a7a 60%, #3d5a4e 100%)';
    default:
      return 'linear-gradient(135deg, #1a472a 0%, #3a7553 50%, #1a472a 100%)';
  }
}

function getAfterGradient(type: string, severity: string): string {
  const intensity = severity === 'critical' ? 0.8 : severity === 'high' ? 0.6 : 0.4;
  switch (type) {
    case 'flood':
      return `linear-gradient(135deg, rgba(30,58,95,${intensity}) 0%, rgba(59,130,246,${intensity * 0.7}) 30%, rgba(30,64,105,${intensity}) 60%, rgba(15,23,42,${intensity}) 100%)`;
    case 'fire':
      return `linear-gradient(135deg, rgba(127,29,29,${intensity}) 0%, rgba(180,83,9,${intensity * 0.7}) 30%, rgba(69,26,3,${intensity}) 60%, rgba(15,23,42,${intensity}) 100%)`;
    case 'landslide':
      return `linear-gradient(135deg, rgba(76,29,149,${intensity}) 0%, rgba(120,53,15,${intensity * 0.7}) 30%, rgba(69,26,3,${intensity}) 60%, rgba(15,23,42,${intensity}) 100%)`;
    default:
      return `linear-gradient(135deg, rgba(30,58,95,${intensity}) 0%, rgba(59,130,246,${intensity * 0.5}) 50%, rgba(15,23,42,${intensity}) 100%)`;
  }
}
