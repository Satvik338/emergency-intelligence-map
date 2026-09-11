import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, Users, ChevronRight,
  Filter, BrainCircuit,
} from 'lucide-react';
import { useStore, severityColors, severityLabels } from '../store/useStore';
import type { SeverityLevel } from '../types';

export default function IncidentsList() {
  const { incidents, setSelectedIncident, setCurrentView } = useStore();
  const [filter, setFilter] = useState<SeverityLevel | 'all'>('all');

  const filteredIncidents = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.severity === filter);

  const counts = {
    all: incidents.length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    high: incidents.filter((i) => i.severity === 'high').length,
    moderate: incidents.filter((i) => i.severity === 'moderate').length,
    low: incidents.filter((i) => i.severity === 'low').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-lg font-bold text-white mb-1">Active Incidents</h1>
          <p className="text-xs text-slate-400">{incidents.length} active emergencies being monitored</p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter size={14} className="text-slate-500" />
          {(['all', 'critical', 'high', 'moderate', 'low'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                filter === level
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {level === 'all' ? 'All' : severityLabels[level]} ({counts[level]})
            </button>
          ))}
        </motion.div>

        {/* Incident Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredIncidents.map((incident, idx) => {
              const color = severityColors[incident.severity];
              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedIncident(incident);
                    setCurrentView('live_map');
                  }}
                  className="glass rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                    >
                      <AlertTriangle size={18} style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{severityLabels[incident.severity]}</span>
                        <span className="text-[10px] text-slate-500">{incident.id}</span>
                        {incident.priorityScore >= 90 && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">{incident.title}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{incident.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${incident.priorityScore}%`, background: color }} />
                          </div>
                          <span className="font-mono font-bold text-slate-300">{incident.priorityScore}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BrainCircuit size={10} className="text-cyan-400" />
                          <span>{Math.round(incident.aiConfidence * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={10} />
                          <span>{incident.reportCount} reports</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{new Date(incident.updatedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-2 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
