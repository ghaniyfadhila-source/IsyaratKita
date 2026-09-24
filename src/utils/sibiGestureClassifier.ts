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

  // Helper to determine if a finger is extended:
  // 1. Upward orientation (tip is higher than pip in camera coordinates when hand is raised)
  // 2. Euclidean distance (tip further from wrist than pip and mcp)
  const isFingerExtended = (
    tip: NormalizedLandmark,
    pip: NormalizedLandmark,
    mcp: NormalizedLandmark
  ): boolean => {
    // Upward extension in 2D frame (y axis points down in normalized coordinates)
    const isUpward = wrist.y - tip.y > (wrist.y - pip.y) * 1.02 && tip.y < pip.y;
    // Radial extension away from wrist
    const distTipWrist = calcDistance(tip, wrist);
    const distPipWrist = calcDistance(pip, wrist);
    const distTipMcp = calcDistance(tip, mcp);
    const distPipMcp = calcDistance(pip, mcp);
    const isLongerThanPip = distTipWrist > distPipWrist * 1.04 && distTipMcp > distPipMcp * 0.95;

    return isUpward || isLongerThanPip;
  };

  const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp);
  const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp);
  const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp);
  const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);

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
        requiresVerification: dynamicCandidate.requiresVerification,
        verificationWindowMs: dynamicCandidate.verificationWindowMs,
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
  // RULE 3: 'ILY' / 'SAYANG' (Thumb, Index, Pinky extended, Middle & Ring tightly curled)
  // -------------------------------------------------------------
  else if (
    thumb &&
    index &&
    pinky &&
    !middle &&
    !ring &&
    mode !== 'alphabet' &&
    normDist(indexTip, indexMcp) > 0.82 &&
    normDist(pinkyTip, pinkyMcp) > 0.72 &&
    normDist(indexTip, pinkyTip) > 0.65 &&
    normDist(middleTip, middleMcp) < 0.62 &&
    normDist(ringTip, ringMcp) < 0.62
  ) {
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
      // Only index extended -> 'D' vs 'Saya' vs 'Kamu'
      if (mode !== 'alphabet' && indexTip.y > indexMcp.y + 0.10 * palmSize) {
        // Pointing down / inward towards chest
        bestSign = 'Saya';
        confidence = 94;
        description = 'Jari telunjuk diarahkan menunjuk mantap ke dada sendiri (Saya / Aku)';
        gestureType = 'word';
      } else if (
        mode !== 'alphabet' &&
        typeof indexTip.z === 'number' &&
        typeof indexMcp.z === 'number' &&
        indexTip.z < indexMcp.z - 0.04 &&
        Math.abs(indexTip.y - indexMcp.y) < 0.40 * palmSize
      ) {
        // Pointing straight forward at audience / camera
        bestSign = 'Kamu';
        confidence = 93;
        description = 'Jari telunjuk menunjuk lurus ke arah lawan bicara (Kamu / Anda)';
        gestureType = 'word';
      } else {
        // Normal D (index pointing straight up)
        bestSign = 'D';
        confidence = 95;
        description = 'Telunjuk tegak lurus ke atas, jari lain mengepal (D)';
      }
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
  // RULE 9: 'B' / TELAPAK TERBUKA / 'HALO' (4 or 5 fingers extended)
  // In SIBI: 4 fingers (telunjuk, tengah, manis, kelingking) tegak lurus ke atas
  // rapat satu sama lain, ibu jari melipat di telapak atau terbuka.
  // -------------------------------------------------------------
  else if (
    (index && middle && ring && pinky) ||
    (index && middle && ring && (pinkyTip.y < pinkyPip.y || pinkyTip.y < pinkyMcp.y)) ||
    (index && middle && pinky && (ringTip.y < ringPip.y || ringTip.y < ringMcp.y)) ||
    (index && ring && pinky && (middleTip.y < middlePip.y || middleTip.y < middleMcp.y))
  ) {
    if (mode !== 'alphabet' && wrist.y < 0.38 && indexTip.y < 0.28) {
      bestSign = 'Halo';
      confidence = 94;
      description = 'Telapak tangan tegak terbuka di pelipis (Halo / Salam)';
      gestureType = 'greeting';
    } else if (thumb) {
      bestSign = 'B';
      confidence = 92;
      description = 'Telapak tangan terbuka tegak lurus dengan lima jari terentang (B)';
    } else {
      bestSign = 'B';
      confidence = 96;
      description = 'Empat jari rapat tegak ke atas, ibu jari terlipat di telapak (B)';
    }
  }

  // -------------------------------------------------------------
  // RULE 10: 'O' vs 'C' (Curved Handshapes with open aperture)
  // Evaluated when fingers arch in a curve and thumb forms an open or closed loop
  // -------------------------------------------------------------
  const indexAngle = calcAngle(indexMcp, indexPip, indexTip);
  const middleAngle = calcAngle(middleMcp, middlePip, middleTip);
  const isCurvedFingers = indexAngle < 165 && middleAngle < 165;

  // In 'C' and 'O', the thumb is NOT tucked flat against the side of the fist
  const thumbExtendedFromKnuckle =
    normDist(thumbTip, indexMcp) > 0.46 ||
    normDist(thumbTip, indexPip) > 0.46 ||
    normDist(thumbTip, middleMcp) > 0.48;

  // In 'O', thumb tip meets fingertips to form a closed loop (< 0.34)
  const isClosedLoop = distThumbIndex < 0.34 || (distThumbIndex < 0.38 && distThumbMiddle < 0.38);
  const isHollowCircle = normDist(indexPip, thumbMcp) > 0.35;

  // In 'C', thumb tip and index/middle tips form an open arc (0.30 to 1.35)
  // Fingertips are projected forward into space (not clenched flat into lower palm)
  const isOpenCAperture =
    (distThumbIndex >= 0.30 && distThumbIndex <= 1.35) ||
    (distThumbMiddle >= 0.30 && distThumbMiddle <= 1.35);
  const isFingertipsArchedOut = normDist(indexTip, wrist) > 0.55;

  // Explicit check for 'A' fist so 'A' never triggers 'C'
  // In 'A', the thumb sits snug along the lateral side of the folded index finger
  const isHoldingAFist =
    normDist(thumbTip, indexMcp) <= 0.46 &&
    normDist(thumbTip, indexPip) <= 0.46 &&
    thumbTip.y < indexMcp.y + 0.08;

  if (isCurvedFingers && isClosedLoop && isHollowCircle && thumbExtendedFromKnuckle && !isHoldingAFist) {
    bestSign = 'O';
    confidence = 95;
    description = 'Semua ujung jari dan ibu jari bertemu melingkar membentuk huruf O';
  } else if (
    isCurvedFingers &&
    isOpenCAperture &&
    thumbExtendedFromKnuckle &&
    isFingertipsArchedOut &&
    !isHoldingAFist
  ) {
    bestSign = 'C';
    confidence = 95;
    description = 'Jemari dan ibu jari melengkung setengah lingkaran membentuk huruf C';
  }

  // -------------------------------------------------------------
  // RULE 11: FIST DISAMBIGUATION: 'A' vs 'S' vs 'T' vs 'M' vs 'N' vs 'E'
  // (Fingers 2-5 are curled into palm)
  // -------------------------------------------------------------
  else {
    // Failsafe guard: If fingers are pointing upward towards the ceiling, this is an open hand / 'B'
    const areFingersUpright =
      indexTip.y < indexMcp.y &&
      middleTip.y < middleMcp.y &&
      (wrist.y - middleTip.y) / palmSize > 0.65;

    // 11A. 'T': Thumb inserted between index and middle knuckles of a CLENCHED FIST
    // Crucial: Fingers must be curled down into the palm, NOT pointing up!
    const isFistCurled = indexTip.y >= indexPip.y - 0.05 && middleTip.y >= middlePip.y - 0.05;
    const thumbBetweenIndexMiddle =
      thumbTip.y < indexMcp.y + 0.04 &&
      Math.min(indexMcp.x, middleMcp.x) - 0.02 <= thumbTip.x &&
      thumbTip.x <= Math.max(indexMcp.x, middleMcp.x) + 0.02;

    if (areFingersUpright) {
      bestSign = 'B';
      confidence = 94;
      description = 'Empat jari rapat tegak lurus ke atas, ibu jari terlipat di telapak (B)';
    } else if (thumbBetweenIndexMiddle && isFistCurled) {
      bestSign = 'T';
      confidence = 94;
      description = 'Kepalan tangan dengan ibu jari menyembul di antara telunjuk dan tengah (T)';
    }
    // 11B. 'A' vs 'BAGUS' (Fist with thumb upright along lateral side of index)
    else if (thumb && thumbTip.y < indexMcp.y + 0.10) {
      const thumbVeryHigh = (wrist.y - thumbTip.y) / palmSize > 1.18;
      const thumbIsolated = normDist(thumbTip, indexPip) > 0.72 && normDist(thumbTip, indexMcp) > 0.72;
      const thumbAngleWide = calcAngle(indexMcp, thumbMcp, thumbTip) > 38;

      if (mode === 'words' && thumbVeryHigh && thumbIsolated && thumbAngleWide) {
        bestSign = 'BAGUS';
        confidence = 94;
        description = 'Ibu jari terangkat tinggi tegak ke atas terpisah dari kepalan (Bagus / Baik)';
        gestureType = 'word';
      } else {
        // Standard, robust SIBI 'A'
        bestSign = 'A';
        confidence = 96;
        description = 'Empat jari terlipat mengepal, ibu jari tegak di samping telunjuk (A)';
      }
    }
    // 11C. 'S': Thumb crossed in front across the knuckles of middle/ring
    else if (normDist(thumbTip, middlePip) < 0.40 && thumbTip.y > indexMcp.y - 0.02) {
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

/**
 * Classifies two-handed gestures such as 'Terima Kasih' (Kedua telapak tangan mengatup santun / salam di depan dada).
 */
export function classifyTwoHandSign(
  hand1Landmarks: NormalizedLandmark[],
  hand1Handedness: 'Left' | 'Right',
  hand2Landmarks: NormalizedLandmark[],
  hand2Handedness: 'Left' | 'Right',
  mode: 'all' | 'alphabet' | 'words' = 'all'
): HandGestureResult | null {
  if (mode === 'alphabet') {
    return null; // When strictly spelling alphabet, do not hijack with 2-hand words
  }

  if (!hand1Landmarks || hand1Landmarks.length < 21 || !hand2Landmarks || hand2Landmarks.length < 21) {
    return null;
  }

  const wrist1 = hand1Landmarks[0];
  const wrist2 = hand2Landmarks[0];
  const middleMcp1 = hand1Landmarks[9];
  const middleMcp2 = hand2Landmarks[9];
  const middleTip1 = hand1Landmarks[12];
  const middleTip2 = hand2Landmarks[12];
  const indexTip1 = hand1Landmarks[8];
  const indexTip2 = hand2Landmarks[8];

  const palm1 = Math.max(0.01, calcDistance(wrist1, middleMcp1));
  const palm2 = Math.max(0.01, calcDistance(wrist2, middleMcp2));
  const avgPalm = (palm1 + palm2) / 2;

  // Key distances between the two hands
  const distWrists = calcDistance(wrist1, wrist2) / avgPalm;
  const distPalms = calcDistance(middleMcp1, middleMcp2) / avgPalm;
  const distMiddleTips = calcDistance(middleTip1, middleTip2) / avgPalm;

  // Finger extensions on both hands
  const states1 = evaluateFingerStates(hand1Landmarks);
  const states2 = evaluateFingerStates(hand2Landmarks);

  const fingersUp1 = middleTip1.y < wrist1.y && indexTip1.y < wrist1.y;
  const fingersUp2 = middleTip2.y < wrist2.y && indexTip2.y < wrist2.y;

  // 1. NAMA (Kedua tangan membentuk huruf H saling menyilang / mengetuk)
  const isH1 = states1.index && states1.middle && !states1.ring && !states1.pinky;
  const isH2 = states2.index && states2.middle && !states2.ring && !states2.pinky;
  const areHTipsClose = distMiddleTips < 2.4 || calcDistance(middleTip1, middleTip2) < 0.36;

  if (isH1 && isH2 && areHTipsClose) {
    return {
      letter: 'Nama',
      confidence: 96,
      label: 'SIBI Nama (2 Tangan)',
      fingerStates: states1,
      description: 'Kedua tangan membentuk huruf H saling menyilang mengetuk di depan dada (Nama)',
      handedness: 'Right',
      gestureType: 'word',
      isTwoHanded: true,
      twoHandsDetected: true,
      requiresVerification: true,
      verificationWindowMs: 400
    };
  }

  // 2. TOLONG (Satu telapak tangan bertumpuk di atas telapak lainnya saling menopang)
  const isVerticalStacked = Math.abs(wrist1.y - wrist2.y) > 0.06 && Math.abs(wrist1.y - wrist2.y) < 0.34;
  const areStackedPalmsClose = distPalms < 2.0 || calcDistance(middleMcp1, middleMcp2) < 0.28;
  const isStackOpen = (states1.index || states1.middle) && (states2.index || states2.middle);

  if (isVerticalStacked && areStackedPalmsClose && isStackOpen) {
    return {
      letter: 'Tolong',
      confidence: 95,
      label: 'SIBI Tolong (2 Tangan)',
      fingerStates: states1,
      description: 'Satu tangan bertumpuk di atas tangan lainnya saling menopang (Tolong)',
      handedness: 'Right',
      gestureType: 'word',
      isTwoHanded: true,
      twoHandsDetected: true,
      requiresVerification: true,
      verificationWindowMs: 420
    };
  }

  // 3. TERIMA KASIH (Dua telapak tangan santun mengatup / merapat di depan dada - Salam / Terima Kasih)
  const arePalmsClose = distPalms < 2.2 || calcDistance(middleMcp1, middleMcp2) < 0.32;
  const areWristsClose = distWrists < 2.6 || calcDistance(wrist1, wrist2) < 0.36;
  const areFingertipsClose = distMiddleTips < 2.2 || calcDistance(middleTip1, middleTip2) < 0.32;

  const hasOpenFingers1 = states1.index && states1.middle;
  const hasOpenFingers2 = states2.index && states2.middle;

  if (arePalmsClose && areWristsClose && fingersUp1 && fingersUp2 && (hasOpenFingers1 || hasOpenFingers2)) {
    return {
      letter: 'Terima Kasih',
      confidence: 97,
      label: 'SIBI Terima Kasih (2 Tangan Mengatup)',
      fingerStates: states1,
      description: 'Kedua telapak tangan santun mengatup di depan dada (Salam / Terima Kasih)',
      handedness: 'Right',
      gestureType: 'greeting',
      isTwoHanded: true,
      twoHandsDetected: true,
      requiresVerification: true,
      verificationWindowMs: 400
    };
  }

  // 4. SAMA-SAMA vs TERIMA KASIH TERBUKA
  // Kedua tangan terbuka sejajar setinggi dada
  const areHandsParallel = Math.abs(wrist1.y - wrist2.y) < 0.22;
  const bothHandsOpen =
    states1.index && states1.middle && (states1.ring || states1.pinky) &&
    states2.index && states2.middle && (states2.ring || states2.pinky);

  if (areHandsParallel && bothHandsOpen && fingersUp1 && fingersUp2) {
    // If hands are held open separated comfortably at chest height -> Sama-sama
    if (distPalms > 1.6 && distPalms < 4.2) {
      return {
        letter: 'Sama-sama',
        confidence: 94,
        label: 'SIBI Sama-sama (2 Tangan Terbuka)',
        fingerStates: states1,
        description: 'Kedua telapak tangan terbuka santun setinggi dada (Sama-sama)',
        handedness: 'Right',
        gestureType: 'greeting',
        isTwoHanded: true,
        twoHandsDetected: true,
        requiresVerification: true,
        verificationWindowMs: 420
      };
    }

    // If hands are close together giving gratitude
    return {
      letter: 'Terima Kasih',
      confidence: 94,
      label: 'SIBI Terima Kasih (2 Tangan)',
      fingerStates: states1,
      description: 'Kedua telapak tangan terbuka sejajar memberi penghormatan (Terima Kasih)',
      handedness: 'Right',
      gestureType: 'greeting',
      isTwoHanded: true,
      twoHandsDetected: true,
      requiresVerification: true,
      verificationWindowMs: 420
    };
  }

  return null;
}
