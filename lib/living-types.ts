export type ProfessionId =
  | "technology"
  | "design"
  | "healthcare"
  | "education"
  | "finance"
  | "flexible";

export type CommuteMode = "transit" | "walking" | "cycling" | "driving";

export type LifestyleAxis =
  | "convenience"
  | "calm"
  | "social"
  | "texture"
  | "nature"
  | "exploration";

export interface Coordinate {
  lng: number;
  lat: number;
}

export interface PlaceOption extends Coordinate {
  id: string;
  name: string;
  district: string;
  address: string;
  source: "amap" | "fixture";
}

export interface ProfessionHero {
  id: ProfessionId;
  title: string;
  profession: string;
  motto: string;
  icon: string;
  defaultWork: WorkPattern;
}

export interface WorkPattern {
  startTime: string;
  endTime: string;
  overtime: "rare" | "sometimes" | "often";
  commuteMode: CommuteMode;
  maxCommuteMinutes: number;
}

export interface PersonalAnchor {
  id: string;
  label: string;
  place: PlaceOption;
}

export interface SceneChoice {
  sceneId: string;
  optionId: string | null;
}

export interface UserProfile {
  profession: ProfessionId;
  workPattern: WorkPattern;
  officeLocation: PlaceOption;
  optionalAnchors: PersonalAnchor[];
  sceneChoices: SceneChoice[];
  weekdayPriorities: string[];
  weekendPriorities: string[];
  axisAdjustments: Partial<Record<LifestyleAxis, number>>;
}

export interface LifestyleAxisScore {
  id: LifestyleAxis;
  label: string;
  value: number;
  phrase: string;
}

export interface LifestyleAfterimage {
  declaration: string;
  axes: LifestyleAxisScore[];
  tokens: Array<{ axis: LifestyleAxis; label: string }>;
  hardConstraints: string[];
  evidence: string[];
  confidence: number;
}

export interface CircleFeatureVector {
  convenience: number;
  calm: number;
  social: number;
  texture: number;
  nature: number;
  exploration: number;
  transit: number;
  lateFood: number;
  walkability: number;
}

export interface LivingCircle {
  id: string;
  name: string;
  district: string;
  tagline: string;
  center: Coordinate;
  mapPosition: { x: number; y: number };
  catchmentRadiusKm: number;
  features: CircleFeatureVector;
  poi: {
    breakfast: string;
    evening: string;
    nature: string;
    culture: string;
  };
}

export type FacilityCategory =
  | "metro"
  | "bus"
  | "park"
  | "health"
  | "market"
  | "food";

export interface NearbyFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  address?: string;
  distanceMeters?: number;
  coordinate?: Coordinate;
  source: "amap" | "osm" | "fixture";
  coordinateVerified: boolean;
}

export interface MapContext {
  mode: "amap" | "osm" | "fixture";
  baseMap: "amap-static" | "osm-tiles";
  coordinateSystem: "gcj02" | "wgs84";
  center: Coordinate;
  facilities: NearbyFacility[];
  sourceLabel: string;
  note: string;
}

export interface CommuteEstimate {
  minutes: number;
  mode: CommuteMode;
  source: "amap" | "estimate";
  description: string;
}

export interface DayStop {
  time: string;
  title: string;
  detail: string;
}

export interface DaySimulation {
  title: string;
  subtitle: string;
  stops: DayStop[];
}

export interface RecommendationEvidence {
  id: string;
  axis: LifestyleAxis | "commute" | "anchor";
  label: string;
  detail: string;
  impact: number;
}

export type RecommendationRole = "match" | "easy" | "growth";

export interface Recommendation {
  role: RecommendationRole;
  roleLabel: string;
  circle: LivingCircle;
  score: number;
  scoreBreakdown: {
    commute: number;
    facilities: number;
    rhythm: number;
    social: number;
    textureNature: number;
    anchor: number;
  };
  commute: CommuteEstimate;
  evidence: RecommendationEvidence[];
  tradeoff: string;
  weekday: DaySimulation;
  weekend: DaySimulation;
}

export interface RecommendationResult {
  code: string;
  dataMode: "live" | "fixture";
  afterimage: LifestyleAfterimage;
  recommendations: Recommendation[];
}

export interface FeedbackAdjustment {
  recommendationRole: RecommendationRole;
  evidenceId: string;
  axis: RecommendationEvidence["axis"];
  direction: "like" | "dislike";
}

export interface SceneOption {
  id: string;
  title: string;
  detail: string;
  time: string;
  art: string;
  deltas: Partial<Record<LifestyleAxis, number>>;
}

export interface SceneDuel {
  id: string;
  chapter: string;
  prompt: string;
  options: [SceneOption, SceneOption];
}

export interface PriorityCard {
  id: string;
  title: string;
  detail: string;
  icon: string;
  deltas: Partial<Record<LifestyleAxis, number>>;
}
