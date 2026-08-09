import { LIVING_CIRCLES } from "../../../../lib/living-data";
import { fetchAmapCommute, hasAmapKey } from "../../../../lib/amap";
import { recommendLivingCircles } from "../../../../lib/recommender";
import type { CommuteEstimate, UserProfile } from "../../../../lib/living-types";

export async function POST(request: Request) {
  try {
    const profile = (await request.json()) as UserProfile;
    if (!profile?.officeLocation || !profile?.profession || !profile?.workPattern) {
      return Response.json({ error: "缺少完整生活画像" }, { status: 400 });
    }

    const fixture = recommendLivingCircles(profile);
    if (!hasAmapKey()) return Response.json(fixture);

    const candidateIds = new Set(fixture.recommendations.map((item) => item.circle.id));
    const candidates = LIVING_CIRCLES.filter((circle) => candidateIds.has(circle.id));
    const pairs = await Promise.all(
      candidates.map(async (circle) => {
        const commute = await fetchAmapCommute(
          circle.center,
          profile.officeLocation,
          profile.workPattern.commuteMode,
        );
        return [circle.id, commute] as const;
      }),
    );
    const overrides: Record<string, CommuteEstimate> = {};
    for (const [id, commute] of pairs) if (commute) overrides[id] = commute;
    return Response.json(
      Object.keys(overrides).length
        ? recommendLivingCircles(profile, overrides, "live")
        : fixture,
    );
  } catch {
    return Response.json({ error: "推荐生成失败" }, { status: 400 });
  }
}
