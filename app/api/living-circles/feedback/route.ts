import { applyFeedback, recommendLivingCircles } from "../../../../lib/recommender";
import type { FeedbackAdjustment, UserProfile } from "../../../../lib/living-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile: UserProfile;
      feedback: FeedbackAdjustment;
    };
    const profile = applyFeedback(body.profile, body.feedback);
    return Response.json({ profile, result: recommendLivingCircles(profile) });
  } catch {
    return Response.json({ error: "反馈调整失败" }, { status: 400 });
  }
}
