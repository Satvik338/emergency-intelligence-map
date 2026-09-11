import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Eye, EyeOff, Wifi, WifiOff, Users,
  AlertTriangle, ChevronDown, Globe,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { t, languages } from '../data/translations';
import type { Language } from '../types';
import { getSafetyInstruction } from '../data/safety';
import { useTTS } from '../hooks/useTTS';
import type { TriageEntity, TriageDisaster } from '../types';

const ENTITY_OPTIONS: { id: TriageEntity; emoji: string; label: string; enLabel: string }[] = [
  { id: 'person', emoji: '👤', label: 'person', enLabel: 'Person' },
  { id: 'farm_animal', emoji: '🐄', label: 'farm_animal', enLabel: 'Farm Animal' },
  { id: 'pet', emoji: '🐕', label: 'pet', enLabel: 'Pet' },
  { id: 'wildlife', emoji: '🐾', label: 'wildlife', enLabel: 'Wildlife' },
];

const DISASTER_OPTIONS: { id: TriageDisaster; emoji: string; label: string; enLabel: string }[] = [
  { id: 'flood', emoji: '🌊', label: 'flood', enLabel: 'Flood' },
  { id: 'fire', emoji: '🔥', label: 'fire', enLabel: 'Fire' },
  { id: 'earthquake', emoji: '🌍', label: 'earthquake', enLabel: 'Earthquake' },
  { id: 'landslide', emoji: '⛰️', label: 'landslide', enLabel: 'Landslide' },
];

export default function CommunitySafety() {
  const {
    language, setLanguage,
    triageEntity, setTriageEntity,
    triageDisaster, setTriageDisaster,
    visualMode, setVisualMode,
  } = useStore();
  const { speak, stop, isSpeaking } = useTTS();
  const [isOnline, setIsOnline] = useState(true);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const instruction = triageEntity && triageDisaster
    ? getSafetyInstruction(triageEntity, triageDisaster)
    : null;

  // Check online status
  useEffect(() => {
    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  const selectedLang = languages.find((l) => l.code === language);

  const handleSpeakSteps = () => {
    if (isSpeaking) {
      stop();
    } else if (instruction) {
      speakSteps(instruction.steps.map((s) => ({ title: s.title, description: s.description })));
    }
  };

  const speakSteps = (steps: { title: string; description: string }[]) => {
    const fullText = steps.map((s, i) => `${t(language, 'step')} ${i + 1}: ${s.title}. ${s.description}`).join('. ');
    speak(fullText);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{t(language, 'community_safety')}</h1>
              <p className="text-xs text-slate-400">{t(language, 'safety_instructions')}</p>
            </div>
          </div>
        </motion.div>

        {/* Top Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="glass rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Globe size={16} className="text-blue-400" />
              <span className="text-xs font-medium text-white">{selectedLang?.nativeName}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 glass rounded-xl py-1 w-48 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as Language);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${
                        language === lang.code ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                      }`}
                    >
                      {lang.nativeName} <span className="text-slate-500">({lang.name})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Visual Learning Mode Toggle */}
          <button
            onClick={() => setVisualMode(!visualMode)}
            className={`glass rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${
              visualMode ? 'bg-purple-500/20 border-purple-500/30 border' : 'hover:bg-slate-800'
            }`}
          >
            {visualMode ? <Eye size={16} className="text-purple-400" /> : <EyeOff size={16} className="text-slate-400" />}
            <span className="text-xs font-medium text-white">{t(language, 'visual_mode')}</span>
          </button>

          {/* TTS Button */}
          <button
            onClick={handleSpeakSteps}
            disabled={!instruction}
            className={`glass rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${
              isSpeaking ? 'bg-green-500/20 border-green-500/30 border' : 'hover:bg-slate-800'
            } ${!instruction ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isSpeaking ? (
              <VolumeX size={16} className="text-green-400" />
            ) : (
              <Volume2 size={16} className="text-slate-400" />
            )}
            <span className="text-xs font-medium text-white">
              {isSpeaking ? t(language, 'stop') : t(language, 'listen')}
            </span>
          </button>

          {/* Offline Indicator */}
          <div className="ml-auto glass rounded-xl px-3 py-2 flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi size={14} className="text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">{t(language, 'offline_available')}</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-yellow-400" />
                <span className="text-[10px] text-yellow-400 font-medium">{t(language, 'offline_available')}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Triage Tool */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 mb-6"
        >
          <h2 className="text-sm font-bold text-white mb-1">{t(language, 'who_needs_help')}</h2>
          <p className="text-[10px] text-slate-400 mb-4">Select who needs help and the type of emergency</p>

          {/* Entity Selector */}
          <div className="mb-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              {t(language, 'who_needs_help')}
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ENTITY_OPTIONS.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => setTriageEntity(entity.id)}
                  className={`glass-light rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                    triageEntity === entity.id
                      ? 'bg-blue-500/20 border-blue-500/30 border-2 ring-1 ring-blue-500/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{entity.emoji}</span>
                  <span className="text-[10px] font-medium text-white">{t(language, entity.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Disaster Selector */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              {t(language, 'select_disaster')}
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DISASTER_OPTIONS.map((disaster) => (
                <button
                  key={disaster.id}
                  onClick={() => setTriageDisaster(disaster.id)}
                  className={`glass-light rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                    triageDisaster === disaster.id
                      ? 'bg-orange-500/20 border-orange-500/30 border-2 ring-1 ring-orange-500/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{disaster.emoji}</span>
                  <span className="text-[10px] font-medium text-white">{t(language, disaster.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Safety Instructions Output */}
        <AnimatePresence mode="wait">
          {instruction ? (
            <motion.div
              key={`${triageEntity}-${triageDisaster}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">{t(language, 'safety_steps')}</h3>
                <button
                  onClick={handleSpeakSteps}
                  className="glass-light rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  {isSpeaking ? <VolumeX size={12} className="text-green-400" /> : <Volume2 size={12} className="text-blue-400" />}
                  <span className="text-[10px] font-medium text-white">
                    {isSpeaking ? t(language, 'stop') : t(language, 'listen')}
                  </span>
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-5">
                {instruction.steps.map((step, idx) => (
                  <motion.div
                    key={step.order}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-xl overflow-hidden transition-all ${
                      visualMode ? 'glass-light p-4' : 'glass-light p-3'
                    } ${step.isUrgent ? 'border-l-2 border-red-500' : ''}`}
                    onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  >
                    {visualMode ? (
                      /* Visual Learning Mode - Large Illustration Cards */
                      <div className="text-center">
                        <div className="text-5xl mb-3">
                          {step.icon === 'ArrowUp' && '⬆️'}
                          {step.icon === 'AlertTriangle' && '⚠️'}
                          {step.icon === 'Zap' && '⚡'}
                          {step.icon === 'Phone' && '📞'}
                          {step.icon === 'Package' && '🎒'}
                          {step.icon === 'Radio' && '📻'}
                          {step.icon === 'ArrowDown' && '⬇️'}
                          {step.icon === 'Shield' && '🛡️'}
                          {step.icon === 'ShieldAlert' && '🛡️'}
                          {step.icon === 'DoorOpen' && '🚪'}
                          {step.icon === 'Footprints' && '👣'}
                          {step.icon === 'Home' && '🏠'}
                          {step.icon === 'TreePine' && '🌲'}
                          {step.icon === 'Car' && '🚗'}
                          {step.icon === 'ClipboardCheck' && '✅'}
                          {step.icon === 'ArrowUpRight' && '↗️'}
                          {step.icon === 'Eye' && '👁️'}
                          {step.icon === 'Heart' && '❤️'}
                          {step.icon === 'Mountain' && '⛰️'}
                          {step.icon === 'Droplets' && '💧'}
                          {step.icon === 'Camera' && '📷'}
                        </div>
                        {step.isUrgent && (
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full mb-2">
                            {t(language, 'urgent')}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                      </div>
                    ) : (
                      /* Compact Mode */
                      <div>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            step.isUrgent ? 'bg-red-500/20' : 'bg-slate-700/50'
                          }`}>
                            <span className="text-sm font-bold text-white">{step.order}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                              {step.isUrgent && (
                                <span className="text-[8px] font-bold uppercase text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                                  {t(language, 'urgent')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedStep === idx && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-[11px] text-slate-300 leading-relaxed mt-2 ml-11"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Warnings */}
              <div className="glass-light rounded-xl p-4 border-l-2 border-yellow-500/50">
                <h4 className="text-[11px] font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  {t(language, 'warnings')}
                </h4>
                <div className="space-y-1.5">
                  {instruction.warnings.map((warning, idx) => (
                    <p key={idx} className="text-[10px] text-yellow-200/80 leading-relaxed">{warning}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : triageEntity && triageDisaster ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-xs text-slate-400">No specific instructions available for this combination.</p>
              <p className="text-[10px] text-slate-500 mt-1">Please try a different selection or contact emergency services.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <div className="text-4xl mb-3">🆘</div>
              <p className="text-sm text-slate-300 font-medium mb-1">Select who needs help and the disaster type above</p>
              <p className="text-[10px] text-slate-500">Step-by-step safety instructions will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
