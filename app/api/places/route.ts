import { FIXTURE_SEARCH_PLACES } from "../../../lib/living-data";
import type { PlaceOption } from "../../../lib/living-types";

function hashLocation(query: string): PlaceOption {
  let hash = 0;
  for (const char of query) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return {
    id: `fixture-${hash.toString(36)}`,
    name: query,
    district: "武汉市 · 演示定位",
    address: "未配置地图密钥，已使用武汉范围内的近似坐标",
    lng: 114.2 + (hash % 230) / 1000,
    lat: 30.48 + ((hash >> 8) % 160) / 1000,
    source: "fixture",
  };
}

function verifiedFixtureMatches(query: string) {
  const normalized = query.replace(/[（()）\s·]/g, "").toLowerCase();
  const huaweiAliases = [
    "华为武汉研究所",
    "武汉华为研究所",
    "华为武汉研发基地",
    "华为武汉基地",
    "华为研究所武汉",
  ];
  if (huaweiAliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
    return FIXTURE_SEARCH_PLACES.filter((place) => place.id.startsWith("verified-huawei"));
  }
  return [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  if (!query) return Response.json({ places: [], mode: "fixture" });

  const verified = verifiedFixtureMatches(query);

  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (key) {
    try {
      const search = new URLSearchParams({
        key,
        keywords: query,
        region: "420100",
        city_limit: "true",
        page_size: "8",
      });
      const response = await fetch(`https://restapi.amap.com/v5/place/text?${search}`, {
        signal: AbortSignal.timeout(4500),
      });
      const payload = (await response.json()) as {
        pois?: Array<{
          id: string;
          name: string;
          location: string;
          address?: string;
          adname?: string;
        }>;
      };
      const places = (payload.pois ?? [])
        .map((poi): PlaceOption | null => {
          const [lng, lat] = (poi.location ?? "").split(",").map(Number);
          if (!lng || !lat) return null;
          return {
            id: poi.id,
            name: poi.name,
            district: poi.adname || "武汉市",
            address: poi.address || "武汉市",
            lng,
            lat,
            source: "amap",
          };
        })
        .filter((place): place is PlaceOption => Boolean(place));
      if (places.length) {
        const merged = verified.length
          ? [...verified, ...places.filter((place) => !place.name.includes("华为武汉研究所"))]
          : places;
        return Response.json({ places: merged.slice(0, 8), mode: "live" });
      }
    } catch {
      // Keep the experience usable in venue Wi-Fi and quota failures.
    }
  }

  const exact = verified.length ? verified : FIXTURE_SEARCH_PLACES.filter((place) =>
    `${place.name}${place.address}${place.district}`.includes(query),
  ).slice(0, 7);
  return Response.json({
    places: exact.length ? exact : [hashLocation(query)],
    mode: "fixture",
  });
}
