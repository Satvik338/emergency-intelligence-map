import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Clock, Layers,
  ChevronRight, Camera, Radar,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ZoomLevel } from '../types';

const TOUR_STEPS = [
  { zoom: 1 as ZoomLevel, label: 'National Overview', description: 'Scanning India for active disaster zones...', duration: 3000 },
  { zoom: 2 as ZoomLevel, label: 'Critical Hotspot', description: 'Identifying Brahmaputra Basin — Severe Flood', duration: 4000 },
  { zoom: 3 as ZoomLevel, label: 'Infrastructure View', description: 'Mapping hospitals, shelters, and rescue units', duration: 3500 },
  { zoom: 4 as ZoomLevel, label: 'Incident #102', description: 'Detailed priority assessment — Score 94/100', duration: 4000 },
  { zoom: 5 as ZoomLevel, label: 'Ground Intelligence', description: 'Activating drone and satellite feeds', duration: 3000 },
];

export function TourControls() {
  const {
    tourActive, setTourActive,
    tourStep, setTourStep,
    setZoomLevel,
    isMobile,
  } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const stepTimerRef = useRef<number | null>(null);

  const advanceStep = useCallback(() => {
    const nextStep = useStore.getState().tourStep;
    if (nextStep >= TOUR_STEPS.length - 1) {
      setTourActive(false);
      setTourStep(0);
      return;
    }
    const newStep = nextStep + 1;
    setTourStep(newStep);
    setZoomLevel(TOUR_STEPS[newStep].zoom);
  }, [setTourActive, setTourStep, setZoomLevel]);

  useEffect(() => {
    if (!tourActive || isPaused) {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      return;
    }

    const currentTourStep = TOUR_STEPS[tourStep];
    if (!currentTourStep) return;

    setZoomLevel(currentTourStep.zoom);

    stepTimerRef.current = window.setTimeout(() => {
      advanceStep();
    }, currentTourStep.duration);

    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, [tourActive, tourStep, isPaused, advanceStep, setZoomLevel]);

  const startTour = () => {
    setTourStep(0);
    setTourActive(true);
    setIsPaused(false);
    setZoomLevel(TOUR_STEPS[0].zoom);
  };

  const stopTour = () => {
    setTourActive(false);
    setTourStep(0);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={tourActive ? stopTour : startTour}
        className={`glass rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] font-semibold transition-all ${
          tourActive
            ? 'bg-purple-500/20 border-purple-500/30 border text-purple-400'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        {tourActive ? <Pause size={14} /> : <Play size={14} />}
        {isMobile ? '' : tourActive ? 'Stop Tour' : 'Intelligence Tour'}
      </button>

      {tourActive && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="glass rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
        >
          {isPaused ? <Play size={14} className="text-green-400" /> : <Pause size={14} className="text-yellow-400" />}
        </button>
      )}
    </div>
  );
}

export function TimelineSlider() {
  const {
    timelineEnabled, setTimelineEnabled,
    timelineRange, setTimelineRange,
    timelinePosition, setTimelinePosition,
    isMobile,
  } = useStore();

  const ranges: Array<'6h' | '24h' | '3d' | '7d'> = ['6h', '24h', '3d', '7d'];

  // Calculate time based on position and range
  const getTimeLabel = () => {
    const now = new Date();
    const rangeMs: Record<string, number> = {
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    const elapsed = rangeMs[timelineRange] * (timelinePosition / 100);
    const time = new Date(now.getTime() - (rangeMs[timelineRange] - elapsed));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateLabel = () => {
    const now = new Date();
    const rangeMs: Record<string, number> = {
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    const elapsed = rangeMs[timelineRange] * (timelinePosition / 100);
    const time = new Date(now.getTime() - (rangeMs[timelineRange] - elapsed));
    return time.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 glass rounded-2xl ${
        isMobile ? 'w-[calc(100%-2rem)]' : 'w-[600px]'
      }`}
    >
      <div className="p-3">
        {/* Top row: toggle + range selector + time display */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setTimelineEnabled(!timelineEnabled)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${
              timelineEnabled
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={12} />
            {isMobile ? '' : 'Timeline'}
          </button>

          {timelineEnabled && (
            <>
              <div className="flex items-center gap-1">
                {ranges.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimelineRange(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      timelineRange === r
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{getDateLabel()}</span>
                <span className="text-[11px] font-mono font-bold text-white">{getTimeLabel()}</span>
              </div>
            </>
          )}
        </div>

        {/* Timeline Track */}
        {timelineEnabled && (
          <div className="relative">
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-150"
                style={{ width: `${timelinePosition}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={timelinePosition}
              onChange={(e) => setTimelinePosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Tick marks */}
            <div className="flex justify-between mt-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-px h-1.5 bg-slate-600" />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TourOverlay() {
  const { tourActive, tourStep } = useStore();

  if (!tourActive) return null;

  const step = TOUR_STEPS[tourStep];
  if (!step) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-20 left-1/2 -translate-x-1/2 z-30 glass rounded-2xl px-5 py-3 max-w-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
          <Radar size={20} className="text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-xs font-bold text-white">{step.label}</h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
              Step {tourStep + 1}/{TOUR_STEPS.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">{step.description}</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 mt-3">
        {TOUR_STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx <= tourStep ? 'bg-purple-500 flex-1' : 'bg-slate-700 flex-1'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
