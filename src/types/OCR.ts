import { CategoryType } from "./Carbon";

export interface ScanDetectedItem {
  name: string;
  co2: number;
  alternative?: string;
}

export interface ScanResult {
  name: string;
  co2Value: number;
  type: "receipt" | "bill" | "product" | "location" | "camera";
  category?: CategoryType;
  detectedItems: ScanDetectedItem[];
  confidence: number;
  co2Avoided?: number;
  tips?: string[];
  score?: number;
}
