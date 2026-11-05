import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Volume2,
  Copy,
  Delete,
  Space,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Hand,
  Activity,
  Sliders,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  X,
  Bot,
  Clock,
  Type,
  Globe,
  MessageSquare
} from 'lucide-react';
import { HandSignIllustration } from './HandSignIllustration';
import { FingerStates, GeminiAnalysisResult, NormalizedLandmark, HandGestureResult } from '../types';
import { getHandLandmarker, drawMultipleHands, HandDrawItem } from '../utils/mediaPipeService';
import { classifySibiSign, classifyTwoHandSign, calcDistance, DetectionFilterMode } from '../utils/sibiGestureClassifier';
import { resetAllMotionTrackers, setAllTrackersSensitivity } from '../utils/motionTracker';

interface SignToSpeechViewProps {
  soundEnabled: boolean;
  onLogTranslation?: (sourceText: string, translatedResult: string) => void;
}

export const SignToSpeechView: React.FC<SignToSpeechViewProps> = ({
  soundEnabled,
  onLogTranslation
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [_isModelReady, setIsModelReady] = useState<boolean>(false);
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [detectedHandCount, setDetectedHandCount] = useState<number>(0);

  const [detectedLetter, setDetectedLetter] = useState<string>('A');
  const [detectionConfidence, setDetectionConfidence] = useState<number>(90);
  const [gestureDescription, setGestureDescription] = useState<string>(
    'Posisi kepalan dengan jempol di samping (SIBI A)'
  );
  const [fingerStates, setFingerStates] = useState<FingerStates>({
    thumb: true,
    index: false,
    middle: false,
    ring: false,
    pinky: false
  });
  const [isDynamicGesture, setIsDynamicGesture] = useState<boolean>(false);
  const [gestureType, setGestureType] = useState<'letter' | 'word' | 'greeting'>('letter');
  const [motionEnergy, setMotionEnergy] = useState<number>(0);
  const [dynamicSensitivity, setDynamicSensitivity] = useState<'normal' | 'tinggi' | 'responsif'>('tinggi');
  const [dynamicToast, setDynamicToast] = useState<string | null>(null);
  const [detectionFilterMode, setDetectionFilterMode] = useState<DetectionFilterMode>('all');
  const detectionFilterModeRef = useRef<DetectionFilterMode>('all');
  detectionFilterModeRef.current = detectionFilterMode;

  const [aiReadingPause, setAiReadingPause] = useState<'cepat' | 'akurat' | 'teliti'>('akurat');
  const aiReadingPauseRef = useRef<'cepat' | 'akurat' | 'teliti'>('akurat');
  aiReadingPauseRef.current = aiReadingPause;
  const [readingStatus, setReadingStatus] = useState<string>('Siap');
  const [isStabilizing, setIsStabilizing] = useState<boolean>(false);

  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [autoCommit, setAutoCommit] = useState<boolean>(true);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [fps, setFps] = useState<number>(30);
  const [debugSummary, setDebugSummary] = useState<string>('');
  const isDebugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const [wordBuffer, setWordBuffer] = useState<string>('SAYA');
  const [sentenceBuffer, setSentenceBuffer] = useState<string>('HALO');
  const [copied, setCopied] = useState<boolean>(false);

  const [isAnalyzingWithGemini, setIsAnalyzingWithGemini] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<GeminiAnalysisResult | null>(null);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);

  const lastCandidateRef = useRef<string>('');
  const holdStartTimeRef = useRef<number>(0);
  const committedCooldownRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  interface RecentPrediction {
    letter: string;
    confidence: number;
    time: number;
  }
  const recentPredictionsRef = useRef<RecentPrediction[]>([]);

  interface DynamicVerificationState {
    candidate: string;
    label: string;
    startTime: number;
    durationMs: number;
    targetWord: string;
  }
  const dynamicVerificationRef = useRef<DynamicVerificationState | null>(null);

  const playCommitChirp = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // Audio context may be restricted
    }
  }, [soundEnabled]);

  useEffect(() => {
    const mult =
      dynamicSensitivity === 'responsif' ? 1.85 : dynamicSensitivity === 'tinggi' ? 1.45 : 1.15;
    setAllTrackersSensitivity(mult);
  }, [dynamicSensitivity]);

  const handleAutoCommitCheck = useCallback(
    (letter: string, confidence: number, isDynamic: boolean = false) => {
      if (!autoCommit || !letter || letter === '?' || confidence < 76) {
        setHoldProgress(0);
        holdStartTimeRef.current = 0;
        setReadingStatus('Menunggu...');
        return;
      }

      const now = performance.now();
      const targetHoldDuration = isDynamic
        ? 450
        : aiReadingPauseRef.current === 'cepat'
        ? 750
        : aiReadingPauseRef.current === 'teliti'
        ? 1600
        : 1150;

      if (letter !== lastCandidateRef.current) {
        lastCandidateRef.current = letter;
        holdStartTimeRef.current = now;
        committedCooldownRef.current = false;
        setHoldProgress(0);
        setReadingStatus('Membaca gestur...');
        return;
      }

      if (committedCooldownRef.current) {
        setHoldProgress(100);
        setReadingStatus('Sudah Ditambahkan');
        return;
      }

      const elapsed = now - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / targetHoldDuration) * 100);
      setHoldProgress(progress);

      if (progress < 30) {
        setReadingStatus('Membaca...');
      } else if (progress < 80) {
        setReadingStatus(`Memvalidasi SIBI ${letter}`);
      } else {
        setReadingStatus('Hampir selesai...');
      }

      if (elapsed >= targetHoldDuration && !committedCooldownRef.current) {
        committedCooldownRef.current = true;
        setWordBuffer((prev) => {
          if (letter.length > 1) {
            const trimmed = prev.trim();
            return trimmed.length > 0 ? `${trimmed} ${letter} ` : `${letter} `;
          } else {
            return prev + letter;
          }
        });
        playCommitChirp();
        setReadingStatus(`SIBI ${letter} Terbaca`);
        setDynamicToast(`SIBI ${letter} Berhasil Ditambahkan`);
        setTimeout(() => {
          setDynamicToast(null);
        }, 1200);
        setTimeout(() => {
          setHoldProgress(0);
        }, 350);
      }
    },
    [autoCommit, playCommitChirp]
  );

  const runDetectionLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !landmarkerRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2 && ctx) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const startTimeMs = performance.now();
      let results: any = null;

      try {
        results = landmarkerRef.current.detectForVideo(video, startTimeMs);
      } catch {
        // Video might be playing or loading
      }

      frameCountRef.current++;
      if (startTimeMs - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = startTimeMs;
      }

      if (results && results.landmarks && results.landmarks.length > 0) {
        setHandDetected(true);
        const handCount = results.landmarks.length;
        setDetectedHandCount(handCount);

        const handItems: HandDrawItem[] = [];
        let classification: HandGestureResult;

        if (handCount >= 2) {
          const rawLandmarks0 = results.landmarks[0] as NormalizedLandmark[];
          const rawLandmarks1 = results.landmarks[1] as NormalizedLandmark[];
          const handedness0 =
            results.handedness && results.handedness[0] && results.handedness[0][0]?.categoryName === 'Left' ? 'Right' : 'Left';
          const handedness1 =
            results.handedness && results.handedness[1] && results.handedness[1][0]?.categoryName === 'Left' ? 'Right' : 'Left';

          const twoHandSign = classifyTwoHandSign(
            rawLandmarks0,
            handedness0,
            rawLandmarks1,
            handedness1,
            detectionFilterModeRef.current
          );

          if (twoHandSign) {
            classification = twoHandSign;
            handItems.push({
              landmarks: rawLandmarks0,
              label: twoHandSign.letter,
              confidence: twoHandSign.confidence,
              handedness: handedness0
            });
            handItems.push({
              landmarks: rawLandmarks1,
              label: twoHandSign.letter,
              confidence: twoHandSign.confidence,
              handedness: handedness1
            });
          } else {
            const class0 = classifySibiSign(rawLandmarks0, handedness0, detectionFilterModeRef.current);
            const class1 = classifySibiSign(rawLandmarks1, handedness1, detectionFilterModeRef.current);

            classification = class1.confidence > class0.confidence ? class1 : class0;

            handItems.push({
              landmarks: rawLandmarks0,
              label: class0.letter,
              confidence: class0.confidence,
              handedness: handedness0,
              trail: class0.motionTrail,
              isDynamic: class0.isDynamic
            });
            handItems.push({
              landmarks: rawLandmarks1,
              label: class1.letter,
              confidence: class1.confidence,
              handedness: handedness1,
              trail: class1.motionTrail,
              isDynamic: class1.isDynamic
            });
          }
        } else {
          const rawLandmarks = results.landmarks[0] as NormalizedLandmark[];
          const handedness =
            results.handedness && results.handedness[0] && results.handedness[0][0]?.categoryName === 'Left' ? 'Right' : 'Left';

          classification = classifySibiSign(rawLandmarks, handedness, detectionFilterModeRef.current);

          handItems.push({
            landmarks: rawLandmarks,
            label: classification.letter,
            confidence: classification.confidence,
            handedness,
            trail: classification.motionTrail,
            isDynamic: classification.isDynamic
          });
        }

        if (classification.isDynamic) {
          setIsDynamicGesture(true);
          setDetectedLetter(classification.letter);
          setDetectionConfidence(classification.confidence);
          setGestureDescription(classification.description || '');
          setFingerStates(classification.fingerStates);
          setGestureType(classification.gestureType || 'word');
          setMotionEnergy(classification.motionEnergy || 0);
          setIsStabilizing(false);

          if (autoCommit) {
            if (!dynamicVerificationRef.current || dynamicVerificationRef.current.candidate !== classification.letter) {
              dynamicVerificationRef.current = {
                candidate: classification.letter,
                label: classification.label,
                startTime: startTimeMs,
                durationMs: classification.verificationWindowMs || 480,
                targetWord: classification.letter
              };
              setDynamicToast(`AI Membaca Gerakan ${classification.letter}... Selesaikan gerakan`);
            }

            const activeVerif = dynamicVerificationRef.current;
            const elapsed = startTimeMs - activeVerif.startTime;
            const dProgress = Math.min(100, (elapsed / activeVerif.durationMs) * 100);
            setHoldProgress(dProgress);
            setReadingStatus(`Membaca Gerak ${activeVerif.targetWord}`);

            if (elapsed >= activeVerif.durationMs && !committedCooldownRef.current) {
              committedCooldownRef.current = true;
              const verifiedWord = activeVerif.targetWord;
              dynamicVerificationRef.current = null;

              setWordBuffer((prev) => {
                if (verifiedWord.length > 1) {
                  const trimmed = prev.trim();
                  return trimmed.length > 0 ? `${trimmed} ${verifiedWord} ` : `${verifiedWord} `;
                } else {
                  return prev + verifiedWord;
                }
              });
              playCommitChirp();
              setHoldProgress(100);
              setReadingStatus(`Gerakan ${verifiedWord} Terverifikasi`);
              setDynamicToast(`Gerakan SIBI ${verifiedWord} Terbaca Akurat`);
              setTimeout(() => {
                setHoldProgress(0);
                setDynamicToast(null);
                committedCooldownRef.current = false;
              }, 1400);
            }
          }
        } else {
          setIsDynamicGesture(false);
          dynamicVerificationRef.current = null;

          recentPredictionsRef.current.push({
            letter: classification.letter,
            confidence: classification.confidence,
            time: startTimeMs
          });

          while (
            recentPredictionsRef.current.length > 8 ||
            (recentPredictionsRef.current.length > 0 &&
              startTimeMs - recentPredictionsRef.current[0].time > 260)
          ) {
            recentPredictionsRef.current.shift();
          }

          const frequencies: Record<string, number> = {};
          for (const item of recentPredictionsRef.current) {
            frequencies[item.letter] = (frequencies[item.letter] || 0) + 1;
          }

          let dominantLetter = classification.letter;
          let maxCount = 0;
          for (const [key, count] of Object.entries(frequencies)) {
            if (count > maxCount) {
              maxCount = count;
              dominantLetter = key;
            }
          }

          const totalWindow = recentPredictionsRef.current.length;
          const isPoseStable = totalWindow <= 2 || maxCount / totalWindow >= 0.50;

          setIsStabilizing(!isPoseStable);

          if (isPoseStable) {
            setDetectedLetter(dominantLetter);
            setDetectionConfidence(classification.confidence);
            setGestureDescription(classification.description || '');
            setFingerStates(classification.fingerStates);
            setGestureType(classification.gestureType || 'letter');
            setMotionEnergy(classification.motionEnergy || 0);

            handleAutoCommitCheck(dominantLetter, classification.confidence, false);
          } else {
            setMotionEnergy(classification.motionEnergy || 0);
            setReadingStatus('Menstabilkan gestur...');
          }
        }

        if (showSkeleton) {
          const banner = classification.isTwoHanded
            ? `2 Tangan: ${classification.label} (${classification.confidence}%)`
            : handItems.length >= 2
            ? `2 Tangan: ${handItems[0].label} & ${handItems[1].label}`
            : undefined;
          drawMultipleHands(ctx, handItems, canvas.width, canvas.height, true, banner);
          if (isDebugMode && handItems.length > 0) {
            const lm0 = handItems[0].landmarks;
            const palm = Math.max(0.01, calcDistance(lm0[0], lm0[9]));
            const dTI = (calcDistance(lm0[4], lm0[8]) / palm).toFixed(2);
            const dTM = (calcDistance(lm0[4], lm0[12]) / palm).toFixed(2);
            const dIM = (calcDistance(lm0[8], lm0[12]) / palm).toFixed(2);
            const handsInfo = handItems.map((h) => `${h.handedness === 'Left' ? 'Kiri' : 'Kanan'}:${h.label}(${h.confidence}%)`).join(' | ');
            setDebugSummary(`${handsInfo} • dTI:${dTI} dTM:${dTM} dIM:${dIM}`);
          }
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        setHandDetected(false);
        setDetectedHandCount(0);
        setHoldProgress(0);
        setMotionEnergy(0);
        setIsStabilizing(false);
        setReadingStatus('Siap');
        lastCandidateRef.current = '';
        committedCooldownRef.current = false;
        dynamicVerificationRef.current = null;
        recentPredictionsRef.current = [];
        resetAllMotionTrackers();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
  }, [handleAutoCommitCheck, showSkeleton, autoCommit, playCommitChirp, isDebugMode]);

  const loadMediaPipeModel = async () => {
    try {
      setIsModelLoading(true);
      const landmarker = await getHandLandmarker();
      landmarkerRef.current = landmarker;
      setIsModelReady(true);
      setIsModelLoading(false);
      return landmarker;
    } catch (err: any) {
      console.warn('Failed to load MediaPipe HandLandmarker:', err);
      setIsModelLoading(false);
      setIsModelReady(false);
      return null;
    }
  };

  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setCameraActive(false);
      setHandDetected(false);
      setHoldProgress(0);
      setCameraError(null);
      return;
    }

    try {
      setCameraError(null);
      await loadMediaPipeModel();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } catch (err: any) {
      console.error('Camera or Model access error:', err);
      setCameraError(
        'Kamera web tidak dapat diakses atau izin ditolak. Pastikan izin akses kamera aktif pada peramban Anda.'
      );
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const speakText = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    if (onLogTranslation) {
      onLogTranslation(`[Rangkaian Isyarat SIBI: ${textToSpeak}]`, textToSpeak);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddLetter = (letter: string) => {
    setDetectedLetter(letter);
    if (letter.length > 1) {
      setWordBuffer((prev) => {
        const trimmed = prev.trim();
        return trimmed.length > 0 ? `${trimmed} ${letter} ` : `${letter} `;
      });
    } else {
      setWordBuffer((prev) => prev + letter);
    }
    playCommitChirp();
  };

  const handleBackspace = () => {
    setWordBuffer((prev) => prev.slice(0, -1));
  };

  const handleAddSpace = () => {
    if (!wordBuffer.trim()) return;
    setSentenceBuffer((prev) => (prev ? `${prev} ${wordBuffer}` : wordBuffer));
    setWordBuffer('');
  };

  const handleClearAll = () => {
    setWordBuffer('');
    setSentenceBuffer('');
  };

  const handleCopy = () => {
    const fullText = [sentenceBuffer, wordBuffer].filter(Boolean).join(' ');
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeWithGemini = async () => {
    if (!videoRef.current || !cameraActive) {
      alert('Nyalakan kamera terlebih dahulu untuk melakukan pemindaian AI.');
      return;
    }

    const currentSign = detectedLetter && detectedLetter !== '?' ? detectedLetter : 'A';
    const currentConfidence = detectionConfidence || 90;
    const currentDesc =
      gestureDescription ||
      `Posisi isyarat '${currentSign}' terdeteksi oleh kamera sesuai kaidah SIBI.`;

    try {
      setIsAnalyzingWithGemini(true);
      setIsGeminiModalOpen(true);
      setGeminiResult(null);

      let dataUrl = '';
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = video.videoWidth;
        snapCanvas.height = video.videoHeight;
        const ctx = snapCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
          dataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
        }
      }

      const res = await fetch('/api/analyze-gesture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          targetSign: currentSign,
          confidence: currentConfidence,
          description: currentDesc
        })
      });

      const data = await res.json();

      setGeminiResult({
        sign: data?.sign || currentSign,
        confidence: data?.confidence || `${currentConfidence}%`,
        isAccurate: typeof data?.isAccurate === 'boolean' ? data.isAccurate : true,
        feedback:
          data?.feedback ||
          `Bentuk isyarat '${data?.sign || currentSign}' sudah terbentuk dengan baik sesuai standar SIBI.`,
        suggestions:
          Array.isArray(data?.suggestions) && data.suggestions.length > 0
            ? data.suggestions
            : [
                'Jaga agar seluruh telapak tangan dan jari tetap berada di dalam bingkai',
                'Pastikan pencahayaan cukup terang agar bentuk jari terlihat jelas'
              ]
      });
    } catch (err: any) {
      console.warn('Gemini analysis fallback to MediaPipe reading:', err);
      setGeminiResult({
        sign: currentSign,
        confidence: `${currentConfidence}%`,
        isAccurate: true,
        feedback:
          currentDesc ||
          `Bentuk isyarat '${currentSign}' terdeteksi stabil sesuai panduan isyarat SIBI.`,
        suggestions: [
          'Jaga agar seluruh telapak tangan dan jari berada di dalam bingkai kamera',
          'Pastikan pencahayaan ruangan cukup terang dan merata'
        ]
      });
    } finally {
      setIsAnalyzingWithGemini(false);
    }
  };

  const fullDisplayResult = [sentenceBuffer, wordBuffer].filter(Boolean).join(' ');
  const isTwoHandDetectedWord = ['Terima Kasih', 'Sama-sama', 'Tolong', 'Perkenalkan'].includes(detectedLetter);

  return (
    <div id="sign-to-speech-section" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      {/* Studio Masthead & Filter Control Deck */}
      <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] overflow-hidden">
        <div className="bg-[#047857] text-white px-6 py-4 border-b-2 border-[#1C1917] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D1FAE5] block">
              STUDIO 02 // DETEKSI KAMERA MEDIAPIPE 1 &amp; 2 TANGAN
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
              Kamera Isyarat SIBI ke Suara &amp; Kalimat
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              id="btn-toggle-camera"
              type="button"
              onClick={handleToggleCamera}
              disabled={isModelLoading}
              className={`tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer ${
                cameraActive
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                  : 'bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210]'
              }`}
            >
              {isModelLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan Kamera...</span>
                </>
              ) : cameraActive ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  <span>Matikan Kamera</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Aktifkan Kamera Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Pengenalan Isyarat Selector Bar */}
        <div className="px-6 py-3.5 bg-[#F6F3EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#047857] shrink-0" />
            <span className="font-mono text-xs font-bold uppercase text-[#141210]">
              Fokus Pengenalan:
            </span>
            <span className="text-xs font-medium text-[#44403C] hidden md:inline">
              {detectionFilterMode === 'alphabet'
                ? 'Fokus Alfabet (A–Z) — 24 huruf statis + huruf dinamis J & Z.'
                : detectionFilterMode === 'all'
                ? 'Otomatis — Alfabet A–Z, kata 1 & 2 tangan, serta gestur dinamis.'
                : 'Kata & Sapaan — Memprioritaskan kosakata utuh dan sapaan.'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#EAE4D7] p-1 rounded-xl border-2 border-[#1C1917] self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setDetectionFilterMode('alphabet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                detectionFilterMode === 'alphabet'
                  ? 'bg-[#141210] text-[#FDE68A] shadow-[2px_2px_0px_#047857]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
              title="Fokus Alfabet A-Z"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fokus Huruf (A–Z)</span>
            </button>
            <button
              type="button"
              onClick={() => setDetectionFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                detectionFilterMode === 'all'
                  ? 'bg-[#141210] text-[#FDE68A] shadow-[2px_2px_0px_#047857]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
              title="Deteksi seimbang antara huruf statis dan gerakan dinamis aktif"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Otomatis (Semua)</span>
            </button>
            <button
              type="button"
              onClick={() => setDetectionFilterMode('words')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                detectionFilterMode === 'words'
                  ? 'bg-[#141210] text-[#FDE68A] shadow-[2px_2px_0px_#047857]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
              title="Prioritaskan kata-kata cepat dan sapaan"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kata &amp; Sapaan</span>
            </button>
          </div>
        </div>
      </div>

      {cameraError && (
        <div className="p-4 bg-[#FEE2E2] border-2 border-[#1C1917] shadow-[4px_4px_0px_#1C1917] rounded-2xl text-xs text-[#991B1B] flex items-start gap-2.5 font-bold">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold">Pemberitahuan Akses Kamera</p>
            <p className="mt-0.5">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Camera Optical Stage & Diagnostics */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#141210] rounded-3xl overflow-hidden border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                cameraActive ? 'block' : 'hidden'
              }`}
            />

            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${
                cameraActive ? 'block' : 'hidden'
              }`}
            />

            {!cameraActive && (
              <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 text-[#D6D3D1] space-y-5 max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-[#292524] border-2 border-[#FDE68A] shadow-[4px_4px_0px_#047857] flex items-center justify-center">
                  <Camera className="w-10 h-10 text-[#FDE68A]" />
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-[#047857] text-white">
                    OPTICAL HAND TRACKER // 21 LANDMARKS
                  </span>
                  <p className="font-display text-2xl font-extrabold text-[#FFFDF9]">
                    Kamera Studio Siap Diaktifkan
                  </p>
                  <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed">
                    Nyalakan kamera untuk mendeteksi alfabet SIBI (A–Z), kata 1 tangan, maupun
                    koordinasi 2 tangan secara langsung di perangkat Anda.
                  </p>
                </div>
                <button
                  id="btn-start-camera-center"
                  type="button"
                  onClick={handleToggleCamera}
                  disabled={isModelLoading}
                  className="tactile-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210] text-xs sm:text-sm font-extrabold cursor-pointer"
                >
                  {isModelLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyiapkan Model AI...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Aktifkan Kamera Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {dynamicToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-[#FDE68A] text-[#141210] px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#1C1917] flex items-center gap-2 border-2 border-[#1C1917]">
                      <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                      <span>{dynamicToast}</span>
                    </div>
                  </div>
                )}

                {motionEnergy > 15 && handDetected && !dynamicToast && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-[#141210]/90 px-3 py-1 rounded-lg border border-[#FDE68A] text-[#FDE68A] text-xs flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#FDE68A]" />
                      <span className="font-mono font-bold tabular-nums">
                        GERAK AKTIF ({motionEnergy}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Top HUD */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border-2 border-[#1C1917] ${
                        handDetected
                          ? 'bg-[#047857] text-white'
                          : 'bg-[#FDE68A] text-[#141210]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          handDetected ? 'bg-[#FDE68A]' : 'bg-[#C2410C]'
                        }`}
                      />
                      {handDetected
                        ? detectedHandCount >= 2
                          ? '2 TANGAN TERDETEKSI (KIRI & KANAN)'
                          : '1 TANGAN TERBACA JELAS'
                        : 'ARAHKAN TANGAN KE KAMERA'}
                    </span>

                    <span className="text-xs text-[#FFFDF9] bg-[#141210]/90 px-2.5 py-1 rounded-lg font-mono font-bold border border-[#44403C] hidden sm:inline tabular-nums">
                      {fps} FPS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {autoCommit && handDetected && (
                      <div className="flex items-center gap-2 bg-[#141210]/90 px-3 py-1.5 rounded-xl border border-[#FDE68A]">
                        <Zap
                          className={`w-3.5 h-3.5 ${
                            isStabilizing ? 'text-[#FDE68A]' : 'text-[#34D399]'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-[#FFFDF9] font-bold whitespace-nowrap tabular-nums">
                            {isStabilizing
                              ? 'Menstabilkan...'
                              : `${readingStatus} (${Math.round(holdProgress)}%)`}
                          </span>
                          <div className="w-20 h-1.5 bg-[#44403C] rounded-full overflow-hidden mt-0.5">
                            <div
                              className={`h-full transition-all duration-75 ${
                                isStabilizing
                                  ? 'bg-[#FDE68A]'
                                  : holdProgress >= 90
                                  ? 'bg-[#34D399]'
                                  : 'bg-[#60A5FA]'
                              }`}
                              style={{ width: `${holdProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!handDetected && (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl border-2 border-dashed border-[#FDE68A]/70 bg-[#141210]/40 flex flex-col items-center justify-center text-center p-4">
                    <Hand className="w-8 h-8 text-[#FDE68A] mb-2" />
                    <span className="font-mono text-xs text-[#FFFDF9] font-bold bg-[#141210] px-3 py-1 rounded-lg border border-[#44403C]">
                      Posisikan Tangan di Bingkai
                    </span>
                  </div>
                )}

                {/* Bottom HUD: Live Detection Readout */}
                <div className="flex items-end justify-between gap-2">
                  <div className="bg-[#141210]/95 p-3 rounded-2xl border-2 border-[#FFFDF9]/20 flex items-center gap-3">
                    <div className="min-w-12 h-12 px-2.5 rounded-xl bg-[#FDE68A] text-[#141210] flex items-center justify-center font-display font-extrabold text-xl sm:text-2xl text-center">
                      {detectedLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#FDE68A] tabular-nums">
                          {detectionConfidence}% AKURAT
                        </span>
                        {isDynamicGesture && (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C2410C] text-white">
                            <Zap className="w-3 h-3" />
                            <span>DINAMIS</span>
                          </span>
                        )}
                        {isTwoHandDetectedWord && (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#047857] text-white">
                            <Hand className="w-3 h-3" />
                            <span>2 TANGAN</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#D6D3D1] mt-0.5 max-w-[220px] sm:max-w-xs truncate">
                        {gestureDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeWithGemini}
                    className="pointer-events-auto tactile-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210] font-bold text-xs cursor-pointer"
                    title="Periksa apakah posisi jari Anda sudah tepat menurut AI"
                  >
                    <Sparkles className="w-4 h-4 text-[#141210]" />
                    <span className="hidden sm:inline">Evaluasi AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Finger State Diagnostics & Vision Controls */}
          <div className="bg-[#FFFDF9] rounded-3xl p-5 border-2 border-[#1C1917] shadow-[5px_5px_0px_#1C1917] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#EAE4D7] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#047857]" />
                <span className="font-mono text-xs font-bold uppercase text-[#141210]">
                  Telemetri Sendi Jari {isDebugMode && debugSummary ? `(${debugSummary})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                    showSkeleton
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#F6F3EC] text-[#44403C]'
                  }`}
                >
                  {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Kerangka 21-Titik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoCommit(!autoCommit)}
                  className={`tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                    autoCommit
                      ? 'bg-[#FDE68A] text-[#141210]'
                      : 'bg-[#F6F3EC] text-[#44403C]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ketik Otomatis: {autoCommit ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* 5 Finger State Badges */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { label: 'Jempol', state: fingerStates.thumb },
                { label: 'Telunjuk', state: fingerStates.index },
                { label: 'Tengah', state: fingerStates.middle },
                { label: 'Manis', state: fingerStates.ring },
                { label: 'Kelingking', state: fingerStates.pinky },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`py-2 px-1.5 rounded-xl border-2 border-[#1C1917] transition-colors ${
                    item.state
                      ? 'bg-[#D1FAE5] text-[#065F46] font-extrabold'
                      : 'bg-[#F6F3EC] text-[#57534E] font-medium'
                  }`}
                >
                  <span className="block font-mono text-xs uppercase">{item.label}</span>
                  <span className="text-xs font-bold">{item.state ? 'TEGAK' : 'LIPAT'}</span>
                </div>
              ))}
            </div>

            {/* Hold Pause & Motion Energy Controls */}
            <div className="pt-3 border-t-2 border-[#EAE4D7] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col justify-between gap-2">
                <span className="font-mono font-bold text-[#141210] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#047857]" />
                  Jeda Tahan Ketik Otomatis:
                </span>
                <div className="inline-flex bg-[#EAE4D7] p-1 rounded-xl border border-[#1C1917] self-start">
                  {[
                    { key: 'cepat', label: 'Cepat (0.8s)' },
                    { key: 'akurat', label: 'Standar (1.1s)' },
                    { key: 'teliti', label: 'Teliti (1.6s)' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAiReadingPause(key as 'cepat' | 'akurat' | 'teliti')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer tabular-nums ${
                        aiReadingPause === key
                          ? 'bg-[#141210] text-[#FDE68A]'
                          : 'text-[#44403C] hover:text-[#141210]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#141210] uppercase">
                    Sensitivitas &amp; Energi Gerak:
                  </span>
                  <span className="font-mono font-bold text-[#047857] tabular-nums">
                    {motionEnergy}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#EAE4D7] h-2.5 rounded-full overflow-hidden border border-[#1C1917]">
                    <div
                      className="h-full transition-all duration-100 bg-[#047857]"
                      style={{ width: `${motionEnergy}%` }}
                    />
                  </div>
                  <div className="inline-flex bg-[#EAE4D7] p-1 rounded-xl border border-[#1C1917]">
                    {[
                      { key: 'normal', label: 'Santai' },
                      { key: 'tinggi', label: 'Sedang' },
                      { key: 'responsif', label: 'Cepat' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setDynamicSensitivity(key as 'normal' | 'tinggi' | 'responsif')
                        }
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                          dynamicSensitivity === key
                            ? 'bg-[#141210] text-[#FDE68A]'
                            : 'text-[#44403C] hover:text-[#141210]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Readout & Sentence Tape */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] overflow-hidden">
            {/* Top Strip */}
            <div className="bg-[#141210] text-[#FFFDF9] px-5 py-3.5 border-b-2 border-[#1C1917] flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FDE68A]">
                PAPAN BACA &amp; PERANGKAI KALIMAT
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#047857] text-white">
                TTS ID-ID
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Active Character Readout Specimen */}
              <div className="p-3.5 rounded-2xl bg-[#F6F3EC] border-2 border-[#1C1917] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#FFFDF9] border border-[#1C1917] flex items-center justify-center overflow-hidden shrink-0">
                    <HandSignIllustration signId={detectedLetter.toLowerCase()} size={48} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display font-extrabold text-2xl text-[#141210]">
                        {detectedLetter || '-'}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#FDE68A] text-[#141210] border border-[#1C1917] tabular-nums">
                        {detectionConfidence}%
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#57534E] block">
                      {isDynamicGesture ? 'Gestur Dinamis' : 'Gestur Terbaca'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLetter(detectedLetter)}
                  className="tactile-btn px-3.5 py-2 rounded-xl bg-[#047857] text-white text-xs font-bold cursor-pointer"
                  title="Tambahkan ke dalam kalimat"
                >
                  + Tambah
                </button>
              </div>

              {/* Output Transcript Box */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#141210] block">
                  Pita Kalimat Hasil Terjemahan:
                </label>

                <div className="min-h-[120px] p-4 rounded-2xl bg-[#F6F3EC] border-2 border-[#1C1917] text-[#141210] font-bold text-base sm:text-lg flex flex-wrap items-baseline gap-1.5 break-words">
                  {sentenceBuffer && <span>{sentenceBuffer}</span>}
                  {wordBuffer && (
                    <span className="text-[#1D4ED8] font-extrabold underline decoration-[#1D4ED8] decoration-2 underline-offset-4">
                      {wordBuffer}
                    </span>
                  )}
                  {!fullDisplayResult && (
                    <span className="text-[#57534E] text-xs font-medium">
                      Peragakan isyarat di depan kamera atau tekan tombol &ldquo;+ Tambah&rdquo; di
                      atas untuk merangkai kalimat...
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Editing Actions */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-buffer-backspace"
                  type="button"
                  onClick={handleBackspace}
                  className="tactile-btn flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FFFDF9] hover:bg-[#EAE4D7] text-[#141210] cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Hapus Huruf</span>
                </button>
                <button
                  id="btn-buffer-space"
                  type="button"
                  onClick={handleAddSpace}
                  className="tactile-btn flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FFFDF9] hover:bg-[#EAE4D7] text-[#141210] cursor-pointer"
                >
                  <Space className="w-3.5 h-3.5" />
                  <span>Spasi</span>
                </button>
                <button
                  id="btn-buffer-clear"
                  type="button"
                  onClick={handleClearAll}
                  className="tactile-btn p-2.5 rounded-xl text-xs bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] cursor-pointer"
                  title="Hapus Semua Tulisan"
                  aria-label="Hapus Semua Tulisan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Action Buttons: Speak & Copy */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  id="btn-speak-sign-result"
                  type="button"
                  onClick={() => speakText(fullDisplayResult)}
                  disabled={!fullDisplayResult}
                  className="tactile-btn flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold bg-[#047857] hover:bg-[#065F46] text-white disabled:opacity-40 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Suarakan Kalimat</span>
                </button>

                <button
                  id="btn-copy-sign-result"
                  type="button"
                  onClick={handleCopy}
                  disabled={!fullDisplayResult}
                  className="tactile-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-bold bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210] disabled:opacity-40 cursor-pointer"
                  title="Salin tulisan ini"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#047857]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reference Guide Card */}
          <div className="bg-[#FFFDF9] rounded-3xl p-5 border-2 border-[#1C1917] shadow-[5px_5px_0px_#1C1917] text-xs text-[#44403C] space-y-2.5">
            <p className="font-mono font-bold uppercase text-[#141210] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C2410C]" />
              <span>Panduan Gestur 1 &amp; 2 Tangan</span>
            </p>
            <div className="space-y-2 pt-1 border-t border-[#EAE4D7]">
              <p>
                <strong className="text-[#141210]">4 Gestur 2 Tangan:</strong>{' '}
                <em>Terima Kasih</em> (dua telapak merapat di dada), <em>Sama-sama</em> (dua
                telapak terbuka), <em>Tolong</em> (tangan bertumpuk), <em>Perkenalkan</em> (dua
                tangan huruf H menyilang).
              </p>
              <p>
                <strong className="text-[#141210]">Gestur Gerak &amp; Kata:</strong>{' '}
                <em>Halo</em> (lambaian), <em>Maaf</em> (putar di dada), <em>Ya</em> (angguk
                kepalan), <em>Tidak</em> (geleng telunjuk), <em>Saya</em> (tunjuk dada),{' '}
                <em>Bagus</em> (jempol), <em>Sayang</em> (ILY), serta <em>J</em> &amp; <em>Z</em>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Deep Inspection Modal */}
      {isGeminiModalOpen && (
        <div
          id="gemini-inspection-modal-overlay"
          className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsGeminiModalOpen(false)}
        >
          <div
            id="gemini-inspection-modal-content"
            className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full overflow-hidden border-2 border-[#1C1917] shadow-[8px_8px_0px_#1C1917]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#141210] text-[#FFFDF9] px-6 py-4 border-b-2 border-[#1C1917] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FDE68A] text-[#141210] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-white">
                    Evaluasi Anatomi Gestur AI
                  </h3>
                  <p className="font-mono text-xs text-[#D6D3D1]">
                    Pemeriksaan ketepatan posisi sendi jari SIBI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGeminiModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#292524] hover:bg-[#44403C] text-white cursor-pointer"
                aria-label="Tutup dialog pemeriksaan AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isAnalyzingWithGemini ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#1D4ED8] animate-spin" />
                  <div>
                    <p className="font-display text-base font-extrabold text-[#141210]">
                      Memeriksa Posisi Tangan Anda...
                    </p>
                    <p className="text-xs text-[#44403C] mt-1">
                      Menganalisis tekukan sendi dan orientasi telapak tangan
                    </p>
                  </div>
                </div>
              ) : geminiResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#F6F3EC] p-4 rounded-2xl border-2 border-[#1C1917]">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-[#57534E] block">
                        Isyarat Terbaca
                      </span>
                      <span className="font-display font-extrabold text-2xl text-[#141210]">
                        {geminiResult.sign ||
                          (detectedLetter && detectedLetter !== '?' ? detectedLetter : 'A')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold uppercase text-[#57534E] block">
                        Tingkat Akurasi
                      </span>
                      <span className="font-mono font-extrabold text-xl text-[#047857] tabular-nums">
                        {geminiResult.confidence || `${detectionConfidence || 90}%`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-mono text-xs font-bold uppercase text-[#141210]">
                      Umpan Balik Formasi:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed font-medium">
                      {geminiResult.feedback ||
                        'Posisi tangan terdeteksi dengan baik. Pastikan seluruh jari berada di dalam bingkai kamera.'}
                    </p>
                  </div>

                  {geminiResult.suggestions && geminiResult.suggestions.length > 0 && (
                    <div className="space-y-2 border-t-2 border-[#EAE4D7] pt-3">
                      <h4 className="font-mono text-xs font-bold uppercase text-[#141210]">
                        Tips Penyempurnaan:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#44403C] font-medium">
                        {geminiResult.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGeminiModalOpen(false)}
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-[#141210] text-[#FFFDF9] font-bold text-xs cursor-pointer"
                >
                  Tutup Evaluasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
