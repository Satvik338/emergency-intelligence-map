import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Map, AlertTriangle, BrainCircuit, Users, BarChart3,
  ChevronLeft, ChevronRight, Layers, Eye, EyeOff,
  Building2, Siren, Camera, Radio, X, Menu, Heart, Megaphone,
} from 'lucide-react';
import { useStore, severityColors } from '../store/useStore';
import type { MapView, LayerType } from '../types';

interface NavItem {
  id: MapView;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'live_map', label: 'Live Map', icon: <Map size={20} /> },
  { id: 'incidents', label: 'Active Incidents', icon: <AlertTriangle size={20} /> },
  { id: 'risk_prediction', label: 'Risk Prediction', icon: <BrainCircuit size={20} /> },
  { id: 'community_safety', label: 'Community Safety Hub', icon: <Users size={20} /> },
  { id: 'recovery', label: 'Recovery & Relief', icon: <Heart size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
];

interface LayerItem {
  id: LayerType;
  label: string;
  icon: React.ReactNode;
}

const layerItems: LayerItem[] = [
  { id: 'incidents', label: 'Incidents', icon: <AlertTriangle size={16} /> },
  { id: 'risk_polygons', label: 'Risk Polygons', icon: <Layers size={16} /> },
  { id: 'hospitals', label: 'Hospitals/Shelters', icon: <Building2 size={16} /> },
  { id: 'rescue_units', label: 'Rescue Units', icon: <Siren size={16} /> },
  { id: 'visual_feeds', label: 'Visual Feeds', icon: <Camera size={16} /> },
];

export default function Sidebar() {
  const {
    currentView, setCurrentView,
    sidebarOpen, setSidebarOpen,
    activeLayers, toggleLayer,
    incidents,
    isMobile,
  } = useStore();

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const highCount = incidents.filter((i) => i.severity === 'high').length;
  const totalActive = incidents.filter((i) => i.isActive).length;

  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 glass rounded-xl p-2.5 hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-white" />
        </button>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-72 glass z-50 flex flex-col overflow-y-auto"
              >
                <SidebarContent
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  activeLayers={activeLayers}
                  toggleLayer={toggleLayer}
                  criticalCount={criticalCount}
                  highCount={highCount}
                  totalActive={totalActive}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 68 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative h-full glass flex flex-col z-30 shrink-0 overflow-hidden"
    >
      <SidebarContent
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        criticalCount={criticalCount}
        highCount={highCount}
        totalActive={totalActive}
        collapsed={!sidebarOpen}
      />

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 right-0 translate-x-1/2 z-10 glass rounded-full p-1.5 hover:bg-slate-700 transition-colors border border-white/10"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.aside>
  );
}

interface SidebarContentProps {
  currentView: MapView;
  setCurrentView: (v: MapView) => void;
  activeLayers: LayerType[];
  toggleLayer: (l: LayerType) => void;
  criticalCount: number;
  highCount: number;
  totalActive: number;
  collapsed?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  currentView, setCurrentView,
  activeLayers, toggleLayer,
  criticalCount, highCount, totalActive,
  collapsed, onClose,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Shield size={22} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-sm font-bold text-white truncate">Emergency Intelligence</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">COMMAND CENTER</p>
          </motion.div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Status Bar */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">LIVE MONITORING</span>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: severityColors.critical }} />
              <span className="text-xs text-slate-300">{criticalCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: severityColors.high }} />
              <span className="text-xs text-slate-300">{highCount}</span>
            </div>
            <span className="text-[10px] text-slate-500 ml-auto">{totalActive} active</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {!collapsed && (
          <span className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </span>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Layer Controls */}
      <div className="px-2 py-3 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Map Layers
            </span>
            <Layers size={14} className="text-slate-500" />
          </div>
        )}
        <div className="space-y-0.5">
          {layerItems.map((layer) => {
            const isActive = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                title={collapsed ? layer.label : undefined}
              >
                <span className="shrink-0">{layer.icon}</span>
                {!collapsed && <span className="truncate">{layer.label}</span>}
                {!collapsed && (
                  <span className="ml-auto">
                    {isActive ? (
                      <Eye size={14} className="text-blue-400" />
                    ) : (
                      <EyeOff size={14} className="text-slate-600" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radio Status */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/5">
          <div className="glass-light rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio size={14} className="text-green-400" />
              <span className="text-[11px] font-semibold text-slate-300">NDRF Channel Active</span>
            </div>
            <p className="text-[10px] text-slate-500">Last sync: 30s ago</p>
          </div>
        </div>
      )}

      {/* Broadcast Button */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/5">
          <button
            onClick={() => {
              useStore.getState().setShowBroadcastModal(true);
              onClose?.();
            }}
            className="w-full glass-light hover:bg-red-500/10 rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-left transition-all border border-transparent hover:border-red-500/20"
          >
            <Megaphone size={16} className="text-red-400 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-white block">Broadcast Directive</span>
              <span className="text-[9px] text-slate-500">Push emergency alerts to public</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
