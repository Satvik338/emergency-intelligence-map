import { motion } from 'framer-motion';
import {
  BrainCircuit, MapPin,
  Users, Clock,
} from 'lucide-react';
import { useStore, severityColors, severityLabels } from '../store/useStore';
import { riskZones } from '../data/incidents';

const PREDICTIONS = [
  {
    id: 'PRD-001',
    title: 'Flood Escalation — Assam Basin',
    probability: 87,
    timeframe: '6-12 hours',
    impact: 'Critical',
    details: 'AI models predict continued rise in water levels. Brahmaputra tributaries showing exponential inflow. Evacuation of 15,000+ people recommended within 12 hours.',
    factors: ['Rainfall intensity increasing', 'Dam discharge levels rising', 'Tidal backflow from Bay of Bengal'],
    severity: 'critical' as const,
  },
  {
    id: 'PRD-002',
    title: 'Fire Spread — Nilgiri Corridor',
    probability: 72,
    timeframe: '12-24 hours',
    impact: 'High',
    details: 'Wind patterns suggest fire may spread eastward toward residential areas. Ground moisture at critical low. 3 villages in potential path.',
    factors: ['Wind speed: 25 km/h from west', 'Humidity dropping below 20%', 'Vegetation dryness index: 0.92'],
    severity: 'high' as const,
  },
  {
    id: 'PRD-003',
    title: 'Cyclone Formation — Bay of Bengal',
    probability: 65,
    timeframe: '24-48 hours',
    impact: 'Moderate',
    details: 'Deep depression in Bay of Bengal likely to intensify into cyclonic storm. Coastal districts of Odisha and West Bengal at risk.',
    factors: ['Sea surface temperature: 30.2°C', 'Upper air cyclonic circulation strengthening', 'Historical pattern match: Cyclone Amphan trajectory'],
    severity: 'moderate' as const,
  },
];

export default function RiskPrediction() {
  const {} = useStore();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Risk Prediction Engine</h1>
              <p className="text-xs text-slate-400">AI-powered disaster forecasting and escalation modeling</p>
            </div>
          </div>
        </motion.div>

        {/* Risk Zones Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <h2 className="text-[11px] font-semibold text-slate-300 mb-3 uppercase tracking-wider">Active Risk Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {riskZones.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: severityColors[zone.riskLevel] }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: severityColors[zone.riskLevel] }}>
                    {severityLabels[zone.riskLevel]}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white mb-2">{zone.name}</h3>
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <Users size={10} />
                  <span>{(zone.affectedPopulation / 1000000).toFixed(1)}M affected population</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-500">
                  <MapPin size={10} />
                  <span>{zone.coordinates.lat.toFixed(2)}°N, {zone.coordinates.lng.toFixed(2)}°E</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Predictions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-[11px] font-semibold text-slate-300 mb-3 uppercase tracking-wider">AI Escalation Predictions</h2>
          <div className="space-y-3">
            {PREDICTIONS.map((pred, idx) => {
              const color = severityColors[pred.severity];
              return (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <BrainCircuit size={18} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{pred.impact}</span>
                        <span className="text-[9px] text-slate-500">{pred.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{pred.title}</h3>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Probability:</span>
                          <span className="text-xs font-bold" style={{ color }}>{pred.probability}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400">{pred.timeframe}</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.probability}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{pred.details}</p>

                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Contributing Factors:</span>
                        {pred.factors.map((factor, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full" style={{ background: color }} />
                            <span className="text-[9px] text-slate-400">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
