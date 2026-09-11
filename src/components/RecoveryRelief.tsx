import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Heart, Users, CheckCircle2, Clock, Truck,
  AlertCircle, Plus, X, MapPin, Phone, User,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ResourceType, ReliefStatus } from '../types';

const resourceIcons: Record<ResourceType, string> = {
  food: '🍚',
  medical: '💊',
  shelter: '🏠',
};

const resourceLabels: Record<ResourceType, string> = {
  food: 'Food Packets',
  medical: 'Medical Kits',
  shelter: 'Temporary Shelters',
};

const statusConfig: Record<ReliefStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <Clock size={14} /> },
  in_transit: { label: 'In Transit', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10', icon: <CheckCircle2 size={14} /> },
};

export default function RecoveryRelief() {
  const { resourceAllocations, missingPersons } = useStore();
  const [activeTab, setActiveTab] = useState<'resources' | 'missing'>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReliefStatus | 'all'>('all');

  // Stats
  const totalAllocated = resourceAllocations.reduce((sum, r) => sum + r.quantity, 0);
  const totalDelivered = resourceAllocations.reduce((sum, r) => sum + r.delivered, 0);
  const deliveryPercent = totalAllocated > 0 ? Math.round((totalDelivered / totalAllocated) * 100) : 0;
  const missingCount = missingPersons.filter((p) => p.status === 'missing').length;
  const foundCount = missingPersons.filter((p) => p.status === 'found').length;
  const safeCount = missingPersons.filter((p) => p.status === 'safe').length;

  const filteredResources = resourceAllocations.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const filteredPersons = missingPersons.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.lastSeenLocation.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Heart size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Recovery & Relief</h1>
              <p className="text-xs text-slate-400">Post-disaster resource management and missing persons tracking</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Resources', value: totalAllocated.toLocaleString(), icon: <Package size={18} />, color: 'from-blue-500 to-blue-600' },
            { label: 'Delivered', value: `${deliveryPercent}%`, icon: <CheckCircle2 size={18} />, color: 'from-green-500 to-green-600' },
            { label: 'Missing', value: missingCount, icon: <AlertCircle size={18} />, color: 'from-red-500 to-red-600' },
            { label: 'Found/Safe', value: foundCount + safeCount, icon: <Users size={18} />, color: 'from-purple-500 to-purple-600' },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-2`}>{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'resources' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>
            <Package size={16} className="inline mr-2" />Resource Allocation
          </button>
          <button onClick={() => setActiveTab('missing')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'missing' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white border border-transparent'}`}>
            <Users size={16} className="inline mr-2" />Missing Persons ({missingCount})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ---- Resource Allocation Tab ---- */}
          {activeTab === 'resources' && (
            <motion.div key="resources" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex gap-1 glass rounded-lg p-1">
                  <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>All</button>
                  {(Object.keys(resourceIcons) as ResourceType[]).map((t) => (
                    <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === t ? 'bg-white/10 text-white' : 'text-slate-500'}`}>{resourceIcons[t]} {resourceLabels[t]}</button>
                  ))}
                </div>
                <div className="flex gap-1 glass rounded-lg p-1">
                  <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterStatus === 'all' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>All Status</button>
                  {(Object.keys(statusConfig) as ReliefStatus[]).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterStatus === s ? 'bg-white/10 text-white' : 'text-slate-500'}`}>{statusConfig[s].label}</button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Zone</th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResources.map((r) => {
                        const pct = r.quantity > 0 ? Math.round((r.delivered / r.quantity) * 100) : 0;
                        const sc = statusConfig[r.status];
                        return (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{resourceIcons[r.type]}</span>
                                <span className="text-white font-medium text-xs">{resourceLabels[r.type]}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">{r.zone}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : pct > 50 ? '#3b82f6' : '#eab308' }} />
                                </div>
                                <span className="text-[10px] text-slate-400">{r.delivered}/{r.quantity}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color} ${sc.bg}`}>
                                {sc.icon}{sc.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[10px] text-slate-500 text-right">{new Date(r.lastUpdated).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary bars */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {(Object.keys(resourceIcons) as ResourceType[]).map((t) => {
                  const items = resourceAllocations.filter((r) => r.type === t);
                  const total = items.reduce((s, r) => s + r.quantity, 0);
                  const del = items.reduce((s, r) => s + r.delivered, 0);
                  const pct = total > 0 ? Math.round((del / total) * 100) : 0;
                  return (
                    <div key={t} className="glass rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{resourceIcons[t]}</span>
                        <span className="text-xs font-medium text-white">{resourceLabels[t]}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{del.toLocaleString()} / {total.toLocaleString()} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ---- Missing Persons Tab ---- */}
          {activeTab === 'missing' && (
            <motion.div key="missing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Search and Add */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 glass rounded-xl flex items-center gap-2 px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, location, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <button onClick={() => setShowAddPerson(true)} className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  <Plus size={16} /> Report Missing
                </button>
              </div>

              {/* Status Legend */}
              <div className="flex gap-3 mb-4">
                <span className="flex items-center gap-1.5 text-[11px]"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-slate-400">Missing ({missingCount})</span></span>
                <span className="flex items-center gap-1.5 text-[11px]"><span className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-slate-400">Found ({foundCount})</span></span>
                <span className="flex items-center gap-1.5 text-[11px]"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-slate-400">Safe ({safeCount})</span></span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPersons.map((p) => {
                  const statusColor = p.status === 'missing' ? 'border-red-500/30 bg-red-500/5' : p.status === 'found' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5';
                  const badgeColor = p.status === 'missing' ? 'bg-red-500/15 text-red-400' : p.status === 'found' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400';
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`glass rounded-xl p-4 border ${statusColor}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                            <User size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-400">{p.age} yrs • {p.gender}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${badgeColor}`}>{p.status}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{p.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                        <MapPin size={10} />{p.lastSeenLocation}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                        <Phone size={10} />Reported by: {p.reportedBy}
                      </div>
                      <div className="text-[10px] text-slate-600">{new Date(p.reportedAt).toLocaleString()}</div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredPersons.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No matching records found</p>
                </div>
              )}

              {/* Add Person Modal */}
              <AnimatePresence>
                {showAddPerson && <AddPersonModal onClose={() => setShowAddPerson(false)} />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AddPersonModal({ onClose }: { onClose: () => void }) {
  const { addMissingPerson, missingPersons } = useStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  const handleSubmit = () => {
    if (!name || !location) return;
    addMissingPerson({
      id: `MP-${String(missingPersons.length + 1).padStart(3, '0')}`,
      name,
      age: parseInt(age) || 0,
      gender,
      lastSeenLocation: location,
      description: desc,
      reportedBy,
      reportedAt: new Date().toISOString(),
      status: 'missing',
    });
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl w-full max-w-md p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Report Missing Person</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <input type="text" placeholder="Last Seen Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
            <textarea placeholder="Description / Distinguishing Features" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 resize-none" />
            <input type="text" placeholder="Your Name (Reporter)" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
            <button onClick={handleSubmit} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              Submit Report
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
