import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, AlertTriangle, Clock, Users, Building2,
  Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useStore, severityColors } from '../store/useStore';

const STATS = [
  { label: 'Active Incidents', value: '7', change: '+2', up: true, icon: AlertTriangle, color: '#ef4444' },
  { label: 'Reports Processed', value: '142', change: '+38', up: true, icon: Users, color: '#3b82f6' },
  { label: 'Avg Response Time', value: '12m', change: '-3m', up: false, icon: Clock, color: '#22c55e' },
  { label: 'Infrastructure at Risk', value: '23', change: '+5', up: true, icon: Building2, color: '#f97316' },
];

const INCIDENTS_BY_TYPE = [
  { type: 'Flood', count: 3, percentage: 43, color: '#3b82f6' },
  { type: 'Fire', count: 1, percentage: 14, color: '#ef4444' },
  { type: 'Earthquake', count: 1, percentage: 14, color: '#eab308' },
  { type: 'Landslide', count: 1, percentage: 14, color: '#f97316' },
  { type: 'Storm', count: 1, percentage: 14, color: '#8b5cf6' },
];

const SEVERITY_DISTRIBUTION = [
  { level: 'Critical', count: 2, color: severityColors.critical },
  { level: 'High', count: 2, color: severityColors.high },
  { level: 'Moderate', count: 2, color: severityColors.moderate },
  { level: 'Low', count: 1, color: severityColors.low },
];

const RECENT_ALERTS = [
  { time: '2 min ago', text: 'INC-001 priority escalated to 94/100', severity: 'critical' },
  { time: '8 min ago', text: 'New flood reports incoming — Chennai', severity: 'high' },
  { time: '15 min ago', text: 'INC-002 fire containment: 35%', severity: 'high' },
  { time: '23 min ago', text: 'INC-005 aftershock detected — Manipur', severity: 'moderate' },
  { time: '1 hr ago', text: 'All Kerala units returned to base', severity: 'low' },
];

export default function Analytics() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Analytics Dashboard</h1>
              <p className="text-xs text-slate-400">Real-time emergency intelligence overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} style={{ color: stat.color }} />
                  <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                    stat.up ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
                <p className="text-[10px] text-slate-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Incidents by Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <h3 className="text-[11px] font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={14} className="text-blue-400" />
              Incidents by Type
            </h3>
            <div className="space-y-2.5">
              {INCIDENTS_BY_TYPE.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-300">{item.type}</span>
                    <span className="text-[10px] font-bold text-white">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4"
          >
            <h3 className="text-[11px] font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400" />
              Severity Distribution
            </h3>
            <div className="flex items-end gap-3 h-32 mb-3">
              {SEVERITY_DISTRIBUTION.map((item, idx) => {
                const maxHeight = 100;
                const height = (item.count / 3) * maxHeight;
                return (
                  <div key={item.level} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-white">{item.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                      className="w-full rounded-t-lg"
                      style={{ background: item.color }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              {SEVERITY_DISTRIBUTION.map((item) => (
                <div key={item.level} className="flex items-center gap-1 flex-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[9px] text-slate-400">{item.level}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4"
        >
          <h3 className="text-[11px] font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Clock size={14} className="text-green-400" />
            Recent Alerts & Activity
          </h3>
          <div className="space-y-2">
            {RECENT_ALERTS.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-3 glass-light rounded-lg px-3 py-2.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: severityColors[alert.severity as keyof typeof severityColors] }}
                />
                <p className="text-[11px] text-slate-300 flex-1">{alert.text}</p>
                <span className="text-[9px] text-slate-500 shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
