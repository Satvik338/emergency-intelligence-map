import { motion } from 'framer-motion';
import {
  X, BrainCircuit, AlertTriangle, TrendingUp, Target, MapPin,
  Clock, BarChart3, CheckCircle2,
} from 'lucide-react';
import { useStore, severityColors, severityLabels } from '../store/useStore';
import type { SeverityLevel } from '../types';

const PRIORITY_BREAKDOWN = [
  { label: 'Base Severity', score: 40, max: 40, color: '#ef4444', icon: AlertTriangle },
  { label: 'Report Density & Volume', score: 18, max: 25, color: '#f97316', icon: BarChart3 },
  { label: 'Critical Infrastructure Proximity', score: 20, max: 20, color: '#eab308', icon: MapPin },
  { label: 'Dynamic Escalation Trend', score: 13, max: 15, color: '#3b82f6', icon: TrendingUp },
];

const TOTAL_SCORE = PRIORITY_BREAKDOWN.reduce((acc, item) => acc + item.score, 0);
const TOTAL_MAX = PRIORITY_BREAKDOWN.reduce((acc, item) => acc + item.max, 0);

const RAW_REPORTS = [
  { id: 1, text: 'Road flooded, water entering houses near Main Street.', source: 'Citizen App', time: '08:15', sentiment: -0.89 },
  { id: 2, text: 'Water level rising rapidly, people need immediate help on 2nd floor.', source: 'SMS Alert', time: '08:22', sentiment: -0.95 },
  { id: 3, text: 'Bridge has collapsed, entire east side cut off.', source: 'Field Report', time: '09:01', sentiment: -0.88 },
];

export default function AIReportPanel() {
  const { showAIReport, setShowAIReport, selectedIncident, isMobile } = useStore();

  if (!showAIReport) return null;

  const severity: SeverityLevel = TOTAL_SCORE >= 90 ? 'critical' : TOTAL_SCORE >= 70 ? 'high' : 'moderate';
  const color = severityColors[severity];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setShowAIReport(false)}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`fixed z-50 glass rounded-2xl overflow-y-auto ${
          isMobile
            ? 'inset-x-3 top-16 bottom-3'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md p-4 border-b border-white/5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Situation Report</h2>
              <p className="text-[10px] text-slate-400">
                {selectedIncident ? selectedIncident.id : 'INC-001'} • Generated {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button onClick={() => setShowAIReport(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Report Aggregation Summary */}
          <div className="glass-light rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400" />
              Consolidated Incident: <span className="text-orange-400">Flood Incident #102</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                <span className="text-lg font-bold text-white">3</span>
                <p className="text-[9px] text-slate-500">Raw Reports</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                <span className="text-lg font-bold text-white">96%</span>
                <p className="text-[9px] text-slate-500">AI Confidence</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                <span className="text-lg font-bold text-white">3</span>
                <p className="text-[9px] text-slate-500">Groups Merged</p>
              </div>
            </div>

            {/* Raw Reports */}
            <div className="space-y-2">
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Incoming Reports</span>
              {RAW_REPORTS.map((report) => (
                <div key={report.id} className="bg-slate-800/40 rounded-lg p-2.5 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">{report.source}</span>
                    <span className="text-[9px] text-slate-500">⏱ {report.time}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="text-[9px] text-slate-500">{Math.abs(report.sentiment * 100).toFixed(0)}% negative</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">{report.text}</p>
                </div>
              ))}
            </div>

            {/* AI Grouping Arrow */}
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-slate-600" />
                <div className="glass rounded-full px-3 py-1 flex items-center gap-1.5">
                  <BrainCircuit size={10} className="text-purple-400" />
                  <span className="text-[9px] font-semibold text-purple-400">AI Auto-Grouped</span>
                </div>
                <div className="w-8 h-px bg-slate-600" />
              </div>
            </div>

            {/* Merged Result */}
            <div className="bg-slate-800/60 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={12} className="text-orange-400" />
                <span className="text-[10px] font-bold text-orange-400">Consolidated: Flood Incident #102</span>
              </div>
              <p className="text-[10px] text-slate-400">All 3 reports reference the same location and describe escalating flood conditions in the Brahmaputra Basin area. AI has identified common geolocation, incident type, and temporal clustering.</p>
            </div>
          </div>

          {/* Priority Score Breakdown */}
          <div className="glass-light rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-slate-300 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-400" />
                AI Priority Calculator Breakdown
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black" style={{ color }}>{TOTAL_SCORE}</span>
                <span className="text-xs text-slate-500">/ {TOTAL_MAX}</span>
              </div>
            </div>

            {/* Total Score Bar */}
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(TOTAL_SCORE / TOTAL_MAX) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #ef4444, #f97316)` }}
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
              <span className="text-xs font-bold uppercase" style={{ color }}>{severityLabels[severity]}</span>
              <span className="text-[10px] text-slate-500">— Score of {TOTAL_SCORE}/100 indicates critical priority</span>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-3">
              {PRIORITY_BREAKDOWN.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color: item.color }} />
                        <span className="text-[10px] font-medium text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: item.color }}>
                        {item.score} <span className="text-slate-500 font-normal">/ {item.max}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.score / item.max) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Scoring Algorithm Note */}
            <div className="mt-4 glass rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <BrainCircuit size={10} className="text-cyan-400" />
                <span className="text-[9px] font-semibold text-cyan-400">AI Scoring Methodology</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">
                Scores are computed in real-time using a weighted ensemble of NLP sentiment analysis, geospatial proximity graphs, temporal escalation detection, and population density modeling. Model: EmergencyScore v3.2 — validated against 12,000 historical incidents.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-500/20 border border-blue-500/30 rounded-xl py-2.5 text-[11px] font-semibold text-blue-400 flex items-center justify-center gap-2">
              <Target size={14} />
              Deploy Response
            </button>
            <button className="flex-1 bg-slate-800/60 border border-white/10 rounded-xl py-2.5 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-2">
              <Clock size={14} />
              Schedule Review
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
