import { analyzeCityImprint } from "./analyzer";
import type { AnalysisProvider, AnalysisResult, CityKey } from "./types";

/**
 * LLM 接入预留：
 * 1. 在服务端实现 POST /api/analyze；
 * 2. 返回与 AnalysisResult 一致的 JSON；
 * 3. 设置 NEXT_PUBLIC_ANALYSIS_MODE=llm 后切换到此 Provider。
 *
 * Demo 默认永远使用本地规则引擎，避免在比赛现场受网络或密钥影响。
 */
export const llmAnalysisProvider: AnalysisProvider = {
  async analyze(city: CityKey, answers: string[]): Promise<AnalysisResult> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, answers }),
    });

    if (!response.ok) {
      return analyzeCityImprint(city, answers);
    }

    return (await response.json()) as AnalysisResult;
  },
};
