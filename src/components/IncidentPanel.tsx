import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, BrainCircuit, Building2, MapPin, Users, Clock,
  ChevronRight, Target, FileText, ExternalLink,
} from 'lucide-react';
import { useStore, severityColors, severityTextColors, severityLabels } from '../store/useStore';
import type { Incident } from '../types';
import DamageAssessment from './DamageAssessment';

export default function IncidentPanel() {
  const { selectedIncident, setSelectedIncident, isMobile, setShowAIReport } = useStore();

  if (!selectedIncident) return null;

  if (isMobile) {
    return <MobileSheet incident={selectedIncident} onClose={() => setSelectedIncident(null)} onAIReport={() => setShowAIReport(true)} />;
  }

  return <DesktopPanel incident={selectedIncident} onClose={() => setSelectedIncident(null)} onAIReport={() => setShowAIReport(true)} />;
}

// Before/After Image Comparison Slider
function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-44 rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      {/* Before (saturated/flooded look) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-1">🌊</div>
            <p className="text-[10px] text-blue-300 font-semibold">Flooded Area</p>
            <p className="text-[9px] text-slate-400">Aug 20, 2026 — 06:00 UTC</p>
          </div>
        </div>
        {/* Simulated flood water */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-600/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/30 to-transparent" />
      </div>

      {/* After (recovery look) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-600 via-emerald-900/30 to-slate-700"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-1">🏗️</div>
            <p className="text-[10px] text-emerald-300 font-semibold">Recovery Progress</p>
            <p className="text-[9px] text-slate-400">Aug 23, 2026 — 14:00 UTC</p>
          </div>
        </div>
        {/* Simulated dry land */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-900/20 to-transparent" />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
        style={{ left: `${sliderPos}%` }}
        onMouseDown={(e) => { e.stopPropagation(); isDragging.current = true; }}
        onTouchStart={(e) => { e.stopPropagation(); isDragging.current = true; }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center cursor-ew-resize">
          <div className="flex gap-0.5">
            <ChevronRight size={10} className="text-white -rotate-180" />
            <ChevronRight size={10} className="text-white" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 glass rounded-md px-2 py-0.5 z-5">
        <span className="text-[9px] font-semibold text-white">BEFORE</span>
      </div>
      <div className="absolute top-2 right-2 glass rounded-md px-2 py-0.5 z-5">
        <span className="text-[9px] font-semibold text-white">AFTER</span>
      </div>
    </div>
  );
}

function DesktopPanel({ incident, onClose, onAIReport }: { incident: Incident; onClose: () => void; onAIReport: () => void }) {
  const color = severityColors[incident.severity];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-96 h-full glass flex flex-col z-30 shrink-0 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: color,
                boxShadow: incident.severity === 'critical' ? `0 0 10px ${color}60` : 'none',
              }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
              {severityLabels[incident.severity]}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <h2 className="text-sm font-bold text-white mb-1">{incident.title}</h2>
        <p className="text-[10px] text-slate-400">{incident.id} • Updated {new Date(incident.updatedAt).toLocaleTimeString()}</p>
      </div>

      {/* Priority Score */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-300">Priority Score</span>
          <span className="text-lg font-black" style={{ color }}>{incident.priorityScore}<span className="text-xs text-slate-500">/100</span></span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${incident.priorityScore}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="glass-light rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <BrainCircuit size={12} className="text-cyan-400" />
              <span className="text-[9px] text-slate-400">AI Confidence</span>
            </div>
            <span className="text-sm font-bold text-white">{Math.round(incident.aiConfidence * 100)}%</span>
          </div>
          <div className="glass-light rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Users size={12} className="text-orange-400" />
              <span className="text-[9px] text-slate-400">Linked Reports</span>
            </div>
            <span className="text-sm font-bold text-white">{incident.reportCount}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Assessment</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{incident.description}</p>
      </div>

      {/* Before/After */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Visual Evidence</h3>
        <BeforeAfterSlider />
      </div>

      {/* Nearby Infrastructure */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Nearby Infrastructure</h3>
        <div className="space-y-1.5">
          {incident.nearbyInfrastructure.map((infra) => {
            const infraIcons: Record<string, string> = {
              hospital: '🏥', shelter: '🏠', police: '🚓', fire_station: '🚒',
            };
            return (
              <div key={infra.name} className="flex items-center gap-2 glass-light rounded-lg px-3 py-2">
                <span className="text-sm">{infraIcons[infra.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-white truncate">{infra.name}</p>
                  <p className="text-[9px] text-slate-500">{infra.type.replace('_', ' ')}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-300 shrink-0">{infra.distance}km</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Reports */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Incoming Reports ({incident.reports.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {incident.reports.map((report) => (
            <div key={report.id} className="glass-light rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">{report.source}</span>
                <span className="text-[9px] text-slate-500">{new Date(report.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">{report.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Damage Assessment */}
      <div className="p-4 border-b border-white/5">
        <DamageAssessment incidentType={incident.type} severity={incident.severity} />
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full glass-light hover:bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-colors">
            <Target size={14} className="text-blue-400 shrink-0" />
            <span className="text-xs font-medium text-white">Assign Response Team</span>
          </button>
          <button
            onClick={onAIReport}
            className="w-full glass-light hover:bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-colors"
          >
            <FileText size={14} className="text-purple-400 shrink-0" />
            <span className="text-xs font-medium text-white">Generate AI Situation Report</span>
          </button>
          <button className="w-full glass-light hover:bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-colors">
            <MapPin size={14} className="text-green-400 shrink-0" />
            <span className="text-xs font-medium text-white">Center Map on Incident</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MobileSheet({ incident, onClose, onAIReport }: { incident: Incident; onClose: () => void; onAIReport: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 glass rounded-t-2xl z-40 max-h-[80vh] overflow-y-auto"
    >
      {/* Handle */}
      <div className="flex justify-center py-2">
        <div className="w-10 h-1 rounded-full bg-slate-600" />
      </div>

      {/* Header */}
      <div className="px-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ background: severityColors[incident.severity] }} />
          <span className="text-[10px] font-bold uppercase" style={{ color: severityColors[incident.severity] }}>
            {severityLabels[incident.severity]}
          </span>
          <button onClick={onClose} className="ml-auto p-1">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <h2 className="text-sm font-bold text-white">{incident.title}</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{incident.id}</p>
      </div>

      {/* Score */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300">Priority Score</span>
          <span className="text-lg font-black" style={{ color: severityColors[incident.severity] }}>{incident.priorityScore}/100</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
          <div className="h-full rounded-full" style={{ width: `${incident.priorityScore}%`, background: severityColors[incident.severity] }} />
        </div>
      </div>

      {/* Before/After */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-2">Visual Evidence</h3>
        <BeforeAfterSlider />
      </div>

      {/* AI Damage Assessment */}
      <div className="p-4 border-b border-white/5">
        <DamageAssessment incidentType={incident.type} severity={incident.severity} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <button className="w-full bg-blue-500/20 border border-blue-500/30 rounded-xl py-2.5 text-xs font-semibold text-blue-400">
          Assign Response Team
        </button>
        <button
          onClick={onAIReport}
          className="w-full bg-purple-500/20 border border-purple-500/30 rounded-xl py-2.5 text-xs font-semibold text-purple-400"
        >
          Generate AI Report
        </button>
      </div>
    </motion.div>
  );
}
