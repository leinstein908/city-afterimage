import { LIVING_CIRCLES } from "../../../../lib/living-data";
import { buildMapContext } from "../../../../lib/map-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const circleId = url.searchParams.get("circleId") ?? "";
  const circle = LIVING_CIRCLES.find((item) => item.id === circleId);
  if (!circle) return Response.json({ error: "未知生活圈" }, { status: 404 });
  const context = await buildMapContext(circle);
  return Response.json(context, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
