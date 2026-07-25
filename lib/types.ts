export type CityKey = "wuhan" | "beijing" | "shanghai" | "chengdu" | "guangzhou";

export type ImageCategory =
  | "spatial"
  | "sensory"
  | "cultural"
  | "social"
  | "emotional"
  | "narrative";

export interface CityConfig {
  name: string;
  romanized: string;
  caption: string;
  signature: string[];
  declarationTail: string;
}

export interface Question {
  id: string;
  shortTitle: string;
  category: ImageCategory;
  kicker: string;
  prompt: string;
  help: string;
  placeholder: string;
}

export interface ImageNode {
  id: string;
  label: string;
  quote: string;
  category: ImageCategory;
  importance: number;
  uniqueness: number;
  x: number;
  y: number;
}

export interface AnalysisResult {
  code: string;
  city: string;
  cityKey: CityKey;
  declaration: string;
  nodes: ImageNode[];
  path: string[];
  scores: {
    recognition: number;
    uniqueness: number;
    distinctiveness: number;
  };
  footnote: string;
}

export interface AnalysisProvider {
  analyze(city: CityKey, answers: string[]): Promise<AnalysisResult>;
}
