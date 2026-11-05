import { NormalizedLandmark } from '../../types';

export interface TransformOptions {
  /** Rotation in degrees around palm center (positive = clockwise in screen space) */
  rotateDeg?: number;
  /** Scale multiplier (1.0 = standard palm size ~0.18) */
  scale?: number;
  /** Translation offset in normalized screen coords */
  translateX?: number;
  translateY?: number;
  /** Mirror horizontally across x=0.5 (converts Right hand to Left hand in camera) */
  mirrorX?: boolean;
  /** Deterministic jitter amplitude */
  jitter?: number;
}

/**
 * Base palm anatomy (Right hand facing camera, upright):
 * Wrist at (0.50, 0.72, 0)
 * Index MCP at (0.43, 0.54, -0.01)
 * Middle MCP at (0.48, 0.52, -0.01) -> palmSize = dist(wrist, middleMcp) ≈ 0.201
 * Ring MCP at (0.53, 0.53, -0.01)
 * Pinky MCP at (0.58, 0.56, -0.01)
 * Thumb CMC at (0.42, 0.67, -0.02), Thumb MCP at (0.38, 0.60, -0.03)
 */
function createBasePalm(): NormalizedLandmark[] {
  const lm: NormalizedLandmark[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  lm[0] = { x: 0.50, y: 0.72, z: 0.0 }; // Wrist
  lm[1] = { x: 0.42, y: 0.67, z: -0.02 }; // Thumb CMC
  lm[2] = { x: 0.38, y: 0.60, z: -0.03 }; // Thumb MCP
  lm[5] = { x: 0.43, y: 0.54, z: -0.01 }; // Index MCP
  lm[9] = { x: 0.48, y: 0.52, z: -0.01 }; // Middle MCP
  lm[13] = { x: 0.53, y: 0.53, z: -0.01 }; // Ring MCP
  lm[17] = { x: 0.58, y: 0.56, z: -0.01 }; // Pinky MCP
  return lm;
}

/**
 * Sets a finger's PIP, DIP, TIP joints given MCP index.
 * curl = 0 -> straight up
 * curl = 1 -> tightly curled into palm (PIP up slightly, DIP/TIP folded down onto palm)
 * curl = 0.85 -> loose fist (knuckles up, tips resting near MCP line)
 */
function setFingerCurl(
  lm: NormalizedLandmark[],
  mcpIdx: 5 | 9 | 13 | 17,
  curl: number,
  spreadX: number = 0,
  lenScale: number = 1.0
) {
  const mcp = lm[mcpIdx];
  const seg1 = 0.065 * lenScale;
  const seg2 = 0.048 * lenScale;
  const seg3 = 0.042 * lenScale;

  if (curl <= 0.05) {
    // Fully extended straight up
    lm[mcpIdx + 1] = { x: mcp.x + spreadX * 0.35, y: mcp.y - seg1, z: (mcp.z || 0) - 0.005 };
    lm[mcpIdx + 2] = { x: mcp.x + spreadX * 0.70, y: mcp.y - (seg1 + seg2), z: (mcp.z || 0) - 0.01 };
    lm[mcpIdx + 3] = { x: mcp.x + spreadX * 1.0, y: mcp.y - (seg1 + seg2 + seg3), z: (mcp.z || 0) - 0.015 };
  } else if (curl >= 0.9) {
    // Tightly curled fist: PIP rises slightly above MCP, DIP bends down, TIP tucks below MCP into palm
    lm[mcpIdx + 1] = { x: mcp.x + spreadX * 0.2, y: mcp.y - seg1 * 0.42, z: (mcp.z || 0) - 0.025 };
    lm[mcpIdx + 2] = { x: mcp.x + spreadX * 0.15, y: mcp.y + seg2 * 0.18, z: (mcp.z || 0) - 0.035 };
    lm[mcpIdx + 3] = { x: mcp.x + spreadX * 0.1, y: mcp.y + seg3 * 0.65, z: (mcp.z || 0) - 0.02 };
  } else if (curl >= 0.75) {
    // Realistic webcam fist (tips rest right around or slightly above MCP y-level!)
    lm[mcpIdx + 1] = { x: mcp.x + spreadX * 0.2, y: mcp.y - seg1 * 0.55, z: (mcp.z || 0) - 0.025 };
    lm[mcpIdx + 2] = { x: mcp.x + spreadX * 0.15, y: mcp.y - seg2 * 0.20, z: (mcp.z || 0) - 0.035 };
    lm[mcpIdx + 3] = { x: mcp.x + spreadX * 0.1, y: mcp.y - seg3 * 0.05, z: (mcp.z || 0) - 0.025 };
  } else {
    // Partially curved / arched (e.g. C or O)
    const angle1 = Math.PI / 2 - curl * 0.55;
    const angle2 = angle1 - curl * 1.15;
    const angle3 = angle2 - curl * 1.15;
    const pip = {
      x: mcp.x + spreadX * 0.3 - Math.cos(angle1) * seg1 * 0.5,
      y: mcp.y - Math.sin(angle1) * seg1,
      z: (mcp.z || 0) - 0.02
    };
    const dip = {
      x: pip.x - Math.cos(angle2) * seg2 * 0.6,
      y: pip.y - Math.sin(angle2) * seg2,
      z: (pip.z || 0) - 0.02
    };
    const tip = {
      x: dip.x - Math.cos(angle3) * seg3 * 0.6,
      y: dip.y - Math.sin(angle3) * seg3,
      z: (dip.z || 0) - 0.02
    };
    lm[mcpIdx + 1] = pip;
    lm[mcpIdx + 2] = dip;
    lm[mcpIdx + 3] = tip;
  }
}

/**
 * Generates canonical 21 landmarks for any static SIBI sign (A-Z or static word)
 */
export function makeStaticSignLandmarks(
  sign: string,
  opts: TransformOptions = {}
): NormalizedLandmark[] {
  const lm = createBasePalm();
  const key = sign.toUpperCase();

  switch (key) {
    case 'A': {
      // 4 fingers curled in fist, thumb upright resting along lateral side of index
      setFingerCurl(lm, 5, 0.92, 0, 1.0);
      setFingerCurl(lm, 9, 0.92, 0, 1.08);
      setFingerCurl(lm, 13, 0.92, 0, 1.0);
      setFingerCurl(lm, 17, 0.92, 0, 0.85);
      lm[3] = { x: 0.39, y: 0.53, z: -0.03 }; // Thumb IP alongside index MCP
      lm[4] = { x: 0.40, y: 0.47, z: -0.035 }; // Thumb TIP upright next to index PIP
      break;
    }

    case 'A_LOOSE': {
      // Realistic webcam fist where curled fingertips sit slightly above MCP line (the exact case that used to misclassify as B!)
      setFingerCurl(lm, 5, 0.80, 0, 1.0);
      setFingerCurl(lm, 9, 0.80, 0, 1.08);
      setFingerCurl(lm, 13, 0.80, 0, 1.0);
      setFingerCurl(lm, 17, 0.80, 0, 0.85);
      lm[3] = { x: 0.39, y: 0.53, z: -0.03 };
      lm[4] = { x: 0.40, y: 0.47, z: -0.035 };
      break;
    }

    case 'B': {
      // 4 fingers straight up and adducted, thumb folded across palm
      setFingerCurl(lm, 5, 0, -0.005, 1.0);
      setFingerCurl(lm, 9, 0, 0, 1.08);
      setFingerCurl(lm, 13, 0, 0.005, 1.0);
      setFingerCurl(lm, 17, 0, 0.01, 0.85);
      lm[3] = { x: 0.44, y: 0.59, z: -0.03 };
      lm[4] = { x: 0.50, y: 0.58, z: -0.035 }; // Thumb tucked across palm
      break;
    }

    case 'C': {
      // Curved fingers and opposing thumb forming open C arc
      // Palm slightly angled so fingers curve left/forward and thumb curves below
      lm[5] = { x: 0.48, y: 0.50, z: -0.01 };
      lm[9] = { x: 0.51, y: 0.49, z: -0.01 };
      lm[13] = { x: 0.54, y: 0.51, z: -0.01 };
      lm[17] = { x: 0.57, y: 0.54, z: -0.01 };

      // Fingers arched into a C top curve (angle at PIP ~ 125 deg)
      lm[6] = { x: 0.46, y: 0.41, z: -0.02 };
      lm[7] = { x: 0.40, y: 0.37, z: -0.03 };
      lm[8] = { x: 0.35, y: 0.40, z: -0.03 };

      lm[10] = { x: 0.49, y: 0.40, z: -0.02 };
      lm[11] = { x: 0.42, y: 0.36, z: -0.03 };
      lm[12] = { x: 0.36, y: 0.39, z: -0.03 };

      lm[14] = { x: 0.52, y: 0.42, z: -0.02 };
      lm[15] = { x: 0.45, y: 0.38, z: -0.03 };
      lm[16] = { x: 0.39, y: 0.41, z: -0.03 };

      lm[18] = { x: 0.55, y: 0.46, z: -0.02 };
      lm[19] = { x: 0.49, y: 0.42, z: -0.03 };
      lm[20] = { x: 0.44, y: 0.45, z: -0.03 };

      // Thumb extended outward forming bottom of C (open gap ~0.12 = 0.60 * palmSize from indexTip)
      lm[2] = { x: 0.43, y: 0.62, z: -0.02 };
      lm[3] = { x: 0.37, y: 0.58, z: -0.03 };
      lm[4] = { x: 0.34, y: 0.52, z: -0.03 };
      break;
    }

    case 'D': {
      // Index straight up, middle/ring/pinky arched so tips touch thumb tip
      setFingerCurl(lm, 5, 0, 0, 1.02);
      // Middle, ring, pinky curved to meet thumb tip at (0.44, 0.50)
      lm[10] = { x: 0.48, y: 0.45, z: -0.02 };
      lm[11] = { x: 0.46, y: 0.48, z: -0.03 };
      lm[12] = { x: 0.44, y: 0.51, z: -0.035 };

      lm[14] = { x: 0.53, y: 0.46, z: -0.02 };
      lm[15] = { x: 0.49, y: 0.49, z: -0.03 };
      lm[16] = { x: 0.46, y: 0.52, z: -0.035 };

      lm[18] = { x: 0.57, y: 0.49, z: -0.02 };
      lm[19] = { x: 0.53, y: 0.52, z: -0.03 };
      lm[20] = { x: 0.49, y: 0.54, z: -0.035 };

      lm[3] = { x: 0.41, y: 0.55, z: -0.03 };
      lm[4] = { x: 0.44, y: 0.51, z: -0.035 }; // Touches middleTip
      break;
    }

    case 'E': {
      // All 4 fingers tightly bent at PIP/DIP with tips resting on upper palm, thumb tucked horizontally underneath tips
      setFingerCurl(lm, 5, 0.95, 0, 1.0);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      // Thumb tucked low across palm underneath all curled fingertips
      lm[3] = { x: 0.44, y: 0.62, z: -0.03 };
      lm[4] = { x: 0.51, y: 0.62, z: -0.03 };
      break;
    }

    case 'F': {
      // Index & thumb tips touch forming circle; middle, ring, pinky straight up
      lm[6] = { x: 0.42, y: 0.47, z: -0.02 };
      lm[7] = { x: 0.40, y: 0.49, z: -0.03 };
      lm[8] = { x: 0.40, y: 0.52, z: -0.035 };
      lm[3] = { x: 0.39, y: 0.56, z: -0.03 };
      lm[4] = { x: 0.40, y: 0.52, z: -0.035 }; // Touches indexTip
      setFingerCurl(lm, 9, 0, 0.01, 1.08);
      setFingerCurl(lm, 13, 0, 0.025, 1.0);
      setFingerCurl(lm, 17, 0, 0.04, 0.85);
      break;
    }

    case 'G': {
      // Index and thumb pointing horizontally sideways (to the left for right hand), middle/ring/pinky curled
      lm[5] = { x: 0.48, y: 0.52, z: -0.01 };
      lm[6] = { x: 0.41, y: 0.52, z: -0.015 };
      lm[7] = { x: 0.35, y: 0.52, z: -0.02 };
      lm[8] = { x: 0.30, y: 0.52, z: -0.025 };

      lm[2] = { x: 0.46, y: 0.59, z: -0.02 };
      lm[3] = { x: 0.39, y: 0.57, z: -0.025 };
      lm[4] = { x: 0.32, y: 0.56, z: -0.03 };

      // Middle, ring, pinky curled inward toward palm (x stays near 0.50..0.54)
      lm[9] = { x: 0.50, y: 0.56, z: -0.01 };
      lm[10] = { x: 0.48, y: 0.57, z: -0.02 };
      lm[11] = { x: 0.50, y: 0.58, z: -0.02 };
      lm[12] = { x: 0.52, y: 0.58, z: -0.015 };

      lm[13] = { x: 0.52, y: 0.60, z: -0.01 };
      lm[14] = { x: 0.50, y: 0.61, z: -0.02 };
      lm[15] = { x: 0.52, y: 0.62, z: -0.02 };
      lm[16] = { x: 0.54, y: 0.62, z: -0.015 };

      lm[17] = { x: 0.54, y: 0.64, z: -0.01 };
      lm[18] = { x: 0.52, y: 0.65, z: -0.02 };
      lm[19] = { x: 0.54, y: 0.66, z: -0.02 };
      lm[20] = { x: 0.55, y: 0.66, z: -0.015 };
      break;
    }

    case 'H': {
      // Index and middle pointing horizontally sideways together, ring/pinky/thumb curled
      lm[5] = { x: 0.48, y: 0.51, z: -0.01 };
      lm[6] = { x: 0.41, y: 0.51, z: -0.015 };
      lm[7] = { x: 0.35, y: 0.51, z: -0.02 };
      lm[8] = { x: 0.29, y: 0.51, z: -0.025 };

      lm[9] = { x: 0.48, y: 0.55, z: -0.01 };
      lm[10] = { x: 0.41, y: 0.55, z: -0.015 };
      lm[11] = { x: 0.34, y: 0.55, z: -0.02 };
      lm[12] = { x: 0.28, y: 0.55, z: -0.025 };

      // Ring, pinky, thumb curled
      lm[13] = { x: 0.52, y: 0.60, z: -0.01 };
      lm[14] = { x: 0.50, y: 0.61, z: -0.02 };
      lm[15] = { x: 0.52, y: 0.62, z: -0.02 };
      lm[16] = { x: 0.54, y: 0.62, z: -0.015 };

      lm[17] = { x: 0.54, y: 0.64, z: -0.01 };
      lm[18] = { x: 0.52, y: 0.65, z: -0.02 };
      lm[19] = { x: 0.54, y: 0.66, z: -0.02 };
      lm[20] = { x: 0.55, y: 0.66, z: -0.015 };

      lm[2] = { x: 0.46, y: 0.60, z: -0.02 };
      lm[3] = { x: 0.48, y: 0.59, z: -0.025 };
      lm[4] = { x: 0.50, y: 0.59, z: -0.025 };
      break;
    }

    case 'I': {
      // Only pinky extended straight up, index/middle/ring curled, thumb tucked across
      setFingerCurl(lm, 5, 0.95, 0, 1.0);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0, 0.01, 0.9);
      lm[3] = { x: 0.43, y: 0.56, z: -0.03 };
      lm[4] = { x: 0.48, y: 0.55, z: -0.035 };
      break;
    }

    case 'K': {
      // Index & middle extended up, thumb extended upward wedged between index and middle PIPs
      setFingerCurl(lm, 5, 0, -0.025, 1.0);
      setFingerCurl(lm, 9, 0, 0.025, 1.06);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[2] = { x: 0.42, y: 0.58, z: -0.025 };
      lm[3] = { x: 0.45, y: 0.51, z: -0.03 };
      lm[4] = { x: 0.465, y: 0.45, z: -0.035 }; // Right between indexPip (0.42,0.475) and middlePip (0.49,0.45)
      break;
    }

    case 'L': {
      // Index straight up, thumb extended 90 deg horizontally outward to the left
      setFingerCurl(lm, 5, 0, 0, 1.02);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[2] = { x: 0.37, y: 0.59, z: -0.02 };
      lm[3] = { x: 0.31, y: 0.57, z: -0.025 };
      lm[4] = { x: 0.25, y: 0.55, z: -0.03 };
      break;
    }

    case 'M': {
      // 3 fingers (index, middle, ring) folded over thumb; thumb tip reaches under ring finger toward pinky
      setFingerCurl(lm, 5, 0.92, 0, 1.0);
      setFingerCurl(lm, 9, 0.92, 0, 1.08);
      setFingerCurl(lm, 13, 0.92, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.48, y: 0.55, z: -0.02 };
      lm[4] = { x: 0.545, y: 0.51, z: -0.03 }; // Under ring finger near ringPip/pinkyMcp
      break;
    }

    case 'N': {
      // 2 fingers (index, middle) folded over thumb; thumb tip sits between middle and ring
      setFingerCurl(lm, 5, 0.92, 0, 1.0);
      setFingerCurl(lm, 9, 0.92, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.45, y: 0.55, z: -0.02 };
      lm[4] = { x: 0.50, y: 0.50, z: -0.03 }; // Under middle finger between middlePip and ringPip
      break;
    }

    case 'O': {
      // All fingertips curved to meet thumb tip forming a closed hollow O circle
      lm[6] = { x: 0.44, y: 0.43, z: -0.02 };
      lm[7] = { x: 0.39, y: 0.43, z: -0.03 };
      lm[8] = { x: 0.37, y: 0.49, z: -0.035 };

      lm[10] = { x: 0.48, y: 0.42, z: -0.02 };
      lm[11] = { x: 0.42, y: 0.42, z: -0.03 };
      lm[12] = { x: 0.38, y: 0.49, z: -0.035 };

      lm[14] = { x: 0.52, y: 0.44, z: -0.02 };
      lm[15] = { x: 0.46, y: 0.44, z: -0.03 };
      lm[16] = { x: 0.40, y: 0.50, z: -0.035 };

      lm[18] = { x: 0.56, y: 0.47, z: -0.02 };
      lm[19] = { x: 0.50, y: 0.47, z: -0.03 };
      lm[20] = { x: 0.43, y: 0.51, z: -0.035 };

      lm[2] = { x: 0.42, y: 0.61, z: -0.02 };
      lm[3] = { x: 0.37, y: 0.56, z: -0.03 };
      lm[4] = { x: 0.37, y: 0.50, z: -0.035 }; // Meets indexTip & middleTip
      break;
    }

    case 'P': {
      // K shape inverted pointing downward (wrist higher, index & middle extended downward)
      lm[0] = { x: 0.50, y: 0.32, z: 0.0 };
      lm[1] = { x: 0.44, y: 0.37, z: -0.02 };
      lm[2] = { x: 0.42, y: 0.43, z: -0.03 };
      lm[5] = { x: 0.44, y: 0.48, z: -0.01 };
      lm[9] = { x: 0.49, y: 0.49, z: -0.01 };
      lm[13] = { x: 0.54, y: 0.48, z: -0.01 };
      lm[17] = { x: 0.58, y: 0.45, z: -0.01 };

      // Index & middle extended downward
      lm[6] = { x: 0.43, y: 0.55, z: -0.015 };
      lm[7] = { x: 0.42, y: 0.61, z: -0.02 };
      lm[8] = { x: 0.41, y: 0.66, z: -0.025 };

      lm[10] = { x: 0.49, y: 0.56, z: -0.025 };
      lm[11] = { x: 0.49, y: 0.62, z: -0.035 };
      lm[12] = { x: 0.49, y: 0.67, z: -0.04 };

      // Thumb pointing down between index & middle
      lm[3] = { x: 0.45, y: 0.50, z: -0.03 };
      lm[4] = { x: 0.46, y: 0.56, z: -0.035 };

      // Ring & pinky curled up toward palm
      lm[14] = { x: 0.54, y: 0.51, z: -0.01 };
      lm[15] = { x: 0.53, y: 0.47, z: -0.01 };
      lm[16] = { x: 0.52, y: 0.44, z: -0.01 };

      lm[18] = { x: 0.58, y: 0.48, z: -0.01 };
      lm[19] = { x: 0.57, y: 0.44, z: -0.01 };
      lm[20] = { x: 0.56, y: 0.42, z: -0.01 };
      break;
    }

    case 'Q': {
      // G shape inverted pointing downward (wrist higher, index & thumb pointing downward, middle/ring/pinky curled)
      lm[0] = { x: 0.50, y: 0.32, z: 0.0 };
      lm[1] = { x: 0.43, y: 0.37, z: -0.02 };
      lm[2] = { x: 0.40, y: 0.43, z: -0.03 };
      lm[5] = { x: 0.45, y: 0.48, z: -0.01 };
      lm[9] = { x: 0.50, y: 0.49, z: -0.01 };
      lm[13] = { x: 0.54, y: 0.48, z: -0.01 };
      lm[17] = { x: 0.58, y: 0.45, z: -0.01 };

      // Index pointing downward
      lm[6] = { x: 0.45, y: 0.55, z: -0.015 };
      lm[7] = { x: 0.45, y: 0.61, z: -0.02 };
      lm[8] = { x: 0.45, y: 0.67, z: -0.025 };

      // Thumb pointing downward parallel to index
      lm[3] = { x: 0.40, y: 0.51, z: -0.03 };
      lm[4] = { x: 0.41, y: 0.60, z: -0.035 };

      // Middle, ring, pinky curled toward palm
      lm[10] = { x: 0.50, y: 0.51, z: -0.01 };
      lm[11] = { x: 0.50, y: 0.47, z: -0.01 };
      lm[12] = { x: 0.50, y: 0.44, z: -0.01 };

      lm[14] = { x: 0.54, y: 0.50, z: -0.01 };
      lm[15] = { x: 0.53, y: 0.46, z: -0.01 };
      lm[16] = { x: 0.52, y: 0.43, z: -0.01 };

      lm[18] = { x: 0.58, y: 0.47, z: -0.01 };
      lm[19] = { x: 0.57, y: 0.43, z: -0.01 };
      lm[20] = { x: 0.56, y: 0.41, z: -0.01 };
      break;
    }

    case 'R': {
      // Index & middle extended straight up and crossed over each other
      setFingerCurl(lm, 5, 0, 0, 1.0);
      setFingerCurl(lm, 9, 0, 0, 1.06);
      // Cross the tips: indexTip moves right of middleTip
      lm[6] = { x: 0.45, y: 0.47, z: -0.015 };
      lm[7] = { x: 0.47, y: 0.42, z: -0.02 };
      lm[8] = { x: 0.485, y: 0.38, z: -0.025 };

      lm[10] = { x: 0.47, y: 0.45, z: -0.02 };
      lm[11] = { x: 0.46, y: 0.40, z: -0.025 };
      lm[12] = { x: 0.45, y: 0.36, z: -0.03 };

      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.44, y: 0.57, z: -0.03 };
      lm[4] = { x: 0.49, y: 0.55, z: -0.035 };
      break;
    }

    case 'S': {
      // Fist with thumb bent horizontally in front across index/middle fingers
      setFingerCurl(lm, 5, 0.95, 0, 1.0);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.43, y: 0.54, z: -0.04 };
      lm[4] = { x: 0.48, y: 0.52, z: -0.045 }; // Across front of middle PIP/DIP
      break;
    }

    case 'T': {
      // Fist with thumb tucked between index and middle fingers, protruding up near MCP/PIP gap
      setFingerCurl(lm, 5, 0.92, 0, 1.0);
      setFingerCurl(lm, 9, 0.92, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.43, y: 0.55, z: -0.03 };
      lm[4] = { x: 0.455, y: 0.485, z: -0.035 }; // Between indexMcp(0.43) and middleMcp(0.48), above MCP line
      break;
    }

    case 'U': {
      // Index & middle straight up, parallel and touching without gap; thumb across palm
      setFingerCurl(lm, 5, 0, 0.01, 1.0);
      setFingerCurl(lm, 9, 0, -0.01, 1.04);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.44, y: 0.58, z: -0.03 };
      lm[4] = { x: 0.50, y: 0.56, z: -0.035 };
      break;
    }

    case 'V': {
      // Index & middle straight up and spread apart in a V
      setFingerCurl(lm, 5, 0, -0.045, 1.0);
      setFingerCurl(lm, 9, 0, 0.045, 1.06);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.44, y: 0.58, z: -0.03 };
      lm[4] = { x: 0.50, y: 0.56, z: -0.035 };
      break;
    }

    case 'W': {
      // Index, middle, ring straight up and spread; pinky curled, thumb holds pinky
      setFingerCurl(lm, 5, 0, -0.04, 1.0);
      setFingerCurl(lm, 9, 0, 0.0, 1.08);
      setFingerCurl(lm, 13, 0, 0.04, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.46, y: 0.58, z: -0.03 };
      lm[4] = { x: 0.54, y: 0.57, z: -0.035 };
      break;
    }

    case 'X': {
      // Index lifted at MCP but hooked/bent at PIP & DIP; middle, ring, pinky curled
      lm[6] = { x: 0.43, y: 0.46, z: -0.02 }; // Index PIP high
      lm[7] = { x: 0.43, y: 0.44, z: -0.05 }; // Index DIP bent forward
      lm[8] = { x: 0.43, y: 0.49, z: -0.06 }; // Index TIP hooked down (angle at PIP ~ 85 deg)
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[3] = { x: 0.43, y: 0.57, z: -0.03 };
      lm[4] = { x: 0.47, y: 0.55, z: -0.035 };
      break;
    }

    case 'Y': {
      // Thumb & pinky stretched wide out, index/middle/ring curled
      setFingerCurl(lm, 5, 0.95, 0, 1.0);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0, 0.06, 0.95);
      lm[2] = { x: 0.37, y: 0.59, z: -0.02 };
      lm[3] = { x: 0.31, y: 0.55, z: -0.025 };
      lm[4] = { x: 0.25, y: 0.51, z: -0.03 };
      break;
    }

    case 'SAYANG': {
      // ILY: Thumb, index, pinky extended, middle & ring tightly curled
      setFingerCurl(lm, 5, 0, -0.02, 1.02);
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0, 0.05, 0.95);
      lm[2] = { x: 0.37, y: 0.59, z: -0.02 };
      lm[3] = { x: 0.31, y: 0.55, z: -0.025 };
      lm[4] = { x: 0.25, y: 0.51, z: -0.03 };
      break;
    }

    case 'BAGUS':
    case 'BAIK': {
      // Thumbs up held high above sideways fist (palm turned sideways, thumb pointing high to ceiling)
      lm[0] = { x: 0.52, y: 0.65, z: 0.0 };
      lm[1] = { x: 0.48, y: 0.57, z: -0.02 };
      lm[2] = { x: 0.46, y: 0.49, z: -0.03 };
      lm[3] = { x: 0.46, y: 0.41, z: -0.035 };
      lm[4] = { x: 0.46, y: 0.33, z: -0.04 }; // Thumb tip high above fist

      // Sideways curled fingers stacked below thumb
      lm[5] = { x: 0.45, y: 0.54, z: -0.01 };
      lm[6] = { x: 0.40, y: 0.54, z: -0.03 };
      lm[7] = { x: 0.44, y: 0.55, z: -0.04 };
      lm[8] = { x: 0.47, y: 0.55, z: -0.02 };

      lm[9] = { x: 0.45, y: 0.58, z: -0.01 };
      lm[10] = { x: 0.40, y: 0.58, z: -0.03 };
      lm[11] = { x: 0.44, y: 0.59, z: -0.04 };
      lm[12] = { x: 0.47, y: 0.59, z: -0.02 };

      lm[13] = { x: 0.46, y: 0.62, z: -0.01 };
      lm[14] = { x: 0.41, y: 0.62, z: -0.03 };
      lm[15] = { x: 0.45, y: 0.63, z: -0.04 };
      lm[16] = { x: 0.48, y: 0.63, z: -0.02 };

      lm[17] = { x: 0.47, y: 0.66, z: -0.01 };
      lm[18] = { x: 0.42, y: 0.66, z: -0.03 };
      lm[19] = { x: 0.46, y: 0.67, z: -0.04 };
      lm[20] = { x: 0.49, y: 0.67, z: -0.02 };
      break;
    }

    case 'SAYA': {
      // Index pointing inward/down toward chest (middle, ring, pinky curled, thumb tucked)
      lm[0] = { x: 0.62, y: 0.64, z: 0.0 };
      lm[5] = { x: 0.52, y: 0.56, z: -0.01 };
      lm[6] = { x: 0.46, y: 0.58, z: 0.01 };
      lm[7] = { x: 0.41, y: 0.60, z: 0.02 };
      lm[8] = { x: 0.36, y: 0.62, z: 0.03 }; // Pointing inward/downward toward chest center

      lm[9] = { x: 0.53, y: 0.60, z: -0.01 };
      lm[10] = { x: 0.52, y: 0.61, z: -0.02 };
      lm[11] = { x: 0.54, y: 0.62, z: -0.02 };
      lm[12] = { x: 0.56, y: 0.62, z: -0.01 };

      lm[13] = { x: 0.54, y: 0.64, z: -0.01 };
      lm[14] = { x: 0.53, y: 0.65, z: -0.02 };
      lm[15] = { x: 0.55, y: 0.66, z: -0.02 };
      lm[16] = { x: 0.57, y: 0.66, z: -0.01 };

      lm[17] = { x: 0.55, y: 0.68, z: -0.01 };
      lm[18] = { x: 0.54, y: 0.69, z: -0.02 };
      lm[19] = { x: 0.56, y: 0.70, z: -0.02 };
      lm[20] = { x: 0.58, y: 0.70, z: -0.01 };

      lm[1] = { x: 0.57, y: 0.58, z: -0.02 };
      lm[2] = { x: 0.54, y: 0.55, z: -0.02 };
      lm[3] = { x: 0.53, y: 0.57, z: -0.02 };
      lm[4] = { x: 0.53, y: 0.59, z: -0.02 };
      break;
    }

    case 'KAMU': {
      // Index pointing straight forward toward camera (large negative z on indexTip relative to indexMcp)
      setFingerCurl(lm, 9, 0.95, 0, 1.08);
      setFingerCurl(lm, 13, 0.95, 0, 1.0);
      setFingerCurl(lm, 17, 0.95, 0, 0.85);
      lm[5] = { x: 0.45, y: 0.54, z: -0.01 };
      lm[6] = { x: 0.45, y: 0.51, z: -0.05 };
      lm[7] = { x: 0.45, y: 0.49, z: -0.09 };
      lm[8] = { x: 0.45, y: 0.47, z: -0.13 }; // Pointing forward at camera (z << mcp.z, small dy)
      lm[3] = { x: 0.43, y: 0.57, z: -0.03 };
      lm[4] = { x: 0.47, y: 0.56, z: -0.035 };
      break;
    }

    default:
      setFingerCurl(lm, 5, 0.92, 0, 1.0);
      setFingerCurl(lm, 9, 0.92, 0, 1.08);
      setFingerCurl(lm, 13, 0.92, 0, 1.0);
      setFingerCurl(lm, 17, 0.92, 0, 0.85);
      break;
  }

  return applyTransform(lm, opts);
}

export function applyTransform(
  landmarks: NormalizedLandmark[],
  opts: TransformOptions = {}
): NormalizedLandmark[] {
  const {
    rotateDeg = 0,
    scale = 1.0,
    translateX = 0,
    translateY = 0,
    mirrorX = false,
    jitter = 0
  } = opts;

  const cx = 0.48;
  const cy = 0.55;
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return landmarks.map((pt, idx) => {
    let x = pt.x - cx;
    let y = pt.y - cy;

    // Scale
    x *= scale;
    y *= scale;

    // Rotate
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;

    let finalX = cx + rx + translateX;
    let finalY = cy + ry + translateY;

    if (mirrorX) {
      finalX = 1.0 - finalX;
    }

    if (jitter > 0) {
      // Deterministic pseudo-random offset per joint index
      const jx = Math.sin(idx * 12.9898 + 78.233) * jitter;
      const jy = Math.cos(idx * 45.164 + 19.13) * jitter;
      finalX += jx;
      finalY += jy;
    }

    return {
      x: finalX,
      y: finalY,
      z: (pt.z || 0) * scale
    };
  });
}
