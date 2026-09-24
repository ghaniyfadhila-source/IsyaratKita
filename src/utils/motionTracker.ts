import { NormalizedLandmark, FingerStates } from '../types';

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  time: number;
  speed?: number;
}

export interface DynamicGestureCandidate {
  label: string;
  word: string;
  confidence: number;
  description: string;
  gestureType: 'letter' | 'word' | 'greeting';
  trail: { x: number; y: number }[];
  immediateCommit?: boolean;
  requiresVerification?: boolean;
  verificationWindowMs?: number;
}

/**
 * HandMotionTracker: Real-time scale-invariant trajectory analysis
 * and gesture latching for dynamic Indonesian Sign Language (SIBI).
 */
export class HandMotionTracker {
  private wristHistory: TrajectoryPoint[] = [];
  private indexTipHistory: TrajectoryPoint[] = [];
  private pinkyTipHistory: TrajectoryPoint[] = [];
  private thumbTipHistory: TrajectoryPoint[] = [];
  private currentPalmSize: number = 0.15; // default fallback

  // Active Drawing Trail (for instant visual feedback on canvas)
  private activeDrawTrail: TrajectoryPoint[] = [];

  // Latch State (keeps dynamic detection active and stable on screen for ~1.1s)
  private latchedCandidate: DynamicGestureCandidate | null = null;
  private latchExpiresAt: number = 0;
  private hasTriggeredImmediateCommit: boolean = false;

  // Cooldown per gesture to prevent accidental rapid re-triggers
  private lastTriggerTimes: Record<string, number> = {};

  // Motion energy (0 to 100)
  private currentMotionEnergy: number = 0;

  // Sensitivity multiplier (1.0 = normal, 1.45 = responsive, 1.8 = ultra-responsive)
  private sensitivity: number = 1.45;

  private readonly MAX_HISTORY_LENGTH = 45;
  private readonly MAX_TIME_WINDOW_MS = 1400;

  public setSensitivity(multiplier: number) {
    this.sensitivity = Math.max(0.8, Math.min(2.0, multiplier));
  }

  public getSensitivity(): number {
    return this.sensitivity;
  }

  public getMotionEnergy(): number {
    return Math.round(this.currentMotionEnergy);
  }

  public reset() {
    this.wristHistory = [];
    this.indexTipHistory = [];
    this.pinkyTipHistory = [];
    this.thumbTipHistory = [];
    this.activeDrawTrail = [];
    this.latchedCandidate = null;
    this.latchExpiresAt = 0;
    this.hasTriggeredImmediateCommit = false;
    this.currentMotionEnergy = 0;
  }

  /**
   * Updates landmark tracking history and calculates scale-invariant velocities
   */
  public update(landmarks: NormalizedLandmark[], now: number = performance.now()) {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      return;
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const indexTip = landmarks[8];
    const middleMcp = landmarks[9];
    const pinkyTip = landmarks[20];

    // Compute palm size (wrist to middle MCP distance) as scale reference
    const dxPalm = wrist.x - middleMcp.x;
    const dyPalm = wrist.y - middleMcp.y;
    const dzPalm = (wrist.z || 0) - (middleMcp.z || 0);
    this.currentPalmSize = Math.max(0.04, Math.sqrt(dxPalm * dxPalm + dyPalm * dyPalm + dzPalm * dzPalm));

    // Calculate instantaneous speed of index tip and wrist
    let instSpeed = 0;
    if (this.indexTipHistory.length > 0 && this.wristHistory.length > 0) {
      const prevIndex = this.indexTipHistory[this.indexTipHistory.length - 1];
      const prevWrist = this.wristHistory[this.wristHistory.length - 1];
      const dt = Math.max(1, now - prevWrist.time);
      const dtSec = dt / 1000;

      const dxI = (indexTip.x - prevIndex.x) / this.currentPalmSize;
      const dyI = (indexTip.y - prevIndex.y) / this.currentPalmSize;
      const speedI = Math.sqrt(dxI * dxI + dyI * dyI) / dtSec;

      const dxW = (wrist.x - prevWrist.x) / this.currentPalmSize;
      const dyW = (wrist.y - prevWrist.y) / this.currentPalmSize;
      const speedW = Math.sqrt(dxW * dxW + dyW * dyW) / dtSec;

      instSpeed = Math.max(speedI, speedW);
    }

    // Smooth motion energy (0 - 100 scale)
    const rawEnergy = Math.min(100, instSpeed * 24);
    this.currentMotionEnergy = this.currentMotionEnergy * 0.65 + rawEnergy * 0.35;

    const newPt = (lm: NormalizedLandmark, speed: number = 0): TrajectoryPoint => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      time: now,
      speed
    });

    this.wristHistory.push(newPt(wrist));
    this.indexTipHistory.push(newPt(indexTip, instSpeed));
    this.pinkyTipHistory.push(newPt(pinkyTip));
    this.thumbTipHistory.push(newPt(thumbTip));

    // Maintain active drawing trail when motion is detected
    if (instSpeed > 0.3 || this.currentMotionEnergy > 10) {
      this.activeDrawTrail.push(newPt(indexTip, instSpeed));
    }

    // Prune history older than MAX_TIME_WINDOW_MS
    const cutoffTime = now - this.MAX_TIME_WINDOW_MS;
    while (this.wristHistory.length > 0 && this.wristHistory[0].time < cutoffTime) {
      this.wristHistory.shift();
      this.indexTipHistory.shift();
      this.pinkyTipHistory.shift();
      this.thumbTipHistory.shift();
    }

    // Prune drawing trail older than 800ms
    const trailCutoff = now - 800;
    while (this.activeDrawTrail.length > 0 && this.activeDrawTrail[0].time < trailCutoff) {
      this.activeDrawTrail.shift();
    }

    if (this.wristHistory.length > this.MAX_HISTORY_LENGTH) {
      this.wristHistory.shift();
      this.indexTipHistory.shift();
      this.pinkyTipHistory.shift();
      this.thumbTipHistory.shift();
    }
  }

  /**
   * Returns active motion trail for real-time camera rendering
   */
  public getActiveTrail(): { x: number; y: number }[] {
    // Prefer the active drawing trail if available, otherwise index tip recent points
    if (this.activeDrawTrail.length >= 3) {
      return this.activeDrawTrail.map((p) => ({ x: p.x, y: p.y }));
    }
    if (this.indexTipHistory.length >= 4 && this.currentMotionEnergy > 12) {
      return this.indexTipHistory.slice(-16).map((p) => ({ x: p.x, y: p.y }));
    }
    return [];
  }

  /**
   * Evaluates dynamic gestures with latching to prevent flicker and ensure reliable commit.
   */
  public detectDynamicGesture(
    fingerStates: FingerStates,
    staticSign: string,
    now: number = performance.now()
  ): DynamicGestureCandidate | null {
    // 1. Check if we are currently in a LATCHED state from a recent detection
    if (this.latchedCandidate && now < this.latchExpiresAt) {
      return {
        ...this.latchedCandidate,
        immediateCommit: false,
        requiresVerification: false
      };
    }

    // If latch expired, clear it
    if (this.latchedCandidate && now >= this.latchExpiresAt) {
      this.latchedCandidate = null;
    }

    if (this.wristHistory.length < 6) {
      return null;
    }

    const sens = this.sensitivity;
    const palm = this.currentPalmSize;

    // Dynamic gestures strictly require intentional hand motion.
    // Scale threshold dynamically with user sensitivity so natural movements are caught smoothly.
    const minMotionThreshold = Math.max(5, 11 / sens);
    if (this.currentMotionEnergy < minMotionThreshold) {
      return null;
    }

    const { thumb, index, middle, ring, pinky } = fingerStates;

    // -------------------------------------------------------------
    // GESTURE 1: HURUF 'Z' (Index finger tracing 'Z' zigzag)
    // -------------------------------------------------------------
    // Tolerant: Index extended, ring & pinky curled, middle can be curled or slight
    if (index && !ring && !pinky) {
      const zMatched = this.detectZPattern(this.indexTipHistory, palm, sens);
      if (zMatched && this.canTrigger('Z', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI Z',
            word: 'Z',
            confidence: 95,
            description: 'Goresan telunjuk membentuk pola Z di udara',
            gestureType: 'letter',
            trail: this.indexTipHistory.slice(-24).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 2: HURUF 'J' (Pinky tracing downward curve & hook)
    // -------------------------------------------------------------
    // Tolerant: Pinky extended, index & middle curled, thumb/ring flexible
    if (pinky && !index && !middle) {
      const jMatched = this.detectJPattern(this.pinkyTipHistory, palm, sens);
      if (jMatched && this.canTrigger('J', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI J',
            word: 'J',
            confidence: 94,
            description: 'Kelingking menggores kurva kail J ke bawah melengkung',
            gestureType: 'letter',
            trail: this.pinkyTipHistory.slice(-20).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 3: KATA 'TIDAK' (Index finger wagging side-to-side)
    // -------------------------------------------------------------
    // Tolerant: Index extended, ring & pinky curled
    if (index && !ring && !pinky) {
      const wagMatched = this.detectIndexWag(this.indexTipHistory, this.wristHistory, palm, sens);
      if (wagMatched && this.canTrigger('TIDAK', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI TIDAK',
            word: 'Tidak',
            confidence: 94,
            description: 'Telunjuk menggeleng ke kiri-kanan (Tidak / Bukan)',
            gestureType: 'word',
            trail: this.indexTipHistory.slice(-18).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 4: SAPAAN 'HALO' (Waving open hand side-to-side OR salute at temple)
    // -------------------------------------------------------------
    // Tolerant: Hand open (at least 3 fingers extended)
    const openFingerCount = [index, middle, ring, pinky].filter(Boolean).length;
    if (openFingerCount >= 3) {
      const waveMatched = this.detectWavingMotion(this.wristHistory, palm, sens);
      const saluteMatched = this.detectTempleSalute(this.wristHistory, palm, sens);
      if ((waveMatched || saluteMatched) && this.canTrigger('HALO', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI HALO',
            word: 'Halo',
            confidence: 96,
            description: saluteMatched
              ? 'Telapak terbuka di pelipis bergerak salam ke luar depan (Halo / Salam)'
              : 'Lambaian tangan ramah membuka salam (Halo)',
            gestureType: 'greeting',
            trail: this.wristHistory.slice(-16).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 5: KATA 'YA' (Fist nodding up & down)
    // -------------------------------------------------------------
    // Tolerant: Fingers mostly closed in fist (index/middle/ring/pinky curled)
    if (!index && !middle && !ring && !pinky) {
      const nodMatched = this.detectVerticalNod(this.wristHistory, palm, sens);
      if (nodMatched && this.canTrigger('YA', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI YA',
            word: 'Ya',
            confidence: 93,
            description: 'Kepalan tangan mengangguk ke atas dan ke bawah (Ya / Setuju)',
            gestureType: 'word',
            trail: this.wristHistory.slice(-16).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 6: KATA 'BAGUS' (Thumbs Up / Mantap)
    // -------------------------------------------------------------
    // Must be an active upward thumbs-up gesture, never hijack static 'A'
    if (thumb && !index && !middle && !ring && !pinky && staticSign !== 'A') {
      const thumbMatched = this.detectThumbsUp(this.thumbTipHistory, this.wristHistory, palm, sens);
      if (thumbMatched && this.canTrigger('BAGUS', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI BAGUS',
            word: 'Bagus',
            confidence: 95,
            description: 'Acungan jempol tegak mantap (Bagus / Hebat)',
            gestureType: 'word',
            trail: this.thumbTipHistory.slice(-16).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 7: SAPAAN 'TERIMA KASIH' (Open hand forward/down motion)
    // -------------------------------------------------------------
    if (index && middle && ring) {
      const pushMatched = this.detectForwardPush(this.wristHistory, palm, sens);
      if (pushMatched && this.canTrigger('TERIMA KASIH', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI TERIMA KASIH',
            word: 'Terima Kasih',
            confidence: 93,
            description: 'Telapak tangan bergerak maju mengarah ke lawan bicara (Terima Kasih)',
            gestureType: 'greeting',
            trail: this.wristHistory.slice(-16).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    // -------------------------------------------------------------
    // GESTURE 8: KATA 'MAAF' (Circular fist rubbing motion)
    // -------------------------------------------------------------
    if (!index && !middle && !ring && !pinky) {
      const circleMatched = this.detectCircularRub(this.wristHistory, palm, sens);
      if (circleMatched && this.canTrigger('MAAF', now)) {
        return this.triggerGesture(
          {
            label: 'SIBI MAAF',
            word: 'Maaf',
            confidence: 91,
            description: 'Kepalan tangan bergerak melingkar santun di dada (Maaf)',
            gestureType: 'greeting',
            trail: this.wristHistory.slice(-18).map((p) => ({ x: p.x, y: p.y }))
          },
          now
        );
      }
    }

    return null;
  }

  /**
   * Latches a detected gesture, sets expiration and cooldown
   */
  private triggerGesture(candidate: DynamicGestureCandidate, now: number): DynamicGestureCandidate {
    this.latchedCandidate = candidate;
    this.latchExpiresAt = now + 1400; // Hold steady in UI for 1.4s
    this.hasTriggeredImmediateCommit = false;
    this.lastTriggerTimes[candidate.label] = now;

    // Reset active draw trail after successful gesture trigger
    this.activeDrawTrail = [];

    return {
      ...candidate,
      immediateCommit: false,
      requiresVerification: true,
      verificationWindowMs: 480
    };
  }

  private canTrigger(gestureKey: string, now: number): boolean {
    const last = this.lastTriggerTimes[gestureKey] || 0;
    return now - last > 1300; // 1.3s cooldown between identical dynamic signs
  }

  // =========================================================================
  // SCALE-INVARIANT PATTERN RECOGNITION ALGORITHMS
  // =========================================================================

  /**
   * Z PATTERN:
   * Stroke 1: Horizontal line
   * Stroke 2: Diagonal stroke backward & down
   * Stroke 3: Horizontal line forward
   * Invariant to mirrored camera direction.
   */
  private detectZPattern(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 7) return false;

    // Find bounding box in normalized coordinates relative to palm size
    let minX = pts[0].x, maxX = pts[0].x;
    let minY = pts[0].y, maxY = pts[0].y;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const spanX = (maxX - minX) / palm;
    const spanY = (maxY - minY) / palm;

    // Require natural displacement in both X and Y relative to palm size
    const minSpan = 0.13 / sens;
    if (spanX < minSpan || spanY < minSpan) return false;

    // Check horizontal reversals with adaptive step
    let reversals = 0;
    let lastDir = 0;
    const step = Math.max(1, Math.floor(pts.length / 7));

    for (let i = step; i < pts.length; i += step) {
      const dx = (pts[i].x - pts[i - step].x) / palm;
      if (Math.abs(dx) > 0.028 / sens) {
        const dir = dx > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversals++;
        }
        lastDir = dir;
      }
    }

    // A 'Z' has reversals and overall downward / lowest trajectory progression
    const startY = pts[0].y;
    const endY = pts[pts.length - 1].y;
    const lowestDrop = (maxY - startY) / palm;
    const overallDrop = (endY - startY) / palm;

    const isDownward = lowestDrop > 0.07 / sens || overallDrop > 0.035 / sens;

    return (reversals >= 2 || (reversals >= 1 && spanX > 0.18 / sens)) && isDownward;
  }

  /**
   * J PATTERN:
   * Pinky moves down, then hooks upward/sideways at the bottom.
   */
  private detectJPattern(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 5) return false;

    let maxY = pts[0].y;
    let maxIndex = 0;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].y > maxY) {
        maxY = pts[i].y;
        maxIndex = i;
      }
    }

    // The lowest point (peak of downstroke) must happen in middle-to-late movement
    if (maxIndex < Math.floor(pts.length * 0.2)) return false;

    const startY = pts[0].y;
    const downstroke = (maxY - startY) / palm;
    if (downstroke < 0.09 / sens) return false;

    // After reaching bottom, the hook moves upward or curves sideways
    if (maxIndex < pts.length - 1) {
      const endY = pts[pts.length - 1].y;
      const endX = pts[pts.length - 1].x;
      const lowestX = pts[maxIndex].x;

      const hookUp = (maxY - endY) / palm;
      const hookSide = Math.abs(endX - lowestX) / palm;

      return hookUp > 0.02 / sens || hookSide > 0.025 / sens;
    }

    return true;
  }

  /**
   * TIDAK PATTERN:
   * Index finger tip oscillates left-to-right relative to wrist,
   * while palm is relatively stable.
   */
  private detectIndexWag(
    tipPts: TrajectoryPoint[],
    wristPts: TrajectoryPoint[],
    palm: number,
    sens: number
  ): boolean {
    if (tipPts.length < 6 || wristPts.length < 6) return false;

    // Compute relative X difference (isolates finger swing from body sway)
    const len = Math.min(tipPts.length, wristPts.length);
    let reversals = 0;
    let lastDir = 0;
    let totalRelativeTravel = 0;

    const step = 2;
    for (let i = step; i < len; i += step) {
      const relXCurrent = (tipPts[i].x - wristPts[i].x) / palm;
      const relXPrev = (tipPts[i - step].x - wristPts[i - step].x) / palm;
      const dRelX = relXCurrent - relXPrev;

      totalRelativeTravel += Math.abs(dRelX);

      if (Math.abs(dRelX) > 0.025 / sens) {
        const dir = dRelX > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversals++;
        }
        lastDir = dir;
      }
    }

    // At least 1 clear reversal or multiple gentle swings
    return (reversals >= 1 && totalRelativeTravel > 0.15 / sens) || (reversals >= 2 && totalRelativeTravel > 0.10 / sens);
  }

  /**
   * HALO PATTERN (Waving):
   * Hand / wrist actively oscillates horizontally (waving at least once or twice).
   */
  private detectWavingMotion(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 6) return false;

    let reversals = 0;
    let lastDir = 0;
    let totalX = 0;

    const step = 2;
    for (let i = step; i < pts.length; i += step) {
      const dx = (pts[i].x - pts[i - step].x) / palm;
      totalX += Math.abs(dx);

      if (Math.abs(dx) > 0.026 / sens) {
        const dir = dx > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversals++;
        }
        lastDir = dir;
      }
    }

    return (reversals >= 1 && totalX > 0.16 / sens) || (reversals >= 2 && totalX > 0.12 / sens);
  }

  /**
   * HALO PATTERN (Temple / Forehead Salute):
   * Hand held near temple/forehead and moving smoothly outward/forward.
   */
  private detectTempleSalute(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 6) return false;
    const start = pts[0];
    const end = pts[pts.length - 1];

    // Starts in upper quadrant near face/temple level (y < 0.52)
    const isAtTempleHeight = start.y < 0.52;
    const dx = Math.abs(end.x - start.x) / palm;
    const dz = (end.z - start.z) / palm;

    return isAtTempleHeight && (dx > 0.10 / sens || dz < -0.06 / sens);
  }

  /**
   * YA PATTERN:
   * Fist actively moves up and down (nodding).
   */
  private detectVerticalNod(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 6) return false;

    let reversals = 0;
    let lastDir = 0;
    let totalY = 0;

    const step = 2;
    for (let i = step; i < pts.length; i += step) {
      const dy = (pts[i].y - pts[i - step].y) / palm;
      totalY += Math.abs(dy);

      if (Math.abs(dy) > 0.024 / sens) {
        const dir = dy > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversals++;
        }
        lastDir = dir;
      }
    }

    return (reversals >= 1 && totalY > 0.15 / sens) || (reversals >= 2 && totalY > 0.10 / sens);
  }

  /**
   * BAGUS PATTERN:
   * Requires deliberate upward thrust of the thumb with high vertical elevation.
   * Standard 'A' fist resting or translating will NOT trigger this.
   */
  private detectThumbsUp(
    thumbPts: TrajectoryPoint[],
    wristPts: TrajectoryPoint[],
    palm: number,
    sens: number
  ): boolean {
    if (thumbPts.length < 5 || wristPts.length < 5) return false;
    const latestThumb = thumbPts[thumbPts.length - 1];
    const latestWrist = wristPts[wristPts.length - 1];

    // Must be held with very high vertical elevation (thumb pointing high into the air)
    const verticalElevation = (latestWrist.y - latestThumb.y) / palm;
    const upwardSpeed = thumbPts.length >= 4 ? (thumbPts[0].y - latestThumb.y) / palm : 0;

    return verticalElevation > 1.02 / sens && (upwardSpeed > 0.12 / sens || verticalElevation > 1.25 / sens);
  }

  /**
   * TERIMA KASIH PATTERN:
   * Flat hand moving forward or downward from upper chest/chin.
   */
  private detectForwardPush(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 5) return false;

    const start = pts[0];
    const end = pts[pts.length - 1];

    const dy = (end.y - start.y) / palm;
    const dz = (end.z - start.z) / palm;

    // Movement is forward toward camera / downward forward push
    return dy > 0.08 / sens || dz < -0.06 / sens;
  }

  /**
   * MAAF PATTERN:
   * Circular path in XY plane on chest.
   * Uses monotonic angular accumulation around the trajectory centroid.
   */
  private detectCircularRub(pts: TrajectoryPoint[], palm: number, sens: number): boolean {
    if (pts.length < 6) return false;

    // Compute centroid
    let cx = 0, cy = 0;
    for (const p of pts) {
      cx += p.x;
      cy += p.y;
    }
    cx /= pts.length;
    cy /= pts.length;

    // Compute bounding radius
    let maxRadius = 0;
    for (const p of pts) {
      const r = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) / palm;
      if (r > maxRadius) maxRadius = r;
    }

    // Needs to have a natural circular diameter
    if (maxRadius < 0.05 / sens) return false;

    // Accumulate directional angle change
    let prevAngle = Math.atan2(pts[0].y - cy, pts[0].x - cx);
    let totalAngleDelta = 0;

    for (let i = 1; i < pts.length; i++) {
      const currAngle = Math.atan2(pts[i].y - cy, pts[i].x - cx);
      let diff = currAngle - prevAngle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      totalAngleDelta += diff;
      prevAngle = currAngle;
    }

    // Require at least ~95 degrees of circular trajectory
    return Math.abs(totalAngleDelta) > (1.65 / sens);
  }
}

// Global instance for reuse
export const globalMotionTracker = new HandMotionTracker();
