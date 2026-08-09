import type { DaySimulation } from "../../../lib/living-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      circleName?: string;
      weekday?: DaySimulation;
      weekend?: DaySimulation;
    };
    if (!body.circleName || !body.weekday || !body.weekend) {
      return Response.json({ error: "缺少结构化日程" }, { status: 400 });
    }
    const weekdayMoment = body.weekday.stops[1]?.title ?? "回到生活半径";
    const weekendMoment = body.weekend.stops[1]?.title ?? "在附近慢下来";
    return Response.json({
      mode: "template",
      text: `住在${body.circleName}，普通工作日可以${weekdayMoment}；到了周末，再${weekendMoment}。它不承诺完美，只把你最在意的生活放得更近。`,
    });
  } catch {
    return Response.json({ error: "叙事生成失败" }, { status: 400 });
  }
}
