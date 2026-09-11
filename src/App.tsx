import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Siren, AlertTriangle, AlertOctagon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import EmergencyMap from './components/EmergencyMap';
import IncidentPanel from './components/IncidentPanel';
import AIReportPanel from './components/AIReportPanel';
import CommunitySafety from './components/CommunitySafety';
import Analytics from './components/Analytics';
import IncidentsList from './components/IncidentsList';
import RiskPrediction from './components/RiskPrediction';
import RecoveryRelief from './components/RecoveryRelief';
import SOSReportModal from './components/SOSReportModal';
import BroadcastTicker from './components/BroadcastTicker';
import BroadcastControlModal from './components/BroadcastControlModal';
import { TourControls, TimelineSlider, TourOverlay } from './components/TimelineTour';
import { useStore } from './store/useStore';

function WeatherAlertBanner() {
  const { weatherAlerts, dismissAlert } = useStore();
  const visible = weatherAlerts.filter((a) => !a.dismissed);

  if (visible.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      <AnimatePresence>
        {visible.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`pointer-events-auto mx-2 mt-2 rounded-xl backdrop-blur-md border px-4 py-2.5 flex items-center gap-3 ${
              alert.severity === 'warning'
                ? 'bg-red-500/15 border-red-500/30'
                : alert.severity === 'watch'
                ? 'bg-orange-500/15 border-orange-500/30'
                : 'bg-yellow-500/15 border-yellow-500/30'
            }`}
          >
            {alert.severity === 'warning' ? (
              <AlertOctagon size={16} className="text-red-400 shrink-0 animate-pulse" />
            ) : (
              <AlertTriangle size={16} className="text-orange-400 shrink-0" />
            )}
            <span className="text-xs text-white flex-1">{alert.message}</span>
            <span className="text-[9px] text-slate-400 shrink-0">LIVE</span>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-slate-400 hover:text-white shrink-0 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SOSFloatingButton() {
  const { setShowSOSModal } = useStore();
  return (
    <motion.button
      onClick={() => setShowSOSModal(true)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-2xl shadow-red-500/30 transition-colors"
    >
      <Siren size={18} className="animate-pulse" />
      <span className="hidden sm:inline">Report Emergency (SOS)</span>
      <span className="sm:hidden">SOS</span>
    </motion.button>
  );
}

export default function App() {
  const {
    currentView,
    selectedIncident,
    isMobile,
    setIsMobile,
    setSidebarOpen,
  } = useStore();

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile, setSidebarOpen]);

  const showMap = currentView === 'live_map';

  const renderMainContent = () => {
    switch (currentView) {
      case 'live_map':
        return (
          <div className="flex-1 relative flex overflow-hidden">
            <EmergencyMap />
            <TourOverlay />
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <div className="pointer-events-auto">
                <TimelineSlider />
              </div>
            </div>
            <div className="absolute bottom-24 left-4 z-20">
              <TourControls />
            </div>
            <AnimatePresence>
              {selectedIncident && <IncidentPanel />}
            </AnimatePresence>
          </div>
        );

      case 'incidents':
        return <IncidentsList />;

      case 'risk_prediction':
        return <RiskPrediction />;

      case 'community_safety':
        return <CommunitySafety />;

      case 'recovery':
        return <RecoveryRelief />;

      case 'analytics':
        return <Analytics />;

      default:
        return <EmergencyMap />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Broadcast Ticker — always visible below nav */}
        <BroadcastTicker />

        {/* Weather Alert Banner */}
        {showMap && <WeatherAlertBanner />}

        {/* View Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {renderMainContent()}

          {/* SOS Floating Button (only on map views) */}
          {showMap && <SOSFloatingButton />}
        </div>
      </main>

      {/* AI Report Modal */}
      <AnimatePresence>
        <AIReportPanel />
      </AnimatePresence>

      {/* SOS Report Modal */}
      <SOSReportModal />

      {/* Broadcast Control Modal */}
      <AnimatePresence>
        <BroadcastControlModal />
      </AnimatePresence>
    </div>
  );
}
