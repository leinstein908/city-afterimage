import { hasAmapKey } from "./amap";
import type {
  Coordinate,
  FacilityCategory,
  LivingCircle,
  MapContext,
  NearbyFacility,
} from "./living-types";

export const FACILITY_FILTERS: Array<{
  id: FacilityCategory | "all";
  label: string;
  mark: string;
}> = [
  { id: "all", label: "全部", mark: "全" },
  { id: "metro", label: "地铁", mark: "轨" },
  { id: "bus", label: "公交", mark: "站" },
  { id: "park", label: "公园", mark: "园" },
  { id: "health", label: "医疗", mark: "医" },
  { id: "market", label: "商超菜场", mark: "买" },
  { id: "food", label: "餐饮", mark: "食" },
];

const AMAP_TYPES: Record<FacilityCategory, string> = {
  metro: "150500",
  bus: "150700",
  park: "110100",
  health: "090100|090200|090300|090400",
  market: "060400|060700|060800",
  food: "050000",
};

const PI = Math.PI;
const A = 6378245;
const EE = 0.006693421622965943;

function outOfChina(lng: number, lat: number) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(lng: number, lat: number) {
  let value = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  value += ((20 * Math.sin(lat * PI) + 40 * Math.sin((lat / 3) * PI)) * 2) / 3;
  value += ((160 * Math.sin((lat / 12) * PI) + 320 * Math.sin((lat * PI) / 30)) * 2) / 3;
  return value;
}

function transformLng(lng: number, lat: number) {
  let value = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  value += ((20 * Math.sin(lng * PI) + 40 * Math.sin((lng / 3) * PI)) * 2) / 3;
  value += ((150 * Math.sin((lng / 12) * PI) + 300 * Math.sin((lng / 30) * PI)) * 2) / 3;
  return value;
}

export function gcj02ToWgs84(point: Coordinate): Coordinate {
  if (outOfChina(point.lng, point.lat)) return point;
  let dLat = transformLat(point.lng - 105, point.lat - 35);
  let dLng = transformLng(point.lng - 105, point.lat - 35);
  const radLat = (point.lat / 180) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lng: point.lng * 2 - (point.lng + dLng), lat: point.lat * 2 - (point.lat + dLat) };
}

function fixtureFacilities(circle: LivingCircle): NearbyFacility[] {
  const common: NearbyFacility[] = [
    {
      id: `${circle.id}-market`,
      name: circle.poi.breakfast,
      category: "market",
      source: "fixture",
      coordinateVerified: false,
    },
    {
      id: `${circle.id}-food`,
      name: circle.poi.evening,
      category: "food",
      source: "fixture",
      coordinateVerified: false,
    },
    {
      id: `${circle.id}-park`,
      name: circle.poi.nature,
      category: "park",
      source: "fixture",
      coordinateVerified: false,
    },
  ];

  if (circle.id !== "future-tech") return common;
  return [
    {
      id: "future-metro-guanggu-7",
      name: "光谷七路站",
      category: "metro",
      address: "武汉地铁 11 号线",
      distanceMeters: 300,
      coordinate: { lng: 114.5275, lat: 30.4907 },
      source: "fixture",
      coordinateVerified: true,
    },
    {
      id: "future-bus-jiufeng-3",
      name: "九峰三路未来科技城公交站",
      category: "bus",
      distanceMeters: 220,
      coordinate: { lng: 114.5323, lat: 30.4938 },
      source: "fixture",
      coordinateVerified: true,
    },
    {
      id: "future-tram-guanggu-7",
      name: "光谷七路有轨电车站",
      category: "bus",
      distanceMeters: 180,
      coordinate: { lng: 114.5287, lat: 30.4926 },
      source: "fixture",
      coordinateVerified: true,
    },
    {
      id: "future-park-botanical",
      name: "武汉植物园光谷园区",
      category: "park",
      distanceMeters: 1300,
      coordinate: { lng: 114.5305, lat: 30.504 },
      source: "fixture",
      coordinateVerified: true,
    },
    ...common,
  ];
}

async function fetchAmapFacilities(circle: LivingCircle): Promise<NearbyFacility[]> {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) return [];
  const entries = await Promise.all(
    (Object.keys(AMAP_TYPES) as FacilityCategory[]).map(async (category) => {
      const search = new URLSearchParams({
        key,
        location: `${circle.center.lng},${circle.center.lat}`,
        radius: "1800",
        types: AMAP_TYPES[category],
        city_limit: "true",
        page_size: category === "food" ? "5" : "3",
        show_fields: "business",
      });
      try {
        const response = await fetch(`https://restapi.amap.com/v5/place/around?${search}`, {
          signal: AbortSignal.timeout(4200),
        });
        if (!response.ok) return [];
        const payload = (await response.json()) as {
          pois?: Array<{
            id: string;
            name: string;
            location?: string;
            address?: string;
            distance?: string;
          }>;
        };
        return (payload.pois ?? []).flatMap((poi): NearbyFacility[] => {
          const [lng, lat] = (poi.location ?? "").split(",").map(Number);
          if (!lng || !lat) return [];
          return [{
            id: poi.id,
            name: poi.name,
            category,
            address: poi.address,
            distanceMeters: Number(poi.distance) || undefined,
            coordinate: { lng, lat },
            source: "amap",
            coordinateVerified: true,
          }];
        });
      } catch {
        return [];
      }
    }),
  );
  return entries.flat().slice(0, 28);
}

type OsmElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function osmCategory(tags: Record<string, string>): FacilityCategory | null {
  if (tags.station === "subway" || tags.subway === "yes") return "metro";
  if (tags.highway === "bus_stop" || tags.public_transport === "platform") return "bus";
  if (tags.leisure === "park" || tags.boundary === "national_park") return "park";
  if (["hospital", "clinic", "doctors", "pharmacy"].includes(tags.amenity)) return "health";
  if (["supermarket", "convenience", "mall", "greengrocer", "department_store"].includes(tags.shop)) return "market";
  if (["restaurant", "fast_food", "cafe", "food_court"].includes(tags.amenity)) return "food";
  return null;
}

async function fetchOsmFacilities(center: Coordinate): Promise<NearbyFacility[]> {
  const query = `[out:json][timeout:5];(
    nwr(around:1800,${center.lat},${center.lng})[station=subway];
    nwr(around:1800,${center.lat},${center.lng})[subway=yes];
    nwr(around:1800,${center.lat},${center.lng})[highway=bus_stop];
    nwr(around:1800,${center.lat},${center.lng})[leisure=park];
    nwr(around:1800,${center.lat},${center.lng})[amenity~"hospital|clinic|doctors|pharmacy"];
    nwr(around:1800,${center.lat},${center.lng})[shop~"supermarket|convenience|mall|greengrocer|department_store"];
    nwr(around:1800,${center.lat},${center.lng})[amenity~"restaurant|fast_food|cafe|food_court"];
  );out center 35;`;
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(5200),
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { elements?: OsmElement[] };
    const seen = new Set<string>();
    const counts = new Map<FacilityCategory, number>();
    return (payload.elements ?? []).flatMap((element): NearbyFacility[] => {
      const tags = element.tags ?? {};
      const category = osmCategory(tags);
      const name = tags["name:zh"] || tags.name;
      const coordinate = element.lat && element.lon
        ? { lat: element.lat, lng: element.lon }
        : element.center
          ? { lat: element.center.lat, lng: element.center.lon }
          : undefined;
      if (!category || !name || !coordinate || seen.has(`${category}-${name}`)) return [];
      if ((counts.get(category) ?? 0) >= 5) return [];
      seen.add(`${category}-${name}`);
      counts.set(category, (counts.get(category) ?? 0) + 1);
      return [{
        id: `osm-${element.id}`,
        name,
        category,
        address: tags["addr:street"] || tags.operator,
        coordinate,
        source: "osm",
        coordinateVerified: true,
      }];
    });
  } catch {
    return [];
  }
}

export async function buildMapContext(circle: LivingCircle): Promise<MapContext> {
  if (hasAmapKey()) {
    const facilities = await fetchAmapFacilities(circle);
    if (facilities.length) {
      return {
        mode: "amap",
        baseMap: "amap-static",
        coordinateSystem: "gcj02",
        center: circle.center,
        facilities,
        sourceLabel: "高德实时路网与周边设施",
        note: "设施与道路为实时地图数据；通勤仅在结果标注“高德路线”时才是实时路线。",
      };
    }
  }

  const wgsCenter = gcj02ToWgs84(circle.center);
  const osmFacilities = await fetchOsmFacilities(wgsCenter);
  if (osmFacilities.length) {
    return {
      mode: "osm",
      baseMap: "osm-tiles",
      coordinateSystem: "wgs84",
      center: wgsCenter,
      facilities: osmFacilities,
      sourceLabel: "OpenStreetMap 实时开放路网与设施",
      note: "道路与设施来自开放地图；推荐与通勤仍使用本地模型估算。",
    };
  }

  return {
    mode: "fixture",
    baseMap: "osm-tiles",
    coordinateSystem: "wgs84",
    center: wgsCenter,
    facilities: fixtureFacilities(circle),
    sourceLabel: "开放路网底图 · 本地演示设施",
    note: "有坐标标记的设施经过公开地图校验；其余只展示名称，不伪造精确点位。",
  };
}
