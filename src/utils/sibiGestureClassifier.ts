import { NormalizedLandmark, HandGestureResult, FingerStates } from '../types';
import { getMotionTrackerForHand } from './motionTracker';

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
 * Calculates 2D Euclidean distance in the camera XY plane
 */
export function calcDistance2D(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates angle between three points (vertex is p2) in degrees [0, 180]
 */
export function calcAngle(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark,
  p3: NormalizedLandmark
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: (p1.z || 0) - (p2.z || 0) };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: (p3.z || 0) - (p2.z || 0) };
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  if (mag1 * mag2 === 0) return 0;
  const rad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return (rad * 180) / Math.PI;
}

/**
 * Determines individual finger states (extended vs curled) from 21 MediaPipe landmarks.
 * Uses orientation-invariant joint angles + relative extension ratios so tilted,
 * horizontal (G/H), or downward (P/Q) hands are evaluated accurately without false positives on fists.
 */
export function evaluateFingerStates(landmarks: NormalizedLandmark[]): FingerStates {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false };
  }

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
  const ringDip = landmarks[15];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyDip = landmarks[19];
  const pinkyTip = landmarks[20];

  const isFingerExtended = (
    mcp: NormalizedLandmark,
    pip: NormalizedLandmark,
    dip: NormalizedLandmark,
    tip: NormalizedLandmark
  ): boolean => {
    const angleMcpPipTip = calcAngle(mcp, pip, tip);
    const anglePipDipTip = calcAngle(pip, dip, tip);
    const distTipMcp = calcDistance(tip, mcp);
    const distPipMcp = Math.max(0.001, calcDistance(pip, mcp));
    const distTipWrist = calcDistance(tip, wrist);
    const distPipWrist = calcDistance(pip, wrist);

    // A genuinely extended finger is straight at PIP & DIP and its tip extends well beyond PIP from MCP and wrist
    return (
      angleMcpPipTip > 148 &&
      anglePipDipTip > 140 &&
      distTipMcp > distPipMcp * 1.32 &&
      distTipWrist > distPipWrist * 1.04
    );
  };

  const indexExtended = isFingerExtended(indexMcp, indexPip, indexDip, indexTip);
  const middleExtended = isFingerExtended(middleMcp, middlePip, middleDip, middleTip);
  const ringExtended = isFingerExtended(ringMcp, ringPip, ringDip, ringTip);
  const pinkyExtended = isFingerExtended(pinkyMcp, pinkyPip, pinkyDip, pinkyTip);

  // Thumb extension:
  // Straight at IP joint and extended away from wrist and pinky base
  const thumbAngle = calcAngle(thumbMcp, thumbIp, thumbTip);
  const thumbDistFromWrist = calcDistance(thumbTip, wrist);
  const thumbIpDistFromWrist = calcDistance(thumbIp, wrist);
  const thumbDistFromPinky = calcDistance(thumbTip, pinkyMcp);
  const thumbMcpDistFromPinky = calcDistance(thumbMcp, pinkyMcp);

  const thumbExtended =
    thumbAngle > 135 &&
    thumbDistFromWrist > thumbIpDistFromWrist * 1.06 &&
    thumbDistFromPinky > thumbMcpDistFromPinky * 0.88;

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
function isIndexHooked(
  landmarks: NormalizedLandmark[],
  palmSize: number,
  uUp: { x: number; y: number }
): boolean {
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const indexTip = landmarks[8];
  const middlePip = landmarks[10];

  const angleAtPip = calcAngle(indexMcp, indexPip, indexDip);
  const angleMcpPipTip = calcAngle(indexMcp, indexPip, indexTip);
  const distTipMcp = calcDistance(indexTip, indexMcp) / palmSize;
  const distPipMcp = calcDistance(indexPip, indexMcp) / palmSize;

  const thumbTip = landmarks[4];

  // In 'X', index proximal phalanx (MCP -> PIP) rises above middlePip and thumbTip is below indexPip
  const indexPipUpProj =
    ((indexPip.x - indexMcp.x) * uUp.x + (indexPip.y - indexMcp.y) * uUp.y) / palmSize;
  const indexPipRaised =
    indexPipUpProj > 0.25 &&
    thumbTip.y > indexPip.y &&
    calcDistance(indexPip, wrist) > calcDistance(middlePip, wrist) + 0.08 * palmSize;

  return (
    indexPipRaised &&
    (angleAtPip < 140 || angleMcpPipTip < 135) &&
    distTipMcp > 0.20 &&
    distTipMcp < 0.68 &&
    distPipMcp > 0.28
  );
}

export type DetectionFilterMode = 'all' | 'alphabet' | 'words';

/**
 * Comprehensive SIBI gesture classifier with palm-relative scale-invariant geometry,
 * unified single-chain decision structure, and support for static, dynamic, and word signs.
 */
export function classifySibiSign(
  landmarks: NormalizedLandmark[],
  handedness: 'Left' | 'Right' = 'Right',
  detectionMode: DetectionFilterMode | boolean = 'all',
  now: number = performance.now()
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

  const allowWords = mode !== 'alphabet';

  // Use per-hand motion tracker so two simultaneous hands never corrupt each other
  const tracker = getMotionTrackerForHand(handedness);
  tracker.update(landmarks, now);

  const states = evaluateFingerStates(landmarks);
  const { thumb, index, middle, ring, pinky } = states;

  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];

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

  // Scale normalization factor based on palm size (wrist to middle MCP)
  const palmSize = Math.max(0.01, calcDistance(wrist, middleMcp));
  const normDist = (p1: NormalizedLandmark, p2: NormalizedLandmark) =>
    calcDistance(p1, p2) / palmSize;

  // Palm-aligned basis vectors (2D screen plane) for rotation & mirror invariance:
  // uUp: unit vector from wrist toward middleMcp (up the palm)
  const upDx = middleMcp.x - wrist.x;
  const upDy = middleMcp.y - wrist.y;
  const upLen = Math.max(0.001, Math.hypot(upDx, upDy));
  const uUp = { x: upDx / upLen, y: upDy / upLen };

  // uLat: vector from indexMcp toward pinkyMcp (across the knuckles)
  const latDx = pinkyMcp.x - indexMcp.x;
  const latDy = pinkyMcp.y - indexMcp.y;
  const knuckleWidth = Math.max(0.001, Math.hypot(latDx, latDy));
  const uLat = { x: latDx / knuckleWidth, y: latDy / knuckleWidth };

  // Key relative distances
  const distThumbIndex = normDist(thumbTip, indexTip);
  const distThumbMiddle = normDist(thumbTip, middleTip);
  const distIndexMiddle = normDist(indexTip, middleTip);

  // Vectors for finger orientation in screen space
  const indexVec = { x: indexTip.x - indexMcp.x, y: indexTip.y - indexMcp.y };
  const middleVec = { x: middleTip.x - middleMcp.x, y: middleTip.y - middleMcp.y };

  // Downward orientation: wrist is above the MCPs and fingertips point down toward the floor
  const isHandInvertedDown =
    wrist.y < indexMcp.y && indexTip.y > indexMcp.y + 0.15 * palmSize;
  const isIndexHorizontal = Math.abs(indexVec.x) > Math.abs(indexVec.y) * 0.92;
  const isMiddleHorizontal = Math.abs(middleVec.x) > Math.abs(middleVec.y) * 0.92;

  // -------------------------------------------------------------
  // DYNAMIC MOTION CHECK (Evaluates Z & J in all modes; words when allowWords is true)
  // -------------------------------------------------------------
  const dynamicCandidate = tracker.detectDynamicGesture(states, 'A', now, allowWords);
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
      motionEnergy: tracker.getMotionEnergy()
    };
  }

  let bestSign = 'A';
  let confidence = 85;
  let description = 'Posisi kepalan tangan SIBI';
  let gestureType: 'letter' | 'word' | 'greeting' = 'letter';

  // =====================================================================
  // UNIFIED SINGLE-CHAIN STATIC GESTURE CLASSIFICATION
  // =====================================================================

  // RULE 1: 'Y' (Thumb & Pinky extended wide, index/middle/ring curled)
  if (thumb && pinky && !index && !middle && !ring) {
    bestSign = 'Y';
    confidence = 96;
    description = 'Ibu jari dan kelingking terbuka lebar membentuk huruf Y';
  }

  // RULE 2: 'I' (Only pinky extended, index/middle/ring curled)
  else if (!index && !middle && !ring && pinky) {
    bestSign = 'I';
    confidence = 95;
    description = 'Hanya jari kelingking tegak lurus ke atas (I)';
  }

  // RULE 3: 'SAYANG' / ILY (Thumb, Index, Pinky extended, Middle & Ring curled)
  else if (thumb && index && pinky && !middle && !ring && allowWords) {
    bestSign = 'Sayang';
    confidence = 95;
    description = 'Ibu jari, telunjuk, dan kelingking terbuka (I-Love-You / Sayang)';
    gestureType = 'word';
  }

  // RULE 4: 'F' (Thumb & Index tips touching in a ring, Middle, Ring, Pinky extended)
  else if (!index && middle && ring && pinky && distThumbIndex < 0.35) {
    bestSign = 'F';
    confidence = 95;
    description = 'Ujung ibu jari dan telunjuk bersentuhan membentuk lingkaran, 3 jari tegak (F)';
  }

  // RULE 5: 'B' / 'Halo' (All 4 fingers extended straight up)
  else if (index && middle && ring && pinky) {
    if (allowWords && wrist.y < 0.38 && indexTip.y < 0.28) {
      bestSign = 'Halo';
      confidence = 94;
      description = 'Telapak tangan tegak terbuka di pelipis (Halo / Salam)';
      gestureType = 'greeting';
    } else {
      bestSign = 'B';
      confidence = thumb ? 92 : 96;
      description = 'Empat jari rapat tegak lurus ke atas, ibu jari terlipat di telapak (B)';
    }
  }

  // RULE 6: 'W' (Index, Middle, Ring extended, Pinky curled)
  else if (index && middle && ring && !pinky) {
    bestSign = 'W';
    confidence = 95;
    description = 'Tiga jari (telunjuk, tengah, manis) tegak merenggang membentuk W';
  }

  // RULE 7: 2-FINGER FAMILY ('P', 'H', 'R', 'K', 'V', 'U')
  // (Index and Middle extended, Ring and Pinky curled)
  else if (index && middle && !ring && !pinky) {
    // 7A. Pointing downward -> 'P'
    if (isHandInvertedDown && middleTip.y > middleMcp.y + 0.15 * palmSize) {
      bestSign = 'P';
      confidence = 94;
      description = 'Bentuk huruf K diarahkan menunjuk ke bawah (P)';
    }
    // 7B. Pointing horizontally sideways -> 'H'
    else if (isIndexHorizontal && isMiddleHorizontal) {
      bestSign = 'H';
      confidence = 95;
      description = 'Telunjuk dan jari tengah rapat mengarah horizontal ke samping (H)';
    }
    // 7C. Fingers crossed -> 'R'
    // Invariant check: projection of (middleTip - indexTip) onto lateral axis uLat is negative
    else {
      const tipLatDelta =
        (middleTip.x - indexTip.x) * uLat.x + (middleTip.y - indexTip.y) * uLat.y;
      const isCrossed =
        tipLatDelta < -0.01 * palmSize ||
        (distIndexMiddle < 0.16 &&
          calcDistance(indexTip, middlePip) < calcDistance(indexTip, indexPip));

      if (isCrossed) {
        bestSign = 'R';
        confidence = 94;
        description = 'Jari telunjuk dan jari tengah saling menyilang rapat ke atas (R)';
      }
      // 7D. Thumb wedged upward between index and middle PIPs -> 'K'
      else {
        const thumbUpProj =
          ((thumbTip.x - indexMcp.x) * uUp.x + (thumbTip.y - indexMcp.y) * uUp.y) / palmSize;
        const isThumbBetweenIndexMiddle =
          thumbUpProj > 0.18 &&
          normDist(thumbTip, middlePip) < 0.34 &&
          normDist(thumbTip, indexPip) < 0.42;

        if (isThumbBetweenIndexMiddle) {
          bestSign = 'K';
          confidence = 94;
          description =
            'Telunjuk tegak, jari tengah sedikit maju, ibu jari tegak di antaranya (K)';
        }
        // 7E. Spread apart -> 'V'
        else if (distIndexMiddle > 0.32) {
          bestSign = 'V';
          confidence = 96;
          description = 'Telunjuk dan jari tengah terbuka merenggang membentuk V';
        }
        // 7F. Held together parallel -> 'U'
        else {
          bestSign = 'U';
          confidence = 95;
          description = 'Telunjuk dan jari tengah rapat tegak lurus ke atas tanpa celah (U)';
        }
      }
    }
  }

  // RULE 8: 1-FINGER (INDEX) FAMILY ('Q', 'G', 'L', 'Kamu', 'Saya', 'D')
  // (Only Index extended; Middle, Ring, Pinky curled)
  else if (index && !middle && !ring && !pinky) {
    // 8A. Pointing downward -> 'Q'
    if (isHandInvertedDown) {
      bestSign = 'Q';
      confidence = 94;
      description = 'Capit ibu jari dan telunjuk mengarah tegak lurus ke bawah (Q)';
    }
    // 8B. Pointing forward at camera (foreshortened Z depth) -> 'Kamu'
    else if (
      allowWords &&
      (indexMcp.z || 0) - (indexTip.z || 0) > 0.07 &&
      calcDistance2D(indexTip, indexMcp) / palmSize < 0.55
    ) {
      bestSign = 'Kamu';
      confidence = 93;
      description = 'Jari telunjuk menunjuk lurus ke arah lawan bicara (Kamu / Anda)';
      gestureType = 'word';
    }
    // 8C. Pointing inward/downward toward chest -> 'Saya'
    else if (
      allowWords &&
      indexTip.y > indexMcp.y + 0.12 * palmSize &&
      wrist.y >= indexMcp.y - 0.05 * palmSize
    ) {
      bestSign = 'Saya';
      confidence = 94;
      description = 'Jari telunjuk diarahkan menunjuk mantap ke dada sendiri (Saya / Aku)';
      gestureType = 'word';
    }
    // 8D. Pointing horizontally sideways -> 'G'
    else if (isIndexHorizontal) {
      bestSign = 'G';
      confidence = 94;
      description = 'Telunjuk dan ibu jari mengarah horizontal sejajar ke samping (G)';
    }
    // 8E. Thumb extended laterally at ~90 deg -> 'L' vs thumb touching curled middle -> 'D'
    else {
      const thumbLateralSpread = normDist(thumbTip, indexMcp) > 0.52 && distThumbMiddle > 0.42;
      if (thumb && thumbLateralSpread) {
        bestSign = 'L';
        confidence = 96;
        description = 'Telunjuk tegak ke atas dan ibu jari terbuka 90° membentuk huruf L';
      } else {
        bestSign = 'D';
        confidence = 95;
        description =
          'Telunjuk tegak lurus ke atas, ujung ibu jari menyentuh jari tengah (D)';
      }
    }
  }

  // RULE 9: CURVED & FIST FAMILY ('X', 'O', 'C', 'Bagus', 'A', 'E', 'T', 'N', 'M', 'S')
  // (No fingers fully straight-extended)
  else {
    // 9A. Hooked index finger -> 'X'
    if (isIndexHooked(landmarks, palmSize, uUp)) {
      bestSign = 'X';
      confidence = 93;
      description = 'Jari telunjuk ditekuk melengkung menyerupai kail pancing (X)';
    } else {
      // Check if fingers form an open curved arch ('C' or 'O') vs a closed fist ('A','S','T','M','N','E')
      // In 'C' and 'O', the fingertips arch out in front of the knuckles rather than folding tightly onto the palm
      const indexTipMcpDist = normDist(indexTip, indexMcp);
      const middleTipMcpDist = normDist(middleTip, middleMcp);
      const indexCurveAngle = calcAngle(indexMcp, indexPip, indexTip);
      const middleCurveAngle = calcAngle(middleMcp, middlePip, middleTip);
      const isClosedLoopO =
        distThumbIndex < 0.28 &&
        distThumbMiddle < 0.34 &&
        normDist(indexPip, thumbIp) > 0.42 &&
        middleTipMcpDist > 0.36;

      const areFingersArchedC =
        indexTipMcpDist > 0.42 &&
        middleTipMcpDist > 0.42 &&
        indexCurveAngle >= 75 &&
        indexCurveAngle <= 152 &&
        middleCurveAngle >= 75 &&
        middleCurveAngle <= 152;

      // 9B. 'O' vs 'C'
      if (isClosedLoopO) {
        bestSign = 'O';
        confidence = 95;
        description = 'Semua ujung jari dan ibu jari bertemu melingkar membentuk huruf O';
      } else if (areFingersArchedC) {
        bestSign = 'C';
        confidence = 95;
        description = 'Jemari dan ibu jari melengkung setengah lingkaran membentuk huruf C';
      }
      // 9C. CLOSED FIST DISAMBIGUATION ('Bagus', 'A', 'E', 'T', 'N', 'M', 'S')
      // Using palm-aligned coordinates (tLat, tUp) of thumbTip relative to indexMcp
      else {
        const dThumbX = thumbTip.x - indexMcp.x;
        const dThumbY = thumbTip.y - indexMcp.y;

        // tLat: 0.0 at indexMcp, < 0 on outer thumb side, 0.33 at middleMcp, 0.67 at ringMcp, 1.0 at pinkyMcp
        const tLat = (dThumbX * uLat.x + dThumbY * uLat.y) / knuckleWidth;
        // tUp: height above indexMcp along the palm upward axis (in palmSize units)
        const tUp = (dThumbX * uUp.x + dThumbY * uUp.y) / palmSize;

        // Check for high isolated Thumbs-Up ('Bagus') in words/all mode
        const thumbVeryHigh = tUp > 0.65 && normDist(thumbTip, indexMcp) > 0.80;

        if (allowWords && thumbVeryHigh) {
          bestSign = 'Bagus';
          confidence = 95;
          description =
            'Ibu jari terangkat tinggi tegak ke atas terpisah dari kepalan (Bagus / Baik)';
          gestureType = 'word';
        }
        // 'A': Thumb upright along the outer lateral side of index finger (tLat <= 0.08, tUp > 0.05)
        else if (tLat <= 0.08 && tUp > 0.05) {
          bestSign = 'A';
          confidence = 96;
          description = 'Empat jari terlipat mengepal, ibu jari tegak di samping telunjuk (A)';
        }
        // 'E': Thumb tucked horizontally low on the palm underneath curled fingertips (tUp < -0.15)
        else if (tUp < -0.15) {
          bestSign = 'E';
          confidence = 93;
          description = 'Semua jari tertekuk rapat ke telapak tangan, ibu jari di bawahnya (E)';
        }
        // 'T': Thumb tucked between index (0.0) and middle (0.33), protruding up (tUp > 0.14)
        else if (tLat > 0.08 && tLat <= 0.30 && tUp > 0.14) {
          bestSign = 'T';
          confidence = 94;
          description =
            'Kepalan tangan dengan ibu jari menyembul di antara telunjuk dan tengah (T)';
        }
        // 'N': Thumb tucked under index & middle, sitting between middle (0.33) and ring (0.67)
        else if (tLat > 0.30 && tLat <= 0.62 && tUp > 0.10) {
          bestSign = 'N';
          confidence = 92;
          description =
            'Ibu jari diselipkan di bawah 2 jari (telunjuk dan jari tengah) (N)';
        }
        // 'M': Thumb tucked under 3 fingers (index, middle, ring), reaching past ringMcp (tLat > 0.62)
        else if (tLat > 0.62 && tUp > -0.05) {
          bestSign = 'M';
          confidence = 92;
          description =
            'Ibu jari diselipkan di bawah 3 jari (telunjuk, tengah, manis) (M)';
        }
        // 'S': Thumb bent horizontally across the front of the clenched fingers
        else {
          bestSign = 'S';
          confidence = 93;
          description =
            'Semua jari mengepal rapat, ibu jari melintang di depan jari-jari (S)';
        }
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
    motionTrail: tracker.getActiveTrail(),
    motionEnergy: tracker.getMotionEnergy()
  };
}

/**
 * Classifies two-handed gestures:
 * - 'Nama' (Kedua tangan membentuk huruf H saling menyilang / mengetuk)
 * - 'Tolong' (Satu telapak tangan bertumpuk di atas telapak lainnya)
 * - 'Terima Kasih' (Kedua telapak tangan mengatup rapat di depan dada)
 * - 'Sama-sama' (Kedua telapak tangan terbuka sejajar terpisah setinggi dada)
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

  if (
    !hand1Landmarks ||
    hand1Landmarks.length < 21 ||
    !hand2Landmarks ||
    hand2Landmarks.length < 21
  ) {
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

  const distWrists = calcDistance(wrist1, wrist2) / avgPalm;
  const distPalms = calcDistance(middleMcp1, middleMcp2) / avgPalm;
  const distMiddleTips = calcDistance(middleTip1, middleTip2) / avgPalm;

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

  // 2. TOLONG (Satu telapak tangan bertumpuk vertikal di atas telapak lainnya)
  const verticalWristGap = Math.abs(wrist1.y - wrist2.y) / avgPalm;
  const horizontalPalmGap = Math.abs(middleMcp1.x - middleMcp2.x) / avgPalm;
  const isVerticalStacked = verticalWristGap > 0.35 && verticalWristGap < 1.85;
  const areStackedAligned = horizontalPalmGap < 1.15 && distPalms < 1.85;
  const isStackOpen = (states1.index || states1.middle) && (states2.index || states2.middle);

  if (isVerticalStacked && areStackedAligned && isStackOpen) {
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

  // 3. TERIMA KASIH (Dua telapak tangan santun mengatup rapat di depan dada)
  const arePalmsClasped = distPalms <= 1.35 && distWrists <= 1.65 && distMiddleTips <= 1.5;
  const hasOpenFingers1 = states1.index && states1.middle;
  const hasOpenFingers2 = states2.index && states2.middle;

  if (arePalmsClasped && fingersUp1 && fingersUp2 && hasOpenFingers1 && hasOpenFingers2) {
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

  // 4. SAMA-SAMA (Kedua tangan terbuka sejajar terpisah setinggi dada)
  const areHandsParallel = Math.abs(wrist1.y - wrist2.y) / avgPalm < 0.55;
  const bothHandsOpen =
    states1.index &&
    states1.middle &&
    (states1.ring || states1.pinky) &&
    states2.index &&
    states2.middle &&
    (states2.ring || states2.pinky);

  if (areHandsParallel && bothHandsOpen && fingersUp1 && fingersUp2 && distPalms > 1.35 && distPalms < 4.5) {
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

  return null;
}
