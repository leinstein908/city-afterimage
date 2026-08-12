import type {
  RecommendationResult,
  RecommendationRole,
  UserProfile,
} from "./living-types";

export type QuickTuneKind = "commute" | "nature" | "night";

export interface ReplanRoleChange {
  role: RecommendationRole;
  roleLabel: string;
  before: string;
  after: string;
  changed: boolean;
}

export interface ReplanDelta {
  id: number;
  kind: QuickTuneKind;
  conditionLabel: string;
  beforeCondition: string;
  afterCondition: string;
  roles: ReplanRoleChange[];
  changedRoles: RecommendationRole[];
  catLine: string;
}

function conditionDelta(kind: QuickTuneKind, before: UserProfile, after: UserProfile) {
  if (kind === "commute") {
    return {
      label: "通勤上限",
      before: `${before.workPattern.maxCommuteMinutes} 分钟`,
      after: `${after.workPattern.maxCommuteMinutes} 分钟`,
    };
  }
  if (kind === "nature") {
    return {
      label: "自然偏好",
      before: `${before.axisAdjustments.nature ?? 0}`,
      after: `${after.axisAdjustments.nature ?? 0}`,
    };
  }
  return {
    label: "夜间生活偏好",
    before: `${before.axisAdjustments.convenience ?? 0}`,
    after: `${after.axisAdjustments.convenience ?? 0}`,
  };
}

export function buildReplanDelta(
  kind: QuickTuneKind,
  beforeProfile: UserProfile,
  afterProfile: UserProfile,
  beforeResult: RecommendationResult,
  afterResult: RecommendationResult,
): ReplanDelta {
  const condition = conditionDelta(kind, beforeProfile, afterProfile);
  const roles = beforeResult.recommendations.map((previous) => {
    const next = afterResult.recommendations.find((item) => item.role === previous.role);
    const after = next?.circle.name ?? previous.circle.name;
    return {
      role: previous.role,
      roleLabel: previous.roleLabel,
      before: previous.circle.name,
      after,
      changed: previous.circle.name !== after,
    };
  });
  const changedRoles = roles.filter((role) => role.changed).map((role) => role.role);
  const firstChange = roles.find((role) => role.changed);
  const catLine = firstChange
    ? `${condition.label}一变，${firstChange.roleLabel}从${firstChange.before}换成${firstChange.after}。这不是换名字，是你刚把一种日常放到了更前面。`
    : `${condition.label}已经从${condition.before}调到${condition.after}。前三个圈暂时没换位，但证据强弱和一天安排已经重新计算。`;

  return {
    id: Date.now(),
    kind,
    conditionLabel: condition.label,
    beforeCondition: condition.before,
    afterCondition: condition.after,
    roles,
    changedRoles,
    catLine,
  };
}
