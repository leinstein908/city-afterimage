import type { CommuteEstimate, CommuteMode, Coordinate } from "./living-types";

const AMAP_BASE = "https://restapi.amap.com";

export function hasAmapKey() {
  return Boolean(process.env.AMAP_WEB_SERVICE_KEY);
}

function commuteEndpoint(mode: CommuteMode) {
  if (mode === "driving") return "/v5/direction/driving";
  if (mode === "walking") return "/v5/direction/walking";
  return "/v5/direction/transit/integrated";
}

export async function fetchAmapCommute(
  origin: Coordinate,
  destination: Coordinate,
  mode: CommuteMode,
): Promise<CommuteEstimate | null> {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key || mode === "cycling") return null;
  const search = new URLSearchParams({
    key,
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
    show_fields: "cost",
  });
  if (mode === "transit") {
    search.set("city1", "420100");
    search.set("city2", "420100");
  }
  try {
    const response = await fetch(`${AMAP_BASE}${commuteEndpoint(mode)}?${search}`, {
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      status?: string;
      route?: {
        paths?: Array<{ cost?: { duration?: string | number }; duration?: string | number }>;
        transits?: Array<{ cost?: { duration?: string | number }; duration?: string | number }>;
      };
    };
    const route = payload.route;
    const first = mode === "transit" ? route?.transits?.[0] : route?.paths?.[0];
    const seconds = Number(first?.cost?.duration ?? first?.duration ?? 0);
    if (!seconds) return null;
    const minutes = Math.max(3, Math.round(seconds / 60));
    const label = { transit: "公共交通", walking: "步行", driving: "驾车", cycling: "骑行" }[mode];
    return {
      minutes,
      mode,
      source: "amap",
      description: `${minutes} 分钟左右 · 高德${label}路线`,
    };
  } catch {
    return null;
  }
}
