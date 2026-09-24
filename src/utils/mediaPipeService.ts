import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { NormalizedLandmark } from '../types';

export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // Index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // Middle finger
  [9, 10],
  [10, 11],
  [11, 12],
  // Ring finger
  [13, 14],
  [14, 15],
  [15, 16],
  // Pinky finger
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // Palm connections
  [5, 9],
  [9, 13],
  [13, 17]
];

let landmarkerInstance: HandLandmarker | null = null;
let isInitializing = false;
let initPromise: Promise<HandLandmarker> | null = null;

/**
 * Initializes or returns the cached MediaPipe HandLandmarker instance.
 */
export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarkerInstance) {
    return landmarkerInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      return landmarkerInstance;
    } catch (err) {
      console.warn('GPU delegate failed or CDN wasm issue, attempting CPU fallback:', err);
      // Fallback with CPU
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numHands: 2
      });

      return landmarkerInstance;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

export interface HandDrawItem {
  landmarks: NormalizedLandmark[];
  label?: string;
  confidence?: number;
  handedness?: 'Left' | 'Right';
  trail?: { x: number; y: number }[];
  isDynamic?: boolean;
}

/**
 * Renders an individual hand's landmarks and skeleton onto the canvas
 */
function drawSingleHand(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  isMirrored: boolean = true,
  detectedSign?: string,
  confidence?: number,
  trail?: { x: number; y: number }[],
  isDynamic?: boolean,
  handedness?: 'Left' | 'Right'
) {
  // 0. Draw Motion Trail (Air drawing & dynamic trajectory)
  if (trail && trail.length > 1) {
    ctx.save();
    const trailColor = isDynamic ? '#f59e0b' : '#38bdf8';
    const shadowColor = isDynamic ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.8)';

    ctx.shadowBlur = 10;
    ctx.shadowColor = shadowColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw individual segments with fading opacity from tail to head
    for (let i = 1; i < trail.length; i++) {
      const pPrev = trail[i - 1];
      const pCurr = trail[i];
      const alpha = Math.max(0.15, (i / trail.length) * 0.95);
      const strokeW = Math.max(2.5, (i / trail.length) * (isDynamic ? 6.5 : 5.0));

      const x1 = isMirrored ? (1 - pPrev.x) * width : pPrev.x * width;
      const y1 = pPrev.y * height;
      const x2 = isMirrored ? (1 - pCurr.x) * width : pCurr.x * width;
      const y2 = pCurr.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isDynamic
        ? `rgba(245, 158, 11, ${alpha})`
        : `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = strokeW;
      ctx.stroke();
    }

    // Draw glowing head dot at the latest point
    const head = trail[trail.length - 1];
    const headX = isMirrored ? (1 - head.x) * width : head.x * width;
    const headY = head.y * height;

    ctx.beginPath();
    ctx.arc(headX, headY, isDynamic ? 6 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = trailColor;
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.restore();
  }

  if (!landmarks || landmarks.length < 21) return;

  // Compute pixel coordinates
  const points = landmarks.map((lm) => {
    const x = isMirrored ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    return { x, y, z: lm.z || 0 };
  });

  // Calculate bounding box for the hand
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  points.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  const pad = 16;
  const bboxX = Math.max(0, minX - pad);
  const bboxY = Math.max(0, minY - pad);
  const bboxW = Math.min(width - bboxX, maxX - minX + pad * 2);
  const bboxH = Math.min(height - bboxY, maxY - minY + pad * 2);

  // 1. Draw subtle bounding box with corner guides
  ctx.strokeStyle = handedness === 'Left' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(20, 184, 166, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bboxX, bboxY, bboxW, bboxH);
  ctx.setLineDash([]);

  // 2. Draw Skeleton Connections
  ctx.strokeStyle = handedness === 'Left' ? '#0284c7' : '#0d9488'; // Blue for left, Teal for right
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  HAND_CONNECTIONS.forEach(([i, j]) => {
    const p1 = points[i];
    const p2 = points[j];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // Glow line overlay for index finger & thumb (key discriminators)
  ctx.strokeStyle = handedness === 'Left' ? 'rgba(56, 189, 248, 0.75)' : 'rgba(45, 212, 191, 0.75)';
  ctx.lineWidth = 2;
  [
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4]
  ].forEach(([i, j]) => {
    const p1 = points[i];
    const p2 = points[j];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // 3. Draw Landmark Nodes
  points.forEach((pt, idx) => {
    const isFingertip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
    const isWrist = idx === 0;

    ctx.beginPath();
    if (isFingertip) {
      // Glow outer
      ctx.arc(pt.x, pt.y, 6.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b'; // Amber 500
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    } else if (isWrist) {
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = handedness === 'Left' ? '#0369a1' : '#0f766e';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    } else {
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = handedness === 'Left' ? '#38bdf8' : '#2dd4bf';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#042f2e';
      ctx.stroke();
    }
  });

  // 4. Floating Badge over Bounding Box
  if (detectedSign) {
    const handLabel = handedness ? ` (${handedness === 'Left' ? 'Kiri' : 'Kanan'})` : '';
    const tagText = `${detectedSign} ${confidence ? `${confidence}%` : ''}${handLabel}`;
    ctx.font = 'bold 11px monospace';
    const textWidth = ctx.measureText(tagText).width;
    const tagW = textWidth + 16;
    const tagH = 22;
    const tagX = Math.max(10, Math.min(width - tagW - 10, bboxX));
    const tagY = Math.max(10, bboxY - tagH - 6);

    // Pill background
    ctx.fillStyle = isDynamic ? 'rgba(217, 119, 6, 0.95)' : 'rgba(13, 148, 136, 0.9)';
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 6);
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, tagX + 8, tagY + 15);
  }
}

/**
 * Renders multiple hands (1 or 2 hands) onto the canvas overlay
 */
export function drawMultipleHands(
  ctx: CanvasRenderingContext2D,
  hands: HandDrawItem[],
  width: number,
  height: number,
  isMirrored: boolean = true,
  twoHandBanner?: string
): void {
  ctx.clearRect(0, 0, width, height);

  if (!hands || hands.length === 0) return;

  // Render each hand's skeleton
  hands.forEach((hand) => {
    drawSingleHand(
      ctx,
      hand.landmarks,
      width,
      height,
      isMirrored,
      hand.label,
      hand.confidence,
      hand.trail,
      hand.isDynamic,
      hand.handedness
    );
  });

  // If two hands present and banner provided, render top center banner
  if (twoHandBanner) {
    ctx.save();
    ctx.font = 'bold 13px system-ui, sans-serif';
    const textWidth = ctx.measureText(twoHandBanner).width;
    const bannerW = textWidth + 28;
    const bannerH = 28;
    const bannerX = (width - bannerW) / 2;
    const bannerY = 16;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2dd4bf';
    ctx.fillText(twoHandBanner, bannerX + 14, bannerY + 19);
    ctx.restore();
  }
}

/**
 * Backwards-compatible single-hand drawer
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  isMirrored = true,
  detectedSign?: string,
  confidence?: number,
  trail?: { x: number; y: number }[],
  isDynamic?: boolean,
  handedness?: 'Left' | 'Right'
) {
  drawMultipleHands(
    ctx,
    [
      {
        landmarks,
        label: detectedSign,
        confidence,
        trail,
        isDynamic,
        handedness
      }
    ],
    width,
    height,
    isMirrored
  );
}
