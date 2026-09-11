import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, AlertTriangle, Ruler, Clock, Zap,
  ChevronDown, ChevronUp, X, Shield, Star, RotateCcw,
} from 'lucide-react';
import { incidents } from '../data/incidents';
import type { Incident, Coordinate } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────
interface IncidentHazard {
  incident: Incident;
  distanceKm: number;
  segmentIndex: number;
}

interface RouteOption {
  id: string;
  name: string;
  subtitle: string;
  distance: string;
  distanceKm: number;
  duration: string;
  durationMinutes: number;
  path: { lat: number; lng: number }[];
  hazards: IncidentHazard[];
  riskLevel: 'safe' | 'caution' | 'high_risk';
  hazardCount: number;
  isRecommended: boolean;
}

interface EmergencyRouteHUDProps {
  map: any;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  { label: 'Delhi Command Center', lat: 28.6139, lng: 77.2090 },
  { label: 'Chennai Emergency HQ', lat: 13.0827, lng: 80.2707 },
  { label: 'Guwahati Relief Center', lat: 26.1445, lng: 91.7362 },
  { label: 'Mumbai Control Room', lat: 19.0760, lng: 72.8777 },
  { label: 'Kolkata Disaster Cell', lat: 22.5726, lng: 88.3639 },
  { label: 'Bangalore NDRF Base', lat: 12.9716, lng: 77.5946 },
];

// ─── Route names for display ─────────────────────────────────────────────────
const ROUTE_NAMES = [
  { name: 'Primary Route', subtitle: 'Highway — Fastest Path', icon: '🛤️' },
  { name: 'Alternative Route', subtitle: 'Secondary Road — Coastal Bypass', icon: '🛣️' },
  { name: 'AI Safe Bypass', subtitle: 'Hazard-Avoidance — Recommended', icon: '🛡️' },
];

export default function EmergencyRouteHUD({ map, onClose }: EmergencyRouteHUDProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<Coordinate | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinate | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showPresets, setShowPresets] = useState<'origin' | 'dest' | null>(null);
  const [expanded, setExpanded] = useState(true);

  const allPolylinesRef = useRef<any[]>([]);
  const allMarkersRef = useRef<any[]>([]);
  const dangerSegmentsRef = useRef<any[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllMapOverlays();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectPreset = useCallback(
    (preset: { label: string; lat: number; lng: number }, target: 'origin' | 'dest') => {
      if (target === 'origin') {
        setOrigin(preset.label);
        setOriginCoords({ lat: preset.lat, lng: preset.lng });
      } else {
        setDestination(preset.label);
        setDestinationCoords({ lat: preset.lat, lng: preset.lng });
      }
      setShowPresets(null);
    },
    [],
  );

  // ─── Haversine ────────────────────────────────────────────────────────
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ─── Find hazards along path (15km corridor) ──────────────────────────
  const findHazards = (path: { lat: number; lng: number }[]): IncidentHazard[] => {
    const hazards: IncidentHazard[] = [];
    const PROXIMITY_KM = 15;
    for (const incident of incidents) {
      if (!incident.isActive) continue;
      let minDist = Infinity;
      let segIdx = 0;
      const step = Math.max(1, Math.floor(path.length / 60));
      for (let i = 0; i < path.length; i += step) {
        const dist = haversineDistance(
          incident.coordinates.lat,
          incident.coordinates.lng,
          path[i].lat,
          path[i].lng,
        );
        if (dist < minDist) {
          minDist = dist;
          segIdx = i;
        }
      }
      if (
        minDist <= PROXIMITY_KM &&
        !hazards.find((h) => h.incident.id === incident.id)
      ) {
        hazards.push({
          incident,
          distanceKm: Math.round(minDist * 10) / 10,
          segmentIndex: segIdx,
        });
      }
    }
    return hazards;
  };

  // ─── Risk level from hazard count ─────────────────────────────────────
  const assessRisk = (hazardCount: number): 'safe' | 'caution' | 'high_risk' => {
    if (hazardCount === 0) return 'safe';
    if (hazardCount === 1) return 'caution';
    return 'high_risk';
  };

  const riskBadge = (level: 'safe' | 'caution' | 'high_risk') => {
    switch (level) {
      case 'safe':
        return { label: '🟢 SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
      case 'caution':
        return { label: '🟠 CAUTION', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' };
      case 'high_risk':
        return { label: '🔴 HIGH RISK', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' };
    }
  };

  // ─── Build paths (fallback straight-line variants) ────────────────────
  const buildStraightPath = (from: Coordinate, to: Coordinate): { lat: number; lng: number }[] => {
    const totalDist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const steps = Math.max(2, Math.ceil(totalDist / 5));
    const path: { lat: number; lng: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      path.push({
        lat: from.lat + (to.lat - from.lat) * t,
        lng: from.lng + (to.lng - from.lng) * t,
      });
    }
    return path;
  };

  // Alternative path with mid-point offset (simulates secondary highway)
  const buildAlternativePath = (
    from: Coordinate,
    to: Coordinate,
  ): { lat: number; lng: number }[] => {
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    const dist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const offset = dist * 0.08; // ~8% lateral offset
    const bearing = Math.atan2(to.lng - from.lng, to.lat - from.lat) + Math.PI / 2;
    const midOffsetLat = midLat + (offset * Math.cos(bearing)) / 111;
    const midOffsetLng = midLng + (offset * Math.sin(bearing)) / (111 * Math.cos((midLat * Math.PI) / 180));

    // Build path via 2 control points
    const totalDist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const steps = Math.max(4, Math.ceil(totalDist / 4));
    const path: { lat: number; lng: number }[] = [];

    const q1 = { lat: from.lat + (midOffsetLat - from.lat) * 0.5, lng: from.lng + (midOffsetLng - from.lng) * 0.5 };
    const q2 = { lat: to.lat + (midOffsetLat - to.lat) * 0.5, lng: to.lng + (midOffsetLng - to.lng) * 0.5 };

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Cubic bezier
      const lat =
        (1 - t) ** 3 * from.lat +
        3 * (1 - t) ** 2 * t * q1.lat +
        3 * (1 - t) * t ** 2 * q2.lat +
        t ** 3 * to.lat;
      const lng =
        (1 - t) ** 3 * from.lng +
        3 * (1 - t) ** 2 * t * q1.lng +
        3 * (1 - t) * t ** 2 * q2.lng +
        t ** 3 * to.lng;
      path.push({ lat, lng });
    }
    return path;
  };

  // AI Safe Bypass path — steers away from known incident locations
  const buildAISafePath = (
    from: Coordinate,
    to: Coordinate,
  ): { lat: number; lng: number }[] => {
    const activeIncidents = incidents.filter((i) => i.isActive);
    const totalDist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const steps = Math.max(6, Math.ceil(totalDist / 3));
    const path: { lat: number; lng: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Start with straight line
      let lat = from.lat + (to.lat - from.lat) * t;
      let lng = from.lng + (to.lng - from.lng) * t;

      // Push away from each active incident
      for (const inc of activeIncidents) {
        const dist = haversineDistance(lat, lng, inc.coordinates.lat, inc.coordinates.lng);
        if (dist < 20) {
          // Steer away proportionally
          const pushStrength = ((20 - dist) / 20) * 0.3;
          const awayLat = lat + (lat - inc.coordinates.lat) * pushStrength;
          const awayLng = lng + (lng - inc.coordinates.lng) * pushStrength;
          lat = lat + (awayLat - lat) * 0.6;
          lng = lng + (awayLng - lng) * 0.6;
        }
      }
      path.push({ lat, lng });
    }
    return path;
  };

  // ─── Clear all overlays from map ──────────────────────────────────────
  const clearAllMapOverlays = () => {
    allPolylinesRef.current.forEach((p) => {
      try { p.setMap(null); } catch (_) { /* ok */ }
    });
    allPolylinesRef.current = [];
    allMarkersRef.current.forEach((m) => {
      try { m.setMap(null); } catch (_) { /* ok */ }
    });
    allMarkersRef.current = [];
    dangerSegmentsRef.current.forEach((p) => {
      try { p.setMap(null); } catch (_) { /* ok */ }
    });
    dangerSegmentsRef.current = [];
  };

  // ─── Draw all routes on map ───────────────────────────────────────────
  const drawAllRoutes = (routes: RouteOption[], selectedId: string) => {
    clearAllMapOverlays();

    routes.forEach((route) => {
      const isSelected = route.id === selectedId;
      const fullPath = route.path.map(
        (p) => new window.google.maps.LatLng(p.lat, p.lng),
      );

      if (isSelected) {
        // Selected route: bold glowing line
        const color = route.riskLevel === 'safe' ? '#00f3ff' : '#ff0055';
        const weight = 5;

        // Outer glow
        const glowLine = new window.google.maps.Polyline({
          path: fullPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: weight + 6,
          map,
          clickable: false,
        });
        allPolylinesRef.current.push(glowLine);

        // Main line
        const mainLine = new window.google.maps.Polyline({
          path: fullPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: weight,
          map,
          clickable: false,
        });
        allPolylinesRef.current.push(mainLine);

        // Danger segments — crimson pulsing where hazards overlap
        if (route.hazards.length > 0) {
          route.hazards.forEach((h) => {
            const start = Math.max(0, h.segmentIndex - 15);
            const end = Math.min(route.path.length - 1, h.segmentIndex + 15);
            for (let i = start; i < end; i++) {
              const seg = new window.google.maps.Polyline({
                path: [
                  new window.google.maps.LatLng(route.path[i].lat, route.path[i].lng),
                  new window.google.maps.LatLng(route.path[i + 1].lat, route.path[i + 1].lng),
                ],
                strokeColor: '#ff0055',
                strokeOpacity: 1,
                strokeWeight: 8,
                map,
                clickable: false,
              });
              dangerSegmentsRef.current.push(seg);
              allPolylinesRef.current.push(seg);
            }
          });

          // Hazard warning markers at intersection points
          route.hazards.forEach((h) => {
            const markerSvg = `
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ff005580" stroke="#ff0055" stroke-width="2">
                  <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.8" to="0.2" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">⚠</text>
              </svg>`;
            const marker = new window.google.maps.Marker({
              position: new window.google.maps.LatLng(
                h.incident.coordinates.lat,
                h.incident.coordinates.lng,
              ),
              map,
              icon: {
                url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12),
              },
              title: `⚠️ ${h.incident.id} — ${h.incident.title} (${h.distanceKm}km from route)`,
            });
            allMarkersRef.current.push(marker);
          });
        }
      } else {
        // Non-selected: translucent dashed grey line
        const dashedLine = new window.google.maps.Polyline({
          path: fullPath,
          geodesic: true,
          strokeColor: '#64748b',
          strokeOpacity: 0.35,
          strokeWeight: 2,
          map,
          clickable: false,
          icons: [
            {
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                strokeWeight: 1.5,
                strokeColor: '#94a3b8',
              },
              offset: '0',
              repeat: '12px',
            },
          ],
        });
        allPolylinesRef.current.push(dashedLine);
      }
    });

    // Fit bounds to selected route
    const selected = routes.find((r) => r.id === selectedId);
    if (selected) {
      const bounds = new window.google.maps.LatLngBounds();
      selected.path.forEach((p) => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
      map.fitBounds(bounds, { top: 50, right: 360, bottom: 80, left: 50 });
    }
  };

  // ─── Calculate multi-route ────────────────────────────────────────────
  const calculateRoutes = useCallback(() => {
    if (!map || !originCoords || !destinationCoords) return;
    setCalculating(true);
    clearAllMapOverlays();

    const directionsService = new window.google.maps.DirectionsService();

    // Try Google Directions API with alternatives
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
        destination: new window.google.maps.LatLng(destinationCoords.lat, destinationCoords.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result: any, status: string) => {
        if (status !== 'OK' || !result.routes.length) {
          // Fallback: generate 3 synthetic routes
          buildFallbackRoutes();
          return;
        }

        // Process Google Directions routes (up to 3)
        const gRoutes = result.routes.slice(0, 3);
        const routeNames = [
          { name: 'Primary Route', subtitle: 'Highway — Fastest Path', icon: '🛤️' },
          { name: 'Alternative Route', subtitle: 'Secondary Road — Detour', icon: '🛣️' },
          { name: 'AI Safe Bypass', subtitle: 'Hazard-Avoidance — Recommended', icon: '🛡️' },
        ];

        const options: RouteOption[] = gRoutes.map((gRoute: any, idx: number) => {
          const leg = gRoute.legs[0];
          const path: { lat: number; lng: number }[] = [];
          gRoute.legs.forEach((l: any) => {
            l.steps.forEach((step: any) => {
              step.path.forEach((p: any) => {
                path.push({ lat: p.lat(), lng: p.lng() });
              });
            });
          });
          const distanceKm = leg.distance.value / 1000;
          const durationMinutes = Math.round(leg.duration.value / 60);
          const hazards = findHazards(path);
          const riskLevel = assessRisk(hazards.length);
          const hours = Math.floor(durationMinutes / 60);
          const mins = durationMinutes % 60;

          return {
            id: `route-${idx}`,
            name: routeNames[idx]?.name || `Route ${idx + 1}`,
            subtitle: routeNames[idx]?.subtitle || gRoute.summary || 'Alternate path',
            distance: `${Math.round(distanceKm)} km`,
            distanceKm: Math.round(distanceKm),
            duration: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
            durationMinutes,
            path,
            hazards,
            riskLevel,
            hazardCount: hazards.length,
            isRecommended: false,
          };
        });

        // Mark safest route as recommended
        if (options.length > 0) {
          const safestIdx = options.reduce(
            (best, r, i) => (r.hazardCount < options[best].hazardCount ? i : best),
            0,
          );
          options[safestIdx].isRecommended = true;
        }

        // For 3rd route (AI Safe Bypass), always regenerate with avoidance
        if (options.length >= 2) {
          const aiPath = buildAISafePath(originCoords, destinationCoords);
          const aiHazards = findHazards(aiPath);
          const aiRisk = assessRisk(aiHazards.length);
          const aiDistKm = Math.round(haversineDistance(originCoords.lat, originCoords.lng, destinationCoords.lat, destinationCoords.lng) * 1.25);
          const aiDurationMin = Math.round((aiDistKm / 60) * 60);
          const aiHours = Math.floor(aiDurationMin / 60);
          const aiMins = aiDurationMin % 60;

          // Replace 3rd or add
          const aiRoute: RouteOption = {
            id: 'route-ai',
            name: 'AI Safe Bypass',
            subtitle: 'Hazard-Avoidance — Recommended',
            icon: '🛡️',
            distance: `${aiDistKm} km`,
            distanceKm: aiDistKm,
            duration: aiHours > 0 ? `${aiHours}h ${aiMins}m` : `${aiMins}m`,
            durationMinutes: aiDurationMin,
            path: aiPath,
            hazards: aiHazards,
            riskLevel: aiRisk,
            hazardCount: aiHazards.length,
            isRecommended: aiRisk === 'safe' || aiHazards.length < (options[0]?.hazardCount ?? 99),
          } as any;

          if (options.length >= 3) {
            options[2] = aiRoute;
          } else {
            options.push(aiRoute);
          }

          // Re-check recommendation
          const allHazards = options.map((o) => o.hazardCount);
          const minHazards = Math.min(...allHazards);
          options.forEach((o) => {
            o.isRecommended = o.hazardCount === minHazards && minHazards < 99;
          });
        }

        // Sort: safest first
        options.sort((a, b) => a.hazardCount - b.hazardCount);

        setRouteOptions(options);
        const bestId = options.find((o) => o.isRecommended)?.id || options[0].id;
        setSelectedRouteId(bestId);
        drawAllRoutes(options, bestId);
        setCalculating(false);
      },
    );
  }, [map, originCoords, destinationCoords]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback routes when Directions API unavailable
  const buildFallbackRoutes = () => {
    if (!originCoords || !destinationCoords) return;

    const straightPath = buildStraightPath(originCoords, destinationCoords);
    const altPath = buildAlternativePath(originCoords, destinationCoords);
    const aiPath = buildAISafePath(originCoords, destinationCoords);

    const straightDistKm = haversineDistance(
      originCoords.lat, originCoords.lng,
      destinationCoords.lat, destinationCoords.lng,
    );
    const altDistKm = straightDistKm * 1.18;
    const aiDistKm = straightDistKm * 1.32;

    const buildOption = (
      id: string,
      name: string,
      subtitle: string,
      path: { lat: number; lng: number }[],
      distKm: number,
      speedKmH: number,
    ): RouteOption => {
      const hazards = findHazards(path);
      const riskLevel = assessRisk(hazards.length);
      const durMin = Math.round((distKm / speedKmH) * 60);
      const hours = Math.floor(durMin / 60);
      const mins = durMin % 60;
      return {
        id,
        name,
        subtitle,
        distance: `${Math.round(distKm)} km (est.)`,
        distanceKm: Math.round(distKm),
        duration: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
        durationMinutes: durMin,
        path,
        hazards,
        riskLevel,
        hazardCount: hazards.length,
        isRecommended: false,
      };
    };

    const options = [
      buildOption('route-0', 'Primary Route', 'Highway — Fastest Path', straightPath, straightDistKm, 65),
      buildOption('route-1', 'Alternative Route', 'Secondary Road — Coastal Bypass', altPath, altDistKm, 55),
      buildOption('route-2', 'AI Safe Bypass', 'Hazard-Avoidance — Recommended', aiPath, aiDistKm, 50),
    ];

    // Mark safest as recommended
    const minHazards = Math.min(...options.map((o) => o.hazardCount));
    options.forEach((o) => {
      o.isRecommended = o.hazardCount === minHazards;
    });

    // Sort: safest first
    options.sort((a, b) => a.hazardCount - b.hazardCount);

    setRouteOptions(options);
    const bestId = options.find((o) => o.isRecommended)?.id || options[0].id;
    setSelectedRouteId(bestId);
    drawAllRoutes(options, bestId);
    setCalculating(false);
  };

  // ─── Select a route ───────────────────────────────────────────────────
  const selectRoute = useCallback(
    (routeId: string) => {
      setSelectedRouteId(routeId);
      drawAllRoutes(routeOptions, routeId);
    },
    [routeOptions], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── Clear everything ─────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    clearAllMapOverlays();
    setRouteOptions([]);
    setSelectedRouteId(null);
    setOriginCoords(null);
    setDestinationCoords(null);
    setOrigin('');
    setDestination('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedRoute = routeOptions.find((r) => r.id === selectedRouteId);

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-4 left-4 z-30 w-[360px] max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur-xl z-10 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <Navigation size={16} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              Multi-Route Tactical Inspector
            </h3>
            <p className="text-[9px] text-slate-500">
              A-to-B navigation with hazard analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Point A */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              Point A — Origin / Base Station
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setOriginCoords(null);
                }}
                onFocus={() => setShowPresets('origin')}
                placeholder="Select or type origin..."
                className="w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                onClick={() => setShowPresets(showPresets === 'origin' ? null : 'origin')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <ChevronDown size={14} />
              </button>
              {showPresets === 'origin' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl max-h-48 overflow-y-auto">
                  {PRESET_LOCATIONS.map((loc) => (
                    <button
                      key={loc.label}
                      onClick={() => selectPreset(loc, 'origin')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-cyan-500/10 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} className="text-cyan-400 shrink-0" />
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Point B */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Point B — Destination / Target Area
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setDestinationCoords(null);
                }}
                onFocus={() => setShowPresets('dest')}
                placeholder="Select or type destination..."
                className="w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <button
                onClick={() => setShowPresets(showPresets === 'dest' ? null : 'dest')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <ChevronDown size={14} />
              </button>
              {showPresets === 'dest' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl max-h-48 overflow-y-auto">
                  {PRESET_LOCATIONS.map((loc) => (
                    <button
                      key={loc.label}
                      onClick={() => selectPreset(loc, 'dest')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-red-500/10 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} className="text-red-400 shrink-0" />
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateRoutes}
            disabled={!originCoords || !destinationCoords || calculating}
            className="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
          >
            {calculating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating Routes...
              </>
            ) : (
              <>
                <Zap size={14} />
                Calculate Multi-Route
              </>
            )}
          </button>

          {/* Route Options */}
          <AnimatePresence>
            {routeOptions.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {routeOptions.length} Routes Found
                </div>

                {/* Route Cards */}
                {routeOptions.map((route) => {
                  const isSelected = route.id === selectedRouteId;
                  const badge = riskBadge(route.riskLevel);
                  return (
                    <motion.button
                      key={route.id}
                      onClick={() => selectRoute(route.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left rounded-xl p-3 border transition-all ${
                        isSelected
                          ? route.riskLevel === 'safe'
                            ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                            : 'bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10'
                          : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                      }`}
                    >
                      {/* Route header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">
                          {ROUTE_NAMES.find((n) => n.name === route.name)?.icon || '🛤️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold ${
                                isSelected ? 'text-white' : 'text-slate-300'
                              }`}
                            >
                              {route.name}
                            </span>
                            {route.isRecommended && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                                ⭐ RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">{route.subtitle}</div>
                        </div>
                        {isSelected && (
                          <div
                            className={`w-3 h-3 rounded-full ${
                              route.riskLevel === 'safe'
                                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                                : 'bg-red-400 shadow-lg shadow-red-400/50'
                            }`}
                          />
                        )}
                      </div>

                      {/* Badges row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Distance */}
                        <div className="flex items-center gap-1 bg-slate-800/60 rounded-md px-2 py-1">
                          <Ruler size={10} className="text-cyan-400" />
                          <span className="text-[10px] font-bold text-cyan-400">{route.distance}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1 bg-slate-800/60 rounded-md px-2 py-1">
                          <Clock size={10} className="text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-400">{route.duration}</span>
                        </div>

                        {/* Hazard count */}
                        <div className="flex items-center gap-1 bg-slate-800/60 rounded-md px-2 py-1">
                          <AlertTriangle size={10} className={badge.color} />
                          <span className={`text-[10px] font-bold ${badge.color}`}>
                            {route.hazardCount}
                          </span>
                        </div>

                        {/* Risk badge */}
                        <div
                          className={`flex items-center rounded-md px-2 py-1 border ${badge.bg}`}
                        >
                          <span className={`text-[9px] font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Selected Route Detail */}
                {selectedRoute && (
                  <div
                    className={`rounded-xl p-3 border ${
                      selectedRoute.hazards.length > 0
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-emerald-500/5 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedRoute.hazards.length > 0 ? (
                        <AlertTriangle size={14} className="text-red-400" />
                      ) : (
                        <Shield size={14} className="text-emerald-400" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                        Hazard Analysis — {selectedRoute.name}
                      </span>
                    </div>

                    {selectedRoute.hazards.length > 0 ? (
                      <>
                        <div className="text-sm font-black text-red-400 mb-2">
                          ⚠️ {selectedRoute.hazardCount} Active{' '}
                          {selectedRoute.hazardCount === 1 ? 'Hazard' : 'Hazards'} in 15km Corridor
                        </div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {selectedRoute.hazards.map((h) => (
                            <div
                              key={h.incident.id}
                              className="flex items-center gap-2 bg-red-500/10 rounded-md px-2 py-1.5"
                            >
                              <span className="text-xs">
                                {h.incident.type === 'flood'
                                  ? '🌊'
                                  : h.incident.type === 'fire'
                                  ? '🔥'
                                  : h.incident.type === 'earthquake'
                                  ? '🌍'
                                  : h.incident.type === 'landslide'
                                  ? '⛰️'
                                  : '🌪️'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-white truncate">
                                  {h.incident.id}
                                </div>
                                <div className="text-[9px] text-slate-400 truncate">
                                  {h.incident.title}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[10px] font-bold text-red-400">
                                  {h.distanceKm}km
                                </div>
                                <div className="text-[8px] text-slate-500">from route</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-[9px] text-red-300/70">
                          🔴 Route segments near hazards highlighted in crimson on map
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-emerald-300">
                        ✅ Route clear — no active incidents within 15km corridor
                      </div>
                    )}
                  </div>
                )}

                {/* Clear Button */}
                <button
                  onClick={clearAll}
                  className="w-full py-2 rounded-lg bg-slate-800/60 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Clear All Routes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
