export type TranslationMode = 'speech-to-sign' | 'sign-to-speech';

export interface SibiSign {
  id: string;
  label: string;
  category: 'alfabet' | 'kata-dasar' | 'sapaan' | 'angka';
  description: string;
  shortDesc?: string;
  fingerGuide?: string;
  motion?: string;
  tips?: string;
  svgIcon?: string;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: string;
  sourceText: string;
  translatedResult: string;
  mode: TranslationMode;
}

export type DevicePermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface FingerStates {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface HandGestureResult {
  letter: string;
  confidence: number;
  label: string;
  fingerStates: FingerStates;
  description?: string;
  handedness?: 'Left' | 'Right';
  isDynamic?: boolean;
  gestureType?: 'letter' | 'word' | 'greeting';
  motionTrail?: { x: number; y: number }[];
  immediateCommit?: boolean;
  motionEnergy?: number;
}

export interface GeminiAnalysisResult {
  sign: string;
  confidence: string;
  isAccurate: boolean;
  feedback: string;
  suggestions: string[];
}
