import { create } from 'zustand';
import type {
  MapView,
  Language,
  ZoomLevel,
  LayerType,
  Incident,
  SeverityLevel,
  TriageEntity,
  TriageDisaster,
  SOSReport,
  MissingPerson,
  ResourceAllocation,
  BroadcastDirective,
  BroadcastSeverity,
  TargetZone,
} from '../types';
import { incidents as mockIncidents } from '../data/incidents';

interface AppState {
  // Navigation
  currentView: MapView;
  setCurrentView: (view: MapView) => void;

  // Map state
  zoomLevel: ZoomLevel;
  setZoomLevel: (level: ZoomLevel) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapPitch: number;
  setMapPitch: (pitch: number) => void;
  mapBearing: number;
  setMapBearing: (bearing: number) => void;

  // Layer toggles
  activeLayers: LayerType[];
  toggleLayer: (layer: LayerType) => void;
  setAllLayers: (layers: LayerType[]) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Incidents
  incidents: Incident[];
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Timeline
  timelineEnabled: boolean;
  setTimelineEnabled: (enabled: boolean) => void;
  timelineRange: '6h' | '24h' | '3d' | '7d';
  setTimelineRange: (range: '6h' | '24h' | '3d' | '7d') => void;
  timelinePosition: number; // 0-100
  setTimelinePosition: (pos: number) => void;

  // Tour
  tourActive: boolean;
  setTourActive: (active: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;

  // Community Safety
  triageEntity: TriageEntity | null;
  setTriageEntity: (entity: TriageEntity | null) => void;
  triageDisaster: TriageDisaster | null;
  setTriageDisaster: (disaster: TriageDisaster | null) => void;
  visualMode: boolean;
  setVisualMode: (mode: boolean) => void;

  // AI Panel
  showAIReport: boolean;
  setShowAIReport: (show: boolean) => void;

  // Mobile
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // SOS Reports
  sosReports: SOSReport[];
  addSOSReport: (report: SOSReport) => void;
  showSOSModal: boolean;
  setShowSOSModal: (show: boolean) => void;

  // Weather Alerts
  weatherAlerts: { id: string; message: string; severity: 'warning' | 'watch' | 'advisory'; dismissed: boolean }[];
  dismissAlert: (id: string) => void;

  // Missing Persons
  missingPersons: MissingPerson[];
  addMissingPerson: (person: MissingPerson) => void;

  // Resource Allocations
  resourceAllocations: ResourceAllocation[];

  // Broadcast
  broadcastDirectives: BroadcastDirective[];
  pushBroadcast: (directive: Omit<BroadcastDirective, 'id' | 'pushedAt' | 'deliveryStatus' | 'devicesReached'>) => void;
  showBroadcastModal: boolean;
  setShowBroadcastModal: (show: boolean) => void;
  showBroadcastHistory: boolean;
  setShowBroadcastHistory: (show: boolean) => void;
  tickerPaused: boolean;
  setTickerPaused: (paused: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'live_map',
  setCurrentView: (view) => set({ currentView: view, selectedIncident: null, showAIReport: false }),

  // Map
  zoomLevel: 3,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  mapCenter: [78.9, 22.5], // Center of India
  setMapCenter: (center) => set({ mapCenter: center }),
  mapPitch: 45,
  setMapPitch: (pitch) => set({ mapPitch: pitch }),
  mapBearing: -17.6,
  setMapBearing: (bearing) => set({ mapBearing: bearing }),

  // Layers
  activeLayers: ['incidents', 'hospitals', 'rescue_units'],
  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: state.activeLayers.includes(layer)
        ? state.activeLayers.filter((l) => l !== layer)
        : [...state.activeLayers, layer],
    })),
  setAllLayers: (layers) => set({ activeLayers: layers }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Incidents
  incidents: mockIncidents,
  selectedIncident: null,
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  // Timeline
  timelineEnabled: false,
  setTimelineEnabled: (enabled) => set({ timelineEnabled: enabled }),
  timelineRange: '24h',
  setTimelineRange: (range) => set({ timelineRange: range }),
  timelinePosition: 100,
  setTimelinePosition: (pos) => set({ timelinePosition: pos }),

  // Tour
  tourActive: false,
  setTourActive: (active) => set({ tourActive: active, tourStep: 0 }),
  tourStep: 0,
  setTourStep: (step) => set({ tourStep: step }),

  // Community Safety
  triageEntity: null,
  setTriageEntity: (entity) => set({ triageEntity: entity }),
  triageDisaster: null,
  setTriageDisaster: (disaster) => set({ triageDisaster: disaster }),
  visualMode: false,
  setVisualMode: (mode) => set({ visualMode: mode }),

  // AI Panel
  showAIReport: false,
  setShowAIReport: (show) => set({ showAIReport: show }),

  // Mobile
  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  // SOS Reports
  sosReports: [],
  addSOSReport: (report) => set((state) => ({
    sosReports: [...state.sosReports, report],
    showSOSModal: false,
    // Also add as an incident on the map
    incidents: [
      {
        id: report.id,
        title: `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Emergency Report`,
        type: (report.type === 'trapped' ? 'other' : report.type) as any,
        severity: 'high' as SeverityLevel,
        priorityScore: 75,
        aiConfidence: 0.65,
        reportCount: 1,
        coordinates: { lat: report.location.lat, lng: report.location.lng },
        description: report.description,
        reports: [{
          id: `RPT-${Date.now()}`,
          text: report.description,
          source: 'SOS Crowdsourced',
          timestamp: report.reportedAt,
          language: 'en',
          sentiment: -0.7,
        }],
        nearbyInfrastructure: [],
        createdAt: report.reportedAt,
        updatedAt: report.reportedAt,
        isActive: true,
      },
      ...state.incidents,
    ],
  })),
  showSOSModal: false,
  setShowSOSModal: (show) => set({ showSOSModal: show }),

  // Weather Alerts
  weatherAlerts: [
    { id: 'wa-1', message: '⚠️ IMD Alert: Severe Cyclone Warning for Coastal Regions — Expected landfall in 48 hours', severity: 'warning', dismissed: false },
    { id: 'wa-2', message: '🔴 NDMA Advisory: Heavy rainfall expected in Northeast India — Flash flood risk elevated', severity: 'watch', dismissed: false },
  ],
  dismissAlert: (id) => set((state) => ({
    weatherAlerts: state.weatherAlerts.map((a) => a.id === id ? { ...a, dismissed: true } : a),
  })),

  // Missing Persons
  missingPersons: [
    { id: 'MP-001', name: 'Ravi Kumar', age: 45, gender: 'Male', lastSeenLocation: 'Dhemaji, Assam', description: 'Farmer, last seen during evacuation', reportedBy: 'Sunita Devi', reportedAt: '2026-08-24T09:00:00Z', status: 'missing' },
    { id: 'MP-002', name: 'Priya Sharma', age: 28, gender: 'Female', lastSeenLocation: 'Chennai Suburb, Tamil Nadu', description: 'School teacher, phone unreachable since yesterday', reportedBy: 'Arjun Sharma', reportedAt: '2026-08-24T10:30:00Z', status: 'missing' },
    { id: 'MP-003', name: 'Lakshmi Nair', age: 72, gender: 'Female', lastSeenLocation: 'Alappuzha, Kerala', description: 'Elderly, mobility limited, living alone', reportedBy: 'Neighborhood Watch', reportedAt: '2026-08-24T11:15:00Z', status: 'missing' },
    { id: 'MP-004', name: 'Anil Patel', age: 34, gender: 'Male', lastSeenLocation: 'Ratnagiri, Maharashtra', description: 'Truck driver, vehicle found near landslide site', reportedBy: 'Patel Family', reportedAt: '2026-08-24T12:00:00Z', status: 'found' },
    { id: 'MP-005', name: 'Meena Bai', age: 58, gender: 'Female', lastSeenLocation: 'Nilgiri Hills, Tamil Nadu', description: 'Tea estate worker, separated during fire evacuation', reportedBy: 'Estate Manager', reportedAt: '2026-08-24T08:45:00Z', status: 'safe' },
  ],
  addMissingPerson: (person) => set((state) => ({ missingPersons: [person, ...state.missingPersons] })),

  // Broadcast
  broadcastDirectives: [
    { id: 'BC-001', operatorId: 'OP-DR-SINGH', targetZone: 'sector_4', severity: 'critical_evacuation', message: '⚠️ EVACUATION: Immediate evacuation of Sector 4 via Route B. Rising flood levels. Proceed to Relief Camp at Nehru Stadium.', pushedAt: '2026-08-25T02:30:00Z', deliveryStatus: 'Delivered to 42,000 devices', devicesReached: 42000 },
    { id: 'BC-002', operatorId: 'OP-DR-SINGH', targetZone: 'entire_city', severity: 'severe_warning', message: '🔴 SEVERE WARNING: Do not approach Brahmaputra embankments. Structural integrity compromised. Stay on high ground.', pushedAt: '2026-08-25T01:15:00Z', deliveryStatus: 'Delivered to 185,000 devices', devicesReached: 185000 },
    { id: 'BC-003', operatorId: 'OP-NODAL-CHENNAI', targetZone: 'sector_2', severity: 'public_advisory', message: '🟡 ADVISORY: Heavy rainfall expected tonight. Secure loose items. Keep emergency kit ready. Avoid low-lying areas.', pushedAt: '2026-08-25T00:45:00Z', deliveryStatus: 'Delivered to 28,500 devices', devicesReached: 28500 },
  ] as BroadcastDirective[],
  pushBroadcast: (directive) => set((state) => {
    const newDirective: BroadcastDirective = {
      ...directive,
      id: `BC-${String(state.broadcastDirectives.length + 1).padStart(3, '0')}`,
      pushedAt: new Date().toISOString(),
      deliveryStatus: 'Delivering...',
      devicesReached: 0,
    };
    // Simulate delivery
    setTimeout(() => {
      set((s) => ({
        broadcastDirectives: s.broadcastDirectives.map((d) =>
          d.id === newDirective.id
            ? { ...d, deliveryStatus: `Delivered to ${(Math.floor(Math.random() * 50) + 10) * 1000} devices`, devicesReached: (Math.floor(Math.random() * 50) + 10) * 1000 }
            : d
        ),
      }));
    }, 2000);
    return {
      broadcastDirectives: [newDirective, ...state.broadcastDirectives],
      showBroadcastModal: false,
    };
  }),
  showBroadcastModal: false,
  setShowBroadcastModal: (show) => set({ showBroadcastModal: show }),
  showBroadcastHistory: false,
  setShowBroadcastHistory: (show) => set({ showBroadcastHistory: show }),
  tickerPaused: false,
  setTickerPaused: (paused) => set({ tickerPaused: paused }),

  // Resource Allocations
  resourceAllocations: [
    { id: 'RA-001', type: 'food', zone: 'Brahmaputra Basin, Assam', quantity: 5000, delivered: 3200, status: 'in_transit', lastUpdated: '2026-08-25T02:00:00Z' },
    { id: 'RA-002', type: 'food', zone: 'Nilgiri Hills, Tamil Nadu', quantity: 2000, delivered: 2000, status: 'delivered', lastUpdated: '2026-08-25T01:30:00Z' },
    { id: 'RA-003', type: 'medical', zone: 'Chennai Metropolitan', quantity: 800, delivered: 450, status: 'in_transit', lastUpdated: '2026-08-25T02:15:00Z' },
    { id: 'RA-004', type: 'medical', zone: 'Western Ghats, Maharashtra', quantity: 300, delivered: 0, status: 'pending', lastUpdated: '2026-08-25T01:00:00Z' },
    { id: 'RA-005', type: 'shelter', zone: 'Brahmaputra Basin, Assam', quantity: 1200, delivered: 800, status: 'in_transit', lastUpdated: '2026-08-25T02:00:00Z' },
    { id: 'RA-006', type: 'shelter', zone: 'Odisha Coast', quantity: 3000, delivered: 3000, status: 'delivered', lastUpdated: '2026-08-25T00:45:00Z' },
    { id: 'RA-007', type: 'food', zone: 'Manipur Border', quantity: 1000, delivered: 200, status: 'pending', lastUpdated: '2026-08-25T01:45:00Z' },
    { id: 'RA-008', type: 'medical', zone: 'Manipur Border', quantity: 400, delivered: 100, status: 'in_transit', lastUpdated: '2026-08-25T02:10:00Z' },
  ],
}));

// Derive severity from score
export function getSeverityFromScore(score: number): SeverityLevel {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

// Color map
export const severityColors: Record<SeverityLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

export const severityBgColors: Record<SeverityLevel, string> = {
  critical: 'bg-critical',
  high: 'bg-high',
  moderate: 'bg-moderate',
  low: 'bg-low',
};

export const severityTextColors: Record<SeverityLevel, string> = {
  critical: 'text-critical',
  high: 'text-high',
  moderate: 'text-moderate',
  low: 'text-low',
};

export const severityLabels: Record<SeverityLevel, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  moderate: 'MODERATE',
  low: 'LOW',
};
