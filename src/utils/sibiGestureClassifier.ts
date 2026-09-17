import { NormalizedLandmark, HandGestureResult, FingerStates } from '../types';
import { globalMotionTracker } from './motionTracker';

/**
 * Calculates Euclidean distance between two 2D/3D normalized points
 */
export function calcDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates angle between three points (vertex is p2) in degrees [0, 180]
 */
export function calcAngle(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark,
  p3: NormalizedLandmark
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 * mag2 === 0) return 0;
  const rad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return (rad * 180) / Math.PI;
}

/**
 * Determines individual finger states (extended vs curled) from 21 MediaPipe landmarks
 */
export function evaluateFingerStates(landmarks: NormalizedLandmark[]): FingerStates {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  // Scale reference: palm size (wrist to middle MCP)
  const palmSize = Math.max(0.01, calcDistance(wrist, middleMcp));

  // 4 main fingers:
  // Extended if tip distance from wrist is significantly greater than PIP from wrist
  // and tip is well separated from its MCP
  const indexExtended =
    calcDistance(indexTip, wrist) > calcDistance(indexPip, wrist) * 1.12 &&
    calcDistance(indexTip, indexMcp) > calcDistance(indexPip, indexMcp) * 1.05;

  const middleExtended =
    calcDistance(middleTip, wrist) > calcDistance(middlePip, wrist) * 1.12 &&
    calcDistance(middleTip, middleMcp) > calcDistance(middlePip, middleMcp) * 1.05;

  const ringExtended =
    calcDistance(ringTip, wrist) > calcDistance(ringPip, wrist) * 1.12 &&
    calcDistance(ringTip, ringMcp) > calcDistance(ringPip, ringMcp) * 1.05;

  const pinkyExtended =
    calcDistance(pinkyTip, wrist) > calcDistance(pinkyPip, wrist) * 1.12 &&
    calcDistance(pinkyTip, pinkyMcp) > calcDistance(pinkyPip, pinkyMcp) * 1.05;

  // Thumb extension:
  // Check distance away from wrist and outward from pinky/palm base
  const thumbDistFromWrist = calcDistance(thumbTip, wrist);
  const thumbIpDistFromWrist = calcDistance(thumbIp, wrist);
  const thumbDistFromPinky = calcDistance(thumbTip, pinkyMcp);
  const thumbMcpDistFromPinky = calcDistance(thumbMcp, pinkyMcp);

  const thumbExtended =
    thumbDistFromWrist > thumbIpDistFromWrist * 1.08 &&
    thumbDistFromPinky > thumbMcpDistFromPinky * 0.92;

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended
  };
}

/**
 * Checks if index finger is in a hooked/bent shape ('X')
 */
function isIndexHooked(landmarks: NormalizedLandmark[], palmSize: number): boolean {
  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const indexTip = landmarks[8];

  // In 'X', index MCP is extended outward, but PIP-DIP-TIP is bent in a hook
  const angleAtPip = calcAngle(indexMcp, indexPip, indexDip);
  const angleAtDip = calcAngle(indexPip, indexDip, indexTip);
  const distTipMcp = calcDistance(indexTip, indexMcp) / palmSize;
  const distPipMcp = calcDistance(indexPip, indexMcp) / palmSize;

  return angleAtPip < 140 && distTipMcp < 0.68 && distPipMcp > 0.28;
}

export type DetectionFilterMode = 'all' | 'alphabet' | 'words';

/**
 * Comprehensive SIBI gesture classifier with scale-invariant geometry,
 * disambiguation for E/O/M/N/S/T/A/C, H/U/V/K/P/R, Q/G, X, and dynamic motion support.
 */
export function classifySibiSign(
  landmarks: NormalizedLandmark[],
  handedness: 'Left' | 'Right' = 'Right',
  detectionMode: DetectionFilterMode | boolean = 'all'
): HandGestureResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      letter: '?',
      confidence: 0,
      label: 'Tangan tidak terdeteksi',
      fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false }
    };
  }

  // Normalize mode
  const mode: DetectionFilterMode =
    typeof detectionMode === 'boolean'
      ? detectionMode
        ? 'all'
        : 'alphabet'
      : detectionMode;

  const checkDynamic = mode !== 'alphabet';

  // Update motion tracker with current observation
  const now = performance.now();
  globalMotionTracker.update(landmarks, now);

  const states = evaluateFingerStates(landmarks);
  const { thumb, index, middle, ring, pinky } = states;

  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleDip = landmarks[11];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  // Scale normalization factor based on palm size (wrist to middle MCP)
  const palmSize = Math.max(0.01, calcDistance(wrist, middleMcp));

  const normDist = (p1: NormalizedLandmark, p2: NormalizedLandmark) =>
    calcDistance(p1, p2) / palmSize;

  // Key relative distances
  const distThumbIndex = normDist(thumbTip, indexTip);
  const distThumbMiddle = normDist(thumbTip, middleTip);
  const distThumbRing = normDist(thumbTip, ringTip);
  const distThumbPinky = normDist(thumbTip, pinkyTip);
  const distIndexMiddle = normDist(indexTip, middleTip);

  // Vectors for orientation
  const indexVec = { x: indexTip.x - indexMcp.x, y: indexTip.y - indexMcp.y };
  const middleVec = { x: middleTip.x - middleMcp.x, y: middleTip.y - middleMcp.y };
  const isPointingDown = indexTip.y > wrist.y && middleTip.y > wrist.y;
  const isIndexHorizontal = Math.abs(indexVec.x) > Math.abs(indexVec.y) * 0.85;

  let bestSign = 'A';
  let confidence = 80;
  let description = 'Posisi kepalan tangan SIBI';
  let gestureType: 'letter' | 'word' | 'greeting' = 'letter';

  // -------------------------------------------------------------
  // DYNAMIC MOTION CHECK (Only if dynamic checking is active and hand is moving)
  // -------------------------------------------------------------
  if (checkDynamic) {
    const dynamicCandidate = globalMotionTracker.detectDynamicGesture(states, bestSign, now);
    if (dynamicCandidate) {
      return {
        letter: dynamicCandidate.word,
        confidence: dynamicCandidate.confidence,
        label: dynamicCandidate.label,
        fingerStates: states,
        description: dynamicCandidate.description,
        handedness,
        isDynamic: true,
        gestureType: dynamicCandidate.gestureType,
        motionTrail: dynamicCandidate.trail,
        immediateCommit: dynamicCandidate.immediateCommit,
        motionEnergy: globalMotionTracker.getMotionEnergy()
      };
    }
  }

  // -------------------------------------------------------------
  // RULE 1: 'Y' (Hang Loose: Thumb & Pinky extended, middle 3 curled)
  // -------------------------------------------------------------
  if (thumb && pinky && !index && !middle && !ring) {
    bestSign = 'Y';
    confidence = 96;
    description = 'Ibu jari dan kelingking terbuka lebar membentuk huruf Y';
  }

  // -------------------------------------------------------------
  // RULE 2: 'I' vs 'J' (Only pinky extended)
  // -------------------------------------------------------------
  else if (!index && !middle && !ring && pinky) {
    bestSign = 'I';
    confidence = 95;
    description = 'Hanya jari kelingking tegak lurus ke atas (I)';
  }

  // -------------------------------------------------------------
  // RULE 3: 'ILY' / 'SAYANG' (Thumb, Index, Pinky extended)
  // -------------------------------------------------------------
  else if (thumb && index && !middle && !ring && pinky && mode !== 'alphabet') {
    bestSign = 'SAYANG';
    confidence = 94;
    description = 'Ibu jari, telunjuk, dan kelingking terbuka (I-Love-You / Sayang)';
    gestureType = 'word';
  }

  // -------------------------------------------------------------
  // RULE 5: 'L' vs 'G' vs 'Q' (Thumb & Index extended, others curled)
  // -------------------------------------------------------------
  else if (index && !middle && !ring && !pinky) {
    // Check if index is hooked -> 'X'
    if (isIndexHooked(landmarks, palmSize)) {
      bestSign = 'X';
      confidence = 92;
      description = 'Jari telunjuk ditekuk melengkung menyerupai kail pancing (X)';
    }
    // Check if thumb is also extended
    else if (thumb) {
      if (isPointingDown) {
        // Points down -> 'Q'
        bestSign = 'Q';
        confidence = 93;
        description = 'Capit ibu jari dan telunjuk mengarah tegak lurus ke bawah (Q)';
      } else if (isIndexHorizontal) {
        // Points horizontally sideways -> 'G'
        bestSign = 'G';
        confidence = 94;
        description = 'Telunjuk dan ibu jari mengarah horizontal sejajar ke samping (G)';
      } else {
        // Points up at 90 deg -> 'L'
        bestSign = 'L';
        confidence = 96;
        description = 'Telunjuk tegak ke atas dan ibu jari terbuka 90° membentuk huruf L';
      }
    } else {
      // Only index extended -> 'D'
      bestSign = 'D';
      confidence = 93;
      description = 'Telunjuk tegak lurus ke atas, jari lain mengepal (D)';
    }
  }

  // -------------------------------------------------------------
  // RULE 6: 'V' vs 'U' vs 'H' vs 'K' vs 'P' vs 'R'
  // (Index and Middle extended, Ring and Pinky curled)
  // -------------------------------------------------------------
  else if (index && middle && !ring && !pinky) {
    // 6A. Crossed fingers -> 'R'
    // Index and middle fingers cross over each other
    const distIndexMiddleTip = distIndexMiddle;
    const isCrossed =
      (handedness === 'Right' && indexTip.x > middleTip.x) ||
      (handedness === 'Left' && indexTip.x < middleTip.x) ||
      (distIndexMiddleTip < 0.22 && normDist(indexTip, middlePip) < normDist(indexTip, indexPip));

    if (isCrossed) {
      bestSign = 'R';
      confidence = 93;
      description = 'Jari telunjuk dan jari tengah saling menyilang rapat ke atas (R)';
    }
    // 6B. Pointing DOWNWARD -> 'P'
    else if (isPointingDown) {
      bestSign = 'P';
      confidence = 93;
      description = 'Bentuk huruf K diarahkan menunjuk ke bawah (P)';
    }
    // 6C. Pointing HORIZONTALLY -> 'H'
    else if (isIndexHorizontal) {
      bestSign = 'H';
      confidence = 95;
      description = 'Telunjuk dan jari tengah rapat mengarah horizontal ke samping (H)';
    }
    // 6D. Thumb upright between index and middle -> 'K'
    else if (thumb && thumbTip.y < indexMcp.y && normDist(thumbTip, middlePip) < 0.45) {
      bestSign = 'K';
      confidence = 94;
      description = 'Telunjuk tegak, jari tengah sedikit maju, ibu jari tegak di antaranya (K)';
    }
    // 6E. SPREAD apart -> 'V'
    else if (distIndexMiddle > 0.38) {
      bestSign = 'V';
      confidence = 96;
      description = 'Telunjuk dan jari tengah terbuka merenggang membentuk V';
    }
    // 6F. Held TOGETHER straight up -> 'U'
    else {
      bestSign = 'U';
      confidence = 95;
      description = 'Telunjuk dan jari tengah rapat tegak lurus ke atas tanpa celah (U)';
    }
  }

  // -------------------------------------------------------------
  // RULE 7: 'W' (Index, Middle, Ring extended, Pinky curled)
  // -------------------------------------------------------------
  else if (index && middle && ring && !pinky) {
    bestSign = 'W';
    confidence = 95;
    description = 'Tiga jari (telunjuk, tengah, manis) tegak merenggang membentuk W';
  }

  // -------------------------------------------------------------
  // RULE 8: 'F' (Thumb & Index tips touching, other 3 extended)
  // -------------------------------------------------------------
  else if (!index && middle && ring && pinky && distThumbIndex < 0.30) {
    bestSign = 'F';
    confidence = 95;
    description = 'Ujung ibu jari dan telunjuk bersentuhan membentuk lingkaran, 3 jari tegak (F)';
  }

  // -------------------------------------------------------------
  // RULE 9: 'B' / TELAPAK TERBUKA (4 or 5 fingers extended)
  // -------------------------------------------------------------
  else if (index && middle && ring && pinky) {
    if (thumb) {
      bestSign = 'B';
      confidence = 90;
      description = 'Telapak tangan terbuka tegak lurus dengan lima jari terentang';
    } else {
      bestSign = 'B';
      confidence = 96;
      description = 'Empat jari rapat tegak ke atas, ibu jari terlipat di telapak (B)';
    }
  }

  // -------------------------------------------------------------
  // RULE 10: 'C' vs 'O' (Curved Handshapes)
  // -------------------------------------------------------------
  else {
    // Check curvature of fingers for 'C' and 'O'
    const indexAngle = calcAngle(indexMcp, indexPip, indexTip);
    const middleAngle = calcAngle(middleMcp, middlePip, middleTip);
    const isCurvedShape = indexAngle < 155 && middleAngle < 155;

    // In 'O', all fingertips converge tightly to touch thumb tip forming a closed circle
    const isOpenLoop = distThumbIndex < 0.32 && distThumbMiddle < 0.36;
    const isHollowCenter = normDist(indexPip, thumbMcp) > 0.42;

    if (isOpenLoop && isHollowCenter && isCurvedShape) {
      bestSign = 'O';
      confidence = 94;
      description = 'Semua ujung jari dan ibu jari bertemu melingkar membentuk huruf O';
    }
    // In 'C', fingers are curved in an open arc with a substantial gap between thumb and fingertips
    else if (isCurvedShape && distThumbIndex >= 0.35 && distThumbIndex <= 0.85) {
      bestSign = 'C';
      confidence = 92;
      description = 'Jemari dan ibu jari melengkung setengah lingkaran membentuk huruf C';
    }

    // -------------------------------------------------------------
    // RULE 11: FIST DISAMBIGUATION: 'A' vs 'S' vs 'T' vs 'M' vs 'N' vs 'E'
    // (All fingers 2-5 are curled into palm)
    // -------------------------------------------------------------
    else {
      // 11A. 'T': Thumb inserted between index and middle knuckles
      const thumbBetweenIndexMiddle =
        thumbTip.y < indexMcp.y + 0.04 &&
        Math.min(indexMcp.x, middleMcp.x) - 0.02 <= thumbTip.x &&
        thumbTip.x <= Math.max(indexMcp.x, middleMcp.x) + 0.02;

      if (thumbBetweenIndexMiddle) {
        bestSign = 'T';
        confidence = 93;
        description = 'Kepalan tangan dengan ibu jari menyembul di antara telunjuk dan tengah (T)';
      }
      // 11B. 'A' vs 'BAGUS' (Fist with thumb upright along outer lateral side of index)
      else if (thumb && thumbTip.y < indexMcp.y + 0.04) {
        if (mode === 'words' && thumbTip.y < indexMcp.y - 0.08 && normDist(thumbTip, indexPip) > 0.45) {
          bestSign = 'BAGUS';
          confidence = 94;
          description = 'Ibu jari tegak mantap ke atas (Bagus / Baik / Mantap)';
          gestureType = 'word';
        } else {
          bestSign = 'A';
          confidence = 94;
          description = 'Empat jari terlipat mengepal, ibu jari tegak di samping telunjuk (A)';
        }
      }
      // 11C. 'S': Thumb crossed in front across the knuckles of middle/ring
      else if (normDist(thumbTip, middlePip) < 0.38 && thumbTip.y > indexMcp.y - 0.02) {
        bestSign = 'S';
        confidence = 92;
        description = 'Semua jari mengepal rapat, ibu jari melintang di depan jari-jari (S)';
      }
      // 11D. 'M': Thumb tucked under 3 fingers (index, middle, ring)
      else if (normDist(thumbTip, ringPip) < 0.35) {
        bestSign = 'M';
        confidence = 90;
        description = 'Ibu jari diselipkan di bawah 3 jari (telunjuk, tengah, manis) (M)';
      }
      // 11E. 'N': Thumb tucked under 2 fingers (index, middle)
      else if (normDist(thumbTip, middlePip) < 0.40 && thumbTip.x > indexTip.x) {
        bestSign = 'N';
        confidence = 90;
        description = 'Ibu jari diselipkan di bawah 2 jari (telunjuk dan jari tengah) (N)';
      }
      // 11F. 'E': Fingers curled tightly down against palm, thumb tucked underneath
      else {
        bestSign = 'E';
        confidence = 91;
        description = 'Semua jari tertekuk rapat ke telapak tangan, ibu jari di bawahnya (E)';
      }
    }
  }

  return {
    letter: bestSign,
    confidence,
    label: `SIBI ${bestSign}`,
    fingerStates: states,
    description,
    handedness,
    gestureType,
    motionTrail: globalMotionTracker.getActiveTrail(),
    motionEnergy: globalMotionTracker.getMotionEnergy()
  };
}
