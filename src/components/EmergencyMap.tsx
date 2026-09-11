import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Crosshair, Layers, X, Building2, Siren,
  Navigation, Satellite, Mountain, Map as MapIcon,
} from 'lucide-react';
import { useStore, severityColors } from '../store/useStore';
import type { ZoomLevel } from '../types';
import { incidents, emergencyFacilities } from '../data/incidents';
import EmergencyRouteHUD from './EmergencyRouteHUD';

// ─── Google Maps Types ───────────────────────────────────────────────────────
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Polyline: any;
        Polygon: any;
        Circle: any;
        InfoWindow: any;
        LatLngBounds: any;
        SymbolPath: any;
        TravelMode: any;
        MapTypeId: any;
        event: { addListener: any; removeListener: any };
        geometry: { spherical: { computeDistanceBetween: any } };
      };
    };
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ZOOM_CONFIGS: Record<ZoomLevel, { label: string; description: string; gmapsZoom: number }> = {
  1: { label: 'National View', description: 'Clustered disaster hotspots across India', gmapsZoom: 5 },
  2: { label: 'Disaster Zone', description: 'Hazard boundaries & severity gradients', gmapsZoom: 8 },
  3: { label: 'Infrastructure', description: 'Hospitals, shelters & rescue units', gmapsZoom: 11 },
  4: { label: 'Local Incidents', description: 'Individual incident detail cards', gmapsZoom: 13 },
  5: { label: 'Ground Intel', description: 'Visual evidence & drone feeds', gmapsZoom: 15 },
};

const MAP_TYPES = [
  { id: 'satellite', label: '🛰️ Satellite', mapTypeId: 'satellite', hybrid: true },
  { id: 'terrain', label: '🏔️ Terrain', mapTypeId: 'terrain', hybrid: false },
  { id: 'roadmap', label: '🗺️ Standard', mapTypeId: 'roadmap', hybrid: false },
];

const TIMELINE_MARKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

const HAZARD_ZONES = [
  { id: 'flood-assam', type: 'flood' as const, path: [
    { lat: 25.8, lng: 91.0 }, { lat: 26.8, lng: 91.0 }, { lat: 27.0, lng: 92.2 },
    { lat: 26.5, lng: 92.8 }, { lat: 25.8, lng: 92.0 },
  ], label: '🌊 Flood Spread — Brahmaputra Basin' },
  { id: 'fire-nilgiri', type: 'fire' as const, path: [
    { lat: 11.3, lng: 76.5 }, { lat: 11.7, lng: 76.5 },
    { lat: 11.8, lng: 77.0 }, { lat: 11.4, lng: 77.1 },
  ], label: '🔥 Wildfire Path — Nilgiri Hills' },
];

const RESCUE_UNITS = [
  { lat: 28.6, lng: 77.2, label: 'NDRF-D1' },
  { lat: 13.1, lng: 80.3, label: 'NDRF-D2' },
  { lat: 26.2, lng: 91.7, label: 'NDRF-D3' },
];

// ─── Create marker icon using Canvas ────────────────────────────────────────
function createMarkerIcon(score: number, severity: string): google.maps.Icon {
  const c = severityColors[severity as keyof typeof severityColors] || '#ef4444';
  const size = severity === 'critical' ? 36 : severity === 'high' ? 32 : 28;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      ${severity === 'critical' ? `
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="none" stroke="${c}40" stroke-width="2">
          <animate attributeName="r" from="${size/2 - 4}" to="${size/2 + 4}" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
      ` : ''}
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="${c}" stroke="${c}90" stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="system-ui">${score}</text>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(size / 2, size / 2),
  };
}

function createFacilityIcon(type: string): google.maps.Icon {
  const emojis: Record<string, string> = { hospital: '🏥', shelter: '🏠', police: '🚓', fire_station: '🚒' };
  const svg = `
    <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="26" height="26" rx="6" fill="rgba(15,23,42,0.9)" stroke="rgba(100,116,139,0.3)" stroke-width="1"/>
      <text x="14" y="19" text-anchor="middle" font-size="15">${emojis[type] || '📍'}</text>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(28, 28),
    anchor: new window.google.maps.Point(14, 14),
  };
}

function createRescueIcon(label: string): google.maps.Icon {
  const svg = `
    <svg width="32" height="36" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="0" width="28" height="24" rx="6" fill="rgba(37,99,235,0.2)" stroke="rgba(96,165,250,0.5)" stroke-width="1"/>
      <text x="16" y="17" text-anchor="middle" font-size="14">🚨</text>
      <rect x="2" y="22" width="28" height="12" rx="3" fill="rgba(37,99,235,0.8)"/>
      <text x="16" y="31" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="monospace">${label}</text>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(32, 36),
    anchor: new window.google.maps.Point(16, 18),
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EmergencyMap() {
  const {
    zoomLevel, setZoomLevel, selectedIncident, setSelectedIncident, activeLayers,
    sosReports, showSOSModal, setShowSOSModal,
  } = useStore();

  const config = ZOOM_CONFIGS[zoomLevel];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const incidentMarkersRef = useRef<any[]>([]);
  const facilityMarkersRef = useRef<any[]>([]);
  const rescueMarkersRef = useRef<any[]>([]);
  const sosMarkersRef = useRef<any[]>([]);
  const hazardPolygonsRef = useRef<any[]>([]);
  const radarCircleRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  // Map type state
  const [mapTypeId, setMapTypeId] = useState<string>('satellite');
  const [showMapTypeHUD, setShowMapTypeHUD] = useState(false);
  const [showRouteHUD, setShowRouteHUD] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Toggle states (same as before)
  const [showRadar, setShowRadar] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showSOSFeed, setShowSOSFeed] = useState(true);
  const [showLayerHUD, setShowLayerHUD] = useState(true);

  // Timeline
  const [timelineHour, setTimelineHour] = useState(24);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);



  // ─── Load Google Maps API ────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) {
      initMap();
      return;
    }
    if (document.getElementById('google-maps-script')) {
      const check = setInterval(() => {
        if (window.google?.maps) { clearInterval(check); initMap(); }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry&callback=__gmapsCallback`;
    script.async = true;
    script.defer = true;

    (window as any).__gmapsCallback = () => { initMap(); };

    document.head.appendChild(script);

    function initMap() {
      if (!mapContainerRef.current || mapRef.current) return;
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 22.5, lng: 78.9 },
        zoom: 5,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        scaleControl: false,
        rotateControl: false,
        gestureHandling: 'greedy',
        styles: [
          // Darken satellite slightly for better contrast
          { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
          { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 20 }] },
          { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'on' }, { color: '#94a3b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1e30' }] },
          { featureType: 'landscape', elementType: 'labels', stylers: [{ color: '#cbd5e1' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }, { color: '#e2e8f0' }] },
        ],
      });

      mapRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();
      setMapLoaded(true);
    }

    return () => { mapRef.current = null; };
  }, []);

  // ─── Sync zoom level ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(config.gmapsZoom);
  }, [zoomLevel, config.gmapsZoom]);

  // ─── Sync map type ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setMapTypeId(mapTypeId);
    // Re-apply hybrid if satellite
    if (mapTypeId === 'satellite') {
      map.setOptions({ mapTypeControl: false });
    }
  }, [mapTypeId]);

  // ─── Timeline play ───────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      setTimelineHour(0);
      let h = 0;
      playRef.current = setInterval(() => {
        h++;
        setTimelineHour(h);
        if (h >= 24) { clearInterval(playRef.current!); setIsPlaying(false); }
      }, 300);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying]);

  // ─── Filter incidents by timeline ────────────────────────────────────
  const visibleIncidents = incidents.filter((inc) => {
    const created = new Date(inc.createdAt);
    const base = new Date('2026-08-24T00:00:00Z');
    return (created.getTime() - base.getTime()) / 3600000 <= timelineHour;
  });

  // ─── Update incident markers ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    incidentMarkersRef.current.forEach((m) => m.setMap(null));
    incidentMarkersRef.current = [];
    if (!activeLayers.includes('incidents')) return;

    visibleIncidents.forEach((inc) => {
      const marker = new window.google.maps.Marker({
        position: { lat: inc.coordinates.lat, lng: inc.coordinates.lng },
        map,
        icon: createMarkerIcon(inc.priorityScore, inc.severity),
        title: `${inc.id} — Score ${inc.priorityScore}`,
      });

      marker.addListener('click', () => {
        const c = severityColors[inc.severity] || '#ef4444';
        infoWindowRef.current.setContent(`
          <div style="min-width:180px;font-family:system-ui;padding:4px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <div style="width:8px;height:8px;border-radius:50%;background:${c}"></div>
              <span style="color:${c};font-size:10px;font-weight:700;text-transform:uppercase">${inc.severity}</span>
              <span style="color:#64748b;font-size:10px;margin-left:auto">${inc.priorityScore}/100</span>
            </div>
            <div style="font-size:13px;color:white;font-weight:700;margin-bottom:4px">${inc.id}</div>
            <div style="height:3px;background:#1e293b;border-radius:2px;overflow:hidden;margin-bottom:6px">
              <div style="height:100%;width:${inc.priorityScore}%;background:${c};border-radius:2px"></div>
            </div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">${inc.title}</div>
            <div style="font-size:9px;color:#64748b">${inc.reportCount} reports • ${inc.nearbyInfrastructure[0]?.name || 'N/A'}</div>
          </div>
        `);
        infoWindowRef.current.open(map, marker);
        setSelectedIncident(inc);
        setZoomLevel(4);
      });

      incidentMarkersRef.current.push(marker);
    });
  }, [visibleIncidents, activeLayers, setSelectedIncident, setZoomLevel]);

  // ─── Update facility markers ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    facilityMarkersRef.current.forEach((m) => m.setMap(null));
    facilityMarkersRef.current = [];
    if (!showFacilities || !activeLayers.includes('hospitals')) return;

    emergencyFacilities.forEach((fac) => {
      const marker = new window.google.maps.Marker({
        position: { lat: fac.coordinates.lat, lng: fac.coordinates.lng },
        map,
        icon: createFacilityIcon(fac.type),
        title: fac.name,
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:system-ui;padding:4px">
            <div style="font-size:13px;font-weight:700;color:#f1f5f9">${fac.name}</div>
            <div style="font-size:10px;color:#94a3b8;text-transform:capitalize">${fac.type.replace('_', ' ')}</div>
            ${fac.capacity ? `<div style="font-size:10px;color:#64748b;margin-top:2px">Capacity: ${fac.currentOccupancy}/${fac.capacity}</div>` : ''}
          </div>
        `);
        infoWindowRef.current.open(map, marker);
      });

      facilityMarkersRef.current.push(marker);
    });
  }, [showFacilities, activeLayers]);

  // ─── Update rescue markers ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    rescueMarkersRef.current.forEach((m) => m.setMap(null));
    rescueMarkersRef.current = [];
    if (!activeLayers.includes('rescue_units')) return;

    RESCUE_UNITS.forEach((u) => {
      const marker = new window.google.maps.Marker({
        position: { lat: u.lat, lng: u.lng },
        map,
        icon: createRescueIcon(u.label),
        title: u.label,
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:system-ui;padding:4px">
            <span style="font-size:14px">🚨</span>
            <span style="font-size:12px;font-weight:700;color:#60a5fa;margin-left:4px">${u.label}</span>
            <span style="font-size:10px;color:#94a3b8;margin-left:4px">NDRF Unit</span>
          </div>
        `);
        infoWindowRef.current.open(map, marker);
      });

      rescueMarkersRef.current.push(marker);
    });
  }, [activeLayers]);

  // ─── Update hazard polygons ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    hazardPolygonsRef.current.forEach((p) => p.setMap(null));
    hazardPolygonsRef.current = [];
    if (!showPolygons || !activeLayers.includes('risk_polygons')) return;

    HAZARD_ZONES.forEach((zone) => {
      const color = zone.type === 'flood' ? '#06b6d4' : '#ef4444';
      const poly = new window.google.maps.Polygon({
        paths: zone.path,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.12,
        map,
        clickable: true,
      });

      poly.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:system-ui;padding:4px;font-size:12px;font-weight:600;color:white">${zone.label}</div>
        `);
        infoWindowRef.current.setPosition(zone.path[0]);
        infoWindowRef.current.open(map);
      });

      hazardPolygonsRef.current.push(poly);
    });
  }, [showPolygons, activeLayers]);

  // ─── Update SOS feed markers ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    sosMarkersRef.current.forEach((m) => m.setMap(null));
    sosMarkersRef.current = [];
    if (!showSOSFeed) return;

    sosReports.forEach((r) => {
      const marker = new window.google.maps.Circle({
        center: { lat: r.location.lat, lng: r.location.lng },
        radius: 5000,
        strokeColor: '#ef4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        map,
        clickable: true,
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:system-ui;padding:4px">
            <div style="font-size:11px;font-weight:700;color:#ef4444">🚨 SOS Report</div>
            <div style="font-size:10px;color:white;margin-top:2px">${r.type.toUpperCase()}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:2px">${r.description}</div>
          </div>
        `);
        infoWindowRef.current.setPosition({ lat: r.location.lat, lng: r.location.lng });
        infoWindowRef.current.open(map);
      });

      sosMarkersRef.current.push(marker);
    });
  }, [sosReports, showSOSFeed]);

  // ─── Radar sweep (Google Maps circle) ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (radarCircleRef.current) { radarCircleRef.current.setMap(null); radarCircleRef.current = null; }
    if (!showRadar) return;

    // Create a pulsing radar circle at map center
    const center = map.getCenter();
    const radar = new window.google.maps.Circle({
      center: { lat: center.lat(), lng: center.lng() },
      radius: 80000,
      strokeColor: '#22d3ee',
      strokeOpacity: 0.15,
      strokeWeight: 1,
      fillColor: '#22d3ee',
      fillOpacity: 0.03,
      map,
      clickable: false,
      editable: false,
    });

    // Add a second larger circle for sweep effect
    const radarOuter = new window.google.maps.Circle({
      center: { lat: center.lat(), lng: center.lng() },
      radius: 150000,
      strokeColor: '#22d3ee',
      strokeOpacity: 0.08,
      strokeWeight: 1,
      fillColor: '#22d3ee',
      fillOpacity: 0.01,
      map,
      clickable: false,
    });

    radarCircleRef.current = radar;

    // Update radar position when map moves
    const moveListener = map.addListener('idle', () => {
      const c = map.getCenter();
      radar.setCenter({ lat: c.lat(), lng: c.lng() });
      radarOuter.setCenter({ lat: c.lat(), lng: c.lng() });
    });

    return () => {
      radar.setMap(null);
      radarOuter.setMap(null);
      window.google?.maps?.event?.removeListener(moveListener);
    };
  }, [showRadar, timelineHour]);



  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full">
      {/* Google Maps Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Map Type HUD — Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowMapTypeHUD(!showMapTypeHUD)}
          className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors shadow-lg"
          title="Map Type"
        >
          <Satellite size={16} />
        </button>

        <AnimatePresence>
          {showMapTypeHUD && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-12 right-0 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl w-44"
            >
              <div className="px-3 py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Map View</span>
              </div>
              {MAP_TYPES.map((mt) => (
                <button
                  key={mt.id}
                  onClick={() => { setMapTypeId(mt.id); setShowMapTypeHUD(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors ${
                    mapTypeId === mt.id
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{mt.label}</span>
                  {mapTypeId === mt.id && <span className="ml-auto text-[9px] text-cyan-400">●</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layer HUD — Below map type */}
      <div className="absolute top-16 right-4 z-20">
        <button
          onClick={() => setShowLayerHUD(!showLayerHUD)}
          className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors shadow-lg"
          title="Map Layers"
        >
          <Layers size={16} />
        </button>

        <AnimatePresence>
          {showLayerHUD && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-12 right-0 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl w-52"
            >
              <div className="px-3 py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Map Layers</span>
              </div>
              {[
                { label: 'Risk Polygons', icon: '🌊', active: showPolygons, toggle: () => setShowPolygons(!showPolygons) },
                { label: 'Hospitals & Shelters', icon: '🏥', active: showFacilities, toggle: () => setShowFacilities(!showFacilities) },
                { label: 'Radar Scan', icon: '📡', active: showRadar, toggle: () => setShowRadar(!showRadar) },
                { label: 'Citizen SOS Feed', icon: '🚨', active: showSOSFeed, toggle: () => setShowSOSFeed(!showSOSFeed) },
              ].map((layer) => (
                <button
                  key={layer.label}
                  onClick={layer.toggle}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm">{layer.icon}</span>
                  <span className="flex-1">{layer.label}</span>
                  <div className={`w-8 h-4 rounded-full transition-all relative ${layer.active ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${layer.active ? 'left-4' : 'left-0.5'}`} />
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Route HUD Toggle Button */}
      <div className="absolute top-28 right-4 z-20">
        <button
          onClick={() => setShowRouteHUD(!showRouteHUD)}
          className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center text-white transition-all shadow-lg ${
            showRouteHUD
              ? 'bg-cyan-500/30 border-cyan-500/50'
              : 'bg-slate-900/80 border-white/10 hover:bg-slate-800/80'
          }`}
          title="Emergency Route Planner"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Route HUD Panel */}
      <AnimatePresence>
        {showRouteHUD && mapRef.current && (
          <EmergencyRouteHUD
            map={mapRef.current}
            onClose={() => setShowRouteHUD(false)}
          />
        )}
      </AnimatePresence>

      {/* Zoom Controls — Right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
        <button onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1) as ZoomLevel)} className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors shadow-lg">
          <ZoomIn size={16} />
        </button>
        <div className="flex flex-col items-center gap-0.5 py-1">
          {[5, 4, 3, 2, 1].map((z) => (
            <button
              key={z}
              onClick={() => setZoomLevel(z as ZoomLevel)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                zoomLevel === z
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
        <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1) as ZoomLevel)} className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors shadow-lg">
          <ZoomOut size={16} />
        </button>
        <button onClick={() => mapRef.current?.panTo({ lat: 22.5, lng: 78.9 })} className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors shadow-lg mt-1">
          <Crosshair size={16} />
        </button>
      </div>

      {/* Zoom Level Label — Top left */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 shadow-lg" style={{ left: showRouteHUD ? '360px' : '16px', transition: 'left 0.3s ease' }}>
        <div className="text-[10px] font-bold text-white tracking-wide">{config.label}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] text-slate-400">L</span>
          <span className="text-xs font-black text-cyan-400">{zoomLevel}</span>
          <span className="text-[9px] text-slate-500 ml-1">{config.description}</span>
        </div>
      </div>

      {/* Timeline Scrubber — Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-8 pb-3 px-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            {isPlaying ? <span className="text-xs">⏸</span> : <span className="text-xs">▶</span>}
          </button>

          <div className="flex-1 relative">
            <div className="h-1 bg-slate-800 rounded-full">
              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${(timelineHour / 24) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              {TIMELINE_MARKS.map((h) => (
                <button
                  key={h}
                  onClick={() => setTimelineHour(h)}
                  className={`text-[9px] font-bold ${timelineHour >= h ? 'text-cyan-400' : 'text-slate-600'} hover:text-white transition-colors`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-white">{timelineHour}:00</div>
          </div>

          <button onClick={() => setTimelineHour(24)} className="w-8 h-8 rounded-lg bg-slate-800/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <span className="text-xs">⏭</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-1 max-w-4xl mx-auto px-11">
          <span className="text-[9px] text-slate-500">Simulating disaster timeline</span>
          <span className="text-[9px] font-bold text-cyan-400">{visibleIncidents.length} incidents visible</span>
        </div>
      </div>

      {/* Incident Panel (Right side) */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 z-30 w-[360px] bg-slate-950/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: severityColors[selectedIncident.severity] }} />
                  <span className="text-xs font-bold text-white uppercase">{selectedIncident.id}</span>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="text-sm font-bold text-white mb-1">{selectedIncident.title}</div>
              <div className="text-xs text-slate-400 mb-3">{selectedIncident.description}</div>

              {/* Score */}
              <div className="bg-slate-800/60 rounded-xl p-3 mb-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Priority Score</span>
                  <span className="text-xl font-black" style={{ color: severityColors[selectedIncident.severity] }}>
                    {selectedIncident.priorityScore}/100
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${selectedIncident.priorityScore}%`, background: severityColors[selectedIncident.severity] }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-500">AI Confidence: {Math.round(selectedIncident.aiConfidence * 100)}%</span>
                  <span className="text-[9px] text-slate-500">{selectedIncident.reportCount} reports</span>
                </div>
              </div>

              {/* Nearby Infrastructure */}
              <div className="mb-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Nearby Infrastructure</h4>
                {selectedIncident.nearbyInfrastructure.map((inf, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 mb-1 border border-white/5">
                    <span className="text-sm">
                      {inf.type === 'hospital' ? '🏥' : inf.type === 'shelter' ? '🏠' : inf.type === 'police' ? '🚓' : '🚒'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-white truncate">{inf.name}</div>
                      <div className="text-[9px] text-slate-500">{inf.type.replace('_', ' ')}</div>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400">{inf.distance} km</span>
                  </div>
                ))}
              </div>

              {/* Reports */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recent Reports</h4>
                {selectedIncident.reports.slice(0, 3).map((rpt) => (
                  <div key={rpt.id} className="bg-slate-800/40 rounded-lg px-3 py-2 mb-1 border border-white/5">
                    <div className="text-[10px] text-slate-300">{rpt.text}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-slate-500">{rpt.source}</span>
                      <span className="text-[8px] text-slate-600">•</span>
                      <span className="text-[8px] text-slate-500">{rpt.language.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
