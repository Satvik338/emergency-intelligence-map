import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, X, Zap, Send, ChevronRight, Clock, Users, Smartphone,
  AlertTriangle, Shield, Megaphone, ChevronDown, ChevronUp, History,
} from 'lucide-react';
import { useStore, severityColors } from '../store/useStore';
import type { BroadcastSeverity, TargetZone } from '../types';

const SEVERITY_OPTIONS: { id: BroadcastSeverity; label: string; color: string; icon: string; prefix: string; description: string }[] = [
  { id: 'critical_evacuation', label: 'Critical Evacuation', color: '#ef4444', icon: '🚨', prefix: '🚨', description: 'Immediate life-saving action required' },
  { id: 'severe_warning', label: 'Severe Warning', color: '#f97316', icon: '🔴', prefix: '🔴', description: 'Dangerous conditions — take precaution' },
  { id: 'public_advisory', label: 'Public Advisory', color: '#eab308', icon: '🟡', prefix: '🟡', description: 'Informational guidance for residents' },
];

const ZONE_OPTIONS: { id: TargetZone; label: string }[] = [
  { id: 'sector_1', label: 'Sector 1 — North District' },
  { id: 'sector_2', label: 'Sector 2 — South District' },
  { id: 'sector_3', label: 'Sector 3 — East District' },
  { id: 'sector_4', label: 'Sector 4 — West District' },
  { id: 'entire_city', label: 'Entire City' },
];

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function BroadcastControlModal() {
  const { showBroadcastModal, setShowBroadcastModal, pushBroadcast, showBroadcastHistory, setShowBroadcastHistory } = useStore();

  const [targetZone, setTargetZone] = useState<TargetZone>('sector_4');
  const [severity, setSeverity] = useState<BroadcastSeverity>('critical_evacuation');
  const [message, setMessage] = useState('');
  const [pushed, setPushed] = useState(false);

  const selectedSeverity = SEVERITY_OPTIONS.find((s) => s.id === severity);

  const handlePush = () => {
    if (!message.trim()) return;
    pushBroadcast({
      operatorId: 'OP-DR-SINGH',
      targetZone,
      severity,
      message: message.trim(),
    });
    setPushed(true);
    setTimeout(() => {
      setPushed(false);
      setMessage('');
    }, 2000);
  };

  if (!showBroadcastModal) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[2000]" onClick={() => setShowBroadcastModal(false)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
          {pushed ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Zap size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">⚡ Broadcast Pushed!</h3>
              <p className="text-sm text-slate-400">Directive is being delivered to all devices in the target zone.</p>
            </motion.div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Megaphone size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Broadcast Directive</h2>
                    <p className="text-[11px] text-slate-400">Push emergency directives to public feeds</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowBroadcastHistory(!showBroadcastHistory)} className="glass-light rounded-lg px-3 py-1.5 text-[10px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <History size={12} /> History
                  </button>
                  <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ─── Left: Form ─────────────────────────────────── */}
                <div className="space-y-4">
                  {/* Target Zone */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target Zone</label>
                    <div className="relative">
                      <select
                        value={targetZone}
                        onChange={(e) => setTargetZone(e.target.value as TargetZone)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none appearance-none focus:border-blue-500/50 cursor-pointer"
                      >
                        {ZONE_OPTIONS.map((z) => (
                          <option key={z.id} value={z.id}>{z.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Directive Severity */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Directive Severity</label>
                    <div className="space-y-1.5">
                      {SEVERITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSeverity(opt.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            severity === opt.id
                              ? 'border-opacity-40 bg-opacity-10'
                              : 'border-white/5 bg-white/5 hover:bg-white/10'
                          }`}
                          style={severity === opt.id ? { borderColor: `${opt.color}40`, background: `${opt.color}10` } : {}}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white">{opt.label}</div>
                            <div className="text-[9px] text-slate-500">{opt.description}</div>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: opt.color }}>
                            {severity === opt.id && <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Message Content</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type the emergency directive message here..."
                      rows={4}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/30 resize-none"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-slate-600">{message.length}/500 characters</span>
                      <span className="text-[9px] text-slate-600">Estimated reach: {targetZone === 'entire_city' ? '~185,000' : '~42,000'} devices</span>
                    </div>
                  </div>

                  {/* Push Button */}
                  <button
                    onClick={handlePush}
                    disabled={!message.trim()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:shadow-none"
                  >
                    <Zap size={16} /> ⚡ Push Broadcast to Public
                  </button>
                </div>

                {/* ─── Right: Civilian Preview ────────────────────── */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Smartphone size={12} /> Civilian Mobile Push View
                  </label>
                  <CivilianPhonePreview
                    severity={severity}
                    zone={targetZone}
                    message={message}
                  />

                  {/* Broadcast History */}
                  <BroadcastHistoryPanel />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Civilian Phone Preview ─────────────────────────────────────────────────
function CivilianPhonePreview({ severity, zone, message }: { severity: BroadcastSeverity; zone: TargetZone; message: string }) {
  const sc = SEVERITY_OPTIONS.find((s) => s.id === severity);
  const zoneLabel = ZONE_OPTIONS.find((z) => z.id === zone)?.label || zone;

  return (
    <div className="glass rounded-xl p-4">
      <div className="bg-slate-800 rounded-2xl overflow-hidden border border-white/5 max-w-[260px] mx-auto">
        {/* Phone status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-black/40">
          <span className="text-[8px] text-slate-400 font-mono">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-sm bg-green-400" />
            <div className="text-[8px] text-slate-400">100%</div>
          </div>
        </div>

        {/* Lock screen */}
        <div className="px-4 pt-3 pb-2">
          <div className="text-center mb-3">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Emergency Alert</div>
            <div className="text-xs font-bold text-white mt-0.5">Government of Assam</div>
          </div>

          {/* Push Notification Card */}
          <div className="rounded-xl p-3 border" style={{ background: `${sc?.color}10`, borderColor: `${sc?.color}30` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: sc?.color }}>
                <AlertTriangle size={12} className="text-white" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-white">Emergency Alert</div>
                <div className="text-[8px] text-slate-400">Just now</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${sc?.color}30`, color: sc?.color }}>{sc?.label}</span>
            </div>
            <p className="text-[10px] text-slate-200 leading-relaxed">
              {message || 'Your emergency message will appear here as a push notification...'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[8px] text-slate-500">📍 {zoneLabel}</span>
            </div>
          </div>

          {/* SMS Preview */}
          <div className="mt-2 rounded-lg p-2 bg-slate-900/50 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={10} className="text-blue-400" />
              <span className="text-[8px] font-bold text-blue-400">SMS Alert</span>
            </div>
            <p className="text-[9px] text-slate-300 leading-relaxed">
              {message
                ? `[EMERGENCY] ${sc?.prefix} ${message.substring(0, 100)}${message.length > 100 ? '...' : ''} — Reply HELP for assistance.`
                : '[EMERGENCY] Your emergency directive will be sent via SMS to all registered mobile numbers in the zone.'}
            </p>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-around px-4 py-2 border-t border-white/5">
          <div className="text-center"><div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto"><Shield size={10} className="text-blue-400" /></div><span className="text-[7px] text-slate-500">Safety</span></div>
          <div className="text-center"><div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mx-auto"><AlertTriangle size={10} className="text-red-400" /></div><span className="text-[7px] text-slate-500">SOS</span></div>
          <div className="text-center"><div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"><Users size={10} className="text-green-400" /></div><span className="text-[7px] text-slate-500">Help</span></div>
        </div>
      </div>
      <p className="text-[9px] text-slate-600 text-center mt-2">Preview — actual display varies by device</p>
    </div>
  );
}

// ─── Broadcast History Panel ─────────────────────────────────────────────────
function BroadcastHistoryPanel() {
  const { broadcastDirectives, showBroadcastHistory, setShowBroadcastHistory } = useStore();

  return (
    <div className="mt-4">
      <button onClick={() => setShowBroadcastHistory(!showBroadcastHistory)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors w-full">
        <History size={12} />
        <span>Broadcast History ({broadcastDirectives.length})</span>
        {showBroadcastHistory ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>

      <AnimatePresence>
        {showBroadcastHistory && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
              {broadcastDirectives.map((dir) => {
                const dsc = SEVERITY_OPTIONS.find((s) => s.id === dir.severity);
                return (
                  <div key={dir.id} className="glass-light rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{dsc?.icon}</span>
                      <span className="text-[9px] font-bold" style={{ color: dsc?.color }}>{dsc?.label}</span>
                      <span className="text-[8px] text-slate-500 ml-auto">{dir.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-2">{dir.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[8px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={8} />{new Date(dir.pushedAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Users size={8} />{dir.devicesReached.toLocaleString()}</span>
                      <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{dir.deliveryStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
