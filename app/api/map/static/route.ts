export async function GET(request: Request) {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) return new Response("AMap key is not configured", { status: 404 });
  const url = new URL(request.url);
  const lng = Number(url.searchParams.get("lng"));
  const lat = Number(url.searchParams.get("lat"));
  const zoom = Math.max(13, Math.min(17, Number(url.searchParams.get("zoom")) || 15));
  if (!lng || !lat) return new Response("Invalid map center", { status: 400 });
  const search = new URLSearchParams({
    key,
    location: `${lng},${lat}`,
    zoom: String(zoom),
    size: "750*500",
    scale: "2",
    traffic: "0",
  });
  try {
    const response = await fetch(`https://restapi.amap.com/v3/staticmap?${search}`, {
      signal: AbortSignal.timeout(5200),
    });
    if (!response.ok) return new Response("Map unavailable", { status: 502 });
    return new Response(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("Map unavailable", { status: 502 });
  }
}
