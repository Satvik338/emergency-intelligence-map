export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

export type IncidentType = 'flood' | 'fire' | 'earthquake' | 'landslide' | 'storm' | 'other';

export type TriageEntity = 'person' | 'farm_animal' | 'pet' | 'wildlife';
export type TriageDisaster = 'flood' | 'fire' | 'earthquake' | 'landslide';

export type MapView = 'live_map' | 'incidents' | 'risk_prediction' | 'community_safety' | 'analytics' | 'recovery';

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn' | 'mr';

export type ZoomLevel = 1 | 2 | 3 | 4 | 5;

export type LayerType = 'incidents' | 'risk_polygons' | 'hospitals' | 'rescue_units' | 'visual_feeds';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: SeverityLevel;
  priorityScore: number;
  aiConfidence: number;
  reportCount: number;
  coordinates: Coordinate;
  description: string;
  reports: RawReport[];
  nearbyInfrastructure: NearbyInfrastructure[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  boundary?: GeoJSONPolygon;
}

export interface RawReport {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  language: string;
  sentiment: number;
}

export interface NearbyInfrastructure {
  name: string;
  type: 'hospital' | 'shelter' | 'police' | 'fire_station';
  distance: number; // km
  coordinates: Coordinate;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'police' | 'fire_station';
  coordinates: Coordinate;
  capacity?: number;
  currentOccupancy?: number;
  isAccessible: boolean;
}

export interface RiskZone {
  id: string;
  name: string;
  type: IncidentType;
  riskLevel: SeverityLevel;
  coordinates: Coordinate;
  boundary: GeoJSONPolygon;
  affectedPopulation: number;
}

export interface SafetyInstruction {
  id: string;
  entity: TriageEntity;
  disaster: TriageDisaster;
  steps: SafetyStep[];
  warnings: string[];
  visualSteps?: string[];
}

export interface SafetyStep {
  order: number;
  title: string;
  description: string;
  icon: string;
  isUrgent: boolean;
}

export interface LanguageStrings {
  [key: string]: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  incidentId: string;
  type: 'reported' | 'escalated' | 'resolved' | 'updated';
  description: string;
}

// --- Recovery & Relief ---
export type ResourceType = 'food' | 'medical' | 'shelter';
export type ReliefStatus = 'pending' | 'in_transit' | 'delivered';

export interface ResourceAllocation {
  id: string;
  type: ResourceType;
  zone: string;
  quantity: number;
  delivered: number;
  status: ReliefStatus;
  lastUpdated: string;
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'missing' | 'found' | 'safe';
  photo?: string;
}

// --- SOS Report ---
export type SOSEmergencyType = 'flood' | 'fire' | 'trapped' | 'medical';

export interface SOSReport {
  id: string;
  type: SOSEmergencyType;
  location: { lat: number; lng: number; label: string };
  description: string;
  reportedAt: string;
  status: 'new' | 'acknowledged' | 'responding';
}

// --- Broadcast ---
export type BroadcastSeverity = 'critical_evacuation' | 'severe_warning' | 'public_advisory';
export type TargetZone = 'sector_1' | 'sector_2' | 'sector_3' | 'sector_4' | 'entire_city';

export interface BroadcastDirective {
  id: string;
  operatorId: string;
  targetZone: TargetZone;
  severity: BroadcastSeverity;
  message: string;
  pushedAt: string;
  deliveryStatus: string;
  devicesReached: number;
}
