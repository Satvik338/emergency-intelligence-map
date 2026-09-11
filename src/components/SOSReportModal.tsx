import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, MapPin, Camera, Send, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { SOSEmergencyType } from '../types';

const EMERGENCY_OPTIONS: { id: SOSEmergencyType; emoji: string; label: string }[] = [
  { id: 'flood', emoji: '🌊', label: 'Flood' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'trapped', emoji: '🆘', label: 'Trapped' },
  { id: 'medical', emoji: '🏥', label: 'Medical' },
];

export default function SOSReportModal() {
  const { showSOSModal, setShowSOSModal, addSOSReport, sosReports } = useStore();
  const [type, setType] = useState<SOSEmergencyType>('flood');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Mock GPS coordinates centered on India
    const mockLat = 22.5 + (Math.random() - 0.5) * 10;
    const mockLng = 78.9 + (Math.random() - 0.5) * 10;

    addSOSReport({
      id: `SOS-${Date.now()}`,
      type,
      location: { lat: mockLat, lng: mockLng, label: `${mockLat.toFixed(4)}°N, ${mockLng.toFixed(4)}°E` },
      description: desc || `Citizen-reported ${type} emergency`,
      reportedAt: new Date().toISOString(),
      status: 'new',
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowSOSModal(false);
      setType('flood');
      setDesc('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {showSOSModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowSOSModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass rounded-2xl w-full max-w-sm border border-white/10 pointer-events-auto overflow-hidden">
              {submitted ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Report Submitted!</h3>
                  <p className="text-sm text-slate-400">Emergency services have been notified. Your report ID is being generated.</p>
                </motion.div>
              ) : (
                /* Form */
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center animate-pulse">
                        <Siren size={16} className="text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Report Emergency</h3>
                        <p className="text-[10px] text-slate-500">SOS Crowdsourced Report</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSOSModal(false)} className="text-slate-400 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Emergency Type */}
                  <div className="mb-3">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Emergency Type</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {EMERGENCY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setType(opt.id)}
                          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-medium transition-all border ${
                            type === opt.id
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                          }`}
                        >
                          <span className="text-base">{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
                    <div className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2">
                      <MapPin size={14} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-slate-300">Auto-detected: 22.6100°N, 80.1200°E</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Describe what you see..."
                      rows={3}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/30 resize-none"
                    />
                  </div>

                  {/* Photo placeholder */}
                  <div className="mb-4">
                    <button className="w-full border border-dashed border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-500 text-xs hover:bg-white/5 transition-colors">
                      <Camera size={14} />
                      <span>Add Photo (optional)</span>
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
                  >
                    <Send size={16} />
                    Submit SOS Report
                  </button>

                  {sosReports.length > 0 && (
                    <p className="text-[10px] text-slate-600 text-center mt-2">{sosReports.length} report(s) submitted this session</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
