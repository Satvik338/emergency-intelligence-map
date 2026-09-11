import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Pause, Play, ChevronDown, ChevronUp, Clock, Users } from 'lucide-react';
import { useStore, severityColors } from '../store/useStore';
import type { BroadcastSeverity } from '../types';

const severityConfig: Record<BroadcastSeverity, { label: string; color: string; bg: string; prefix: string }> = {
  critical_evacuation: { label: 'CRITICAL EVACUATION', color: '#ef4444', bg: 'bg-red-500/20', prefix: '🚨' },
  severe_warning: { label: 'SEVERE WARNING', color: '#f97316', bg: 'bg-orange-500/20', prefix: '🔴' },
  public_advisory: { label: 'PUBLIC ADVISORY', color: '#eab308', bg: 'bg-yellow-500/20', prefix: '🟡' },
};

const zoneLabels: Record<string, string> = {
  sector_1: 'Sector 1', sector_2: 'Sector 2', sector_3: 'Sector 3', sector_4: 'Sector 4', entire_city: 'Entire City',
};

export default function BroadcastTicker() {
  const { broadcastDirectives, tickerPaused, setTickerPaused } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate directives
  useEffect(() => {
    if (tickerPaused || broadcastDirectives.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % broadcastDirectives.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tickerPaused, broadcastDirectives.length]);

  if (broadcastDirectives.length === 0) return null;

  const active = broadcastDirectives[currentIndex];
  const sc = severityConfig[active.severity];

  return (
    <div className="relative z-[1100]">
      {/* ─── Main Ticker Bar ─────────────────────────────────────── */}
      <div className={`relative overflow-hidden border-b ${sc.bg} backdrop-blur-md`} style={{ borderColor: `${sc.color}30` }}>
        <div className="flex items-center h-10 px-0">
          {/* LIVE Badge */}
          <div className="shrink-0 flex items-center gap-2 px-4 h-full border-r border-white/10" style={{ background: `${sc.color}15` }}>
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sc.color }} />
              <div className="absolute w-2 h-2 rounded-full animate-ping" style={{ background: sc.color, opacity: 0.4 }} />
            </div>
            <Radio size={13} style={{ color: sc.color }} className="animate-pulse" />
            <span className="text-[10px] font-black tracking-wider" style={{ color: sc.color }}>LIVE BROADCAST</span>
          </div>

          {/* Severity Badge */}
          <div className="shrink-0 px-3 h-full flex items-center border-r border-white/10">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
          </div>

          {/* Scrolling Message */}
          <div className="flex-1 overflow-hidden h-full flex items-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-xs">{sc.prefix}</span>
                <span className="text-xs font-semibold text-white">{active.message}</span>
                <span className="text-[9px] text-slate-500 shrink-0 ml-2">— {zoneLabels[active.targetZone]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="shrink-0 flex items-center gap-1 px-3 border-l border-white/10">
            <button
              onClick={() => setTickerPaused(!tickerPaused)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={tickerPaused ? 'Resume ticker' : 'Pause ticker'}
            >
              {tickerPaused ? <Play size={12} className="text-green-400" /> : <Pause size={12} className="text-slate-400" />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={expanded ? 'Collapse log' : 'Expand broadcast log'}
            >
              {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </button>
            <span className="text-[9px] text-slate-500 font-mono ml-1">{currentIndex + 1}/{broadcastDirectives.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        {!tickerPaused && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5"
            style={{ background: sc.color }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: 'linear' }}
            key={`progress-${currentIndex}`}
          />
        )}
      </div>

      {/* ─── Expanded Broadcast Log ──────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 backdrop-blur-md bg-slate-900/90"
          >
            <div className="p-3 max-h-48 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Broadcast History</div>
              <div className="space-y-1.5">
                {broadcastDirectives.map((dir) => {
                  const dsc = severityConfig[dir.severity];
                  return (
                    <div key={dir.id} className="flex items-start gap-2 glass-light rounded-lg p-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: dsc.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold" style={{ color: dsc.color }}>{dsc.label}</span>
                          <span className="text-[8px] text-slate-500">{zoneLabels[dir.targetZone]}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate">{dir.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[8px] text-slate-500 flex items-center gap-1"><Clock size={8} />{new Date(dir.pushedAt).toLocaleTimeString()}</span>
                          <span className="text-[8px] text-slate-500 flex items-center gap-1"><Users size={8} />{dir.devicesReached.toLocaleString()} devices</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
