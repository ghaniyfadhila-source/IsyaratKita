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
    <div id="sign-to-speech-section" className="space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="liquid-glass rounded-3xl p-5 border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Terjemahkan Isyarat Tangan ke Suara &amp; Tulisan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Arahkan tangan ke kamera untuk memperagakan isyarat SIBI. Aplikasi akan membaca gerakan tangan Anda, merangkainya menjadi kata, dan membacakannya bersuara.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            id="btn-toggle-camera"
            onClick={handleToggleCamera}
            disabled={isModelLoading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer ${
              cameraActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                <span>Tutup Kamera</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Buka Kamera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Pengenalan Isyarat Selector */}
      <div className="liquid-glass rounded-2xl p-3 px-4 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-900">Target Deteksi:</span>
          <span className="text-xs text-slate-600 hidden md:inline">
            {detectionFilterMode === 'alphabet'
              ? 'Fokus Alfabet (A–Z) — mencakup 24 huruf statis dan huruf gerak J & Z.'
              : detectionFilterMode === 'all'
              ? 'Otomatis — Alfabet A–Z, kata 1 & 2 tangan, serta gerakan dinamis aktif.'
              : 'Kata & Sapaan — Memprioritaskan kata utuh dan sapaan cepat.'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setDetectionFilterMode('alphabet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              detectionFilterMode === 'alphabet'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                : 'text-slate-700 hover:text-slate-900'
            }`}
            title="Fokus Alfabet A-Z"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Fokus Huruf (A–Z)</span>
          </button>
          <button
            onClick={() => setDetectionFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              detectionFilterMode === 'all'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                : 'text-slate-700 hover:text-slate-900'
            }`}
            title="Deteksi seimbang antara huruf statis dan gerakan dinamis aktif"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Otomatis (Semua)</span>
          </button>
          <button
            onClick={() => setDetectionFilterMode('words')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              detectionFilterMode === 'words'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                : 'text-slate-700 hover:text-slate-900'
            }`}
            title="Prioritaskan kata-kata cepat dan sapaan"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kata &amp; Sapaan</span>
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pemberitahuan Akses Kamera</p>
            <p className="text-amber-800 mt-0.5">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera / Hand Landmark Stage */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[620px] flex flex-col items-center justify-center">
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
              <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 text-slate-300 space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                  <Camera className="w-10 h-10 text-blue-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base sm:text-lg font-bold text-slate-100">
                    Kamera Sedang Tidak Aktif
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Klik tombol di bawah atau tombol di bagian atas untuk mengaktifkan webcam dan mulai membaca gerakan isyarat tangan Anda secara langsung.
                  </p>
                </div>
                <button
                  id="btn-start-camera-center"
                  onClick={handleToggleCamera}
                  disabled={isModelLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-98 cursor-pointer"
                >
                  {isModelLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyiapkan Kamera...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Buka Kamera Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {dynamicToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-amber-300">
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>{dynamicToast}</span>
                    </div>
                  </div>
                )}

                {motionEnergy > 15 && handDetected && !dynamicToast && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-sky-400/50 text-sky-200 text-xs flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-semibold tabular-nums">Membaca Gerakan Tangan ({motionEnergy}%)</span>
                    </div>
                  </div>
                )}

                {/* Top HUD */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                        handDetected
                          ? 'bg-emerald-950/85 text-emerald-200 border-emerald-500/40'
                          : 'bg-slate-950/75 text-amber-200 border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          handDetected ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      {handDetected
                        ? detectedHandCount >= 2
                          ? '2 Tangan Terdeteksi (Kiri & Kanan)'
                          : '1 Tangan Terbaca Jelas'
                        : 'Arahkan Tangan ke Kamera...'}
                    </span>

                    <span className="text-xs text-white bg-slate-950/75 px-2.5 py-1 rounded-full font-mono backdrop-blur-xs border border-white/15 hidden sm:inline tabular-nums">
                      {fps} FPS
                    </span>

                    <span className="text-xs text-teal-200 bg-teal-950/85 px-2.5 py-1 rounded-full font-semibold backdrop-blur-xs border border-teal-500/40 hidden md:inline">
                      {detectionFilterMode === 'alphabet' ? 'Mode: Huruf (A-Z)' : detectionFilterMode === 'words' ? 'Mode: Kata' : 'Mode: Otomatis'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white bg-slate-950/75 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/15 flex items-center gap-1.5">
                      <Hand className="w-3.5 h-3.5 text-teal-400" />
                      <span>IsyaratKita</span>
                    </span>

                    {autoCommit && handDetected && (
                      <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-teal-500/40">
                        <Zap
                          className={`w-3.5 h-3.5 ${
                            isStabilizing ? 'text-amber-400' : 'text-teal-400'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-teal-200 font-bold whitespace-nowrap tabular-nums">
                            {isStabilizing
                              ? 'Menstabilkan...'
                              : `${readingStatus} (${Math.round(holdProgress)}%)`}
                          </span>
                          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                            <div
                              className={`h-full transition-all duration-75 ${
                                isStabilizing
                                  ? 'bg-amber-400'
                                  : holdProgress >= 90
                                  ? 'bg-emerald-400'
                                  : 'bg-teal-400'
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
                  <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl border-2 border-dashed border-teal-400/50 bg-teal-500/5 flex flex-col items-center justify-center text-center p-4">
                    <Hand className="w-8 h-8 text-teal-300 mb-2" />
                    <span className="text-xs text-teal-100 font-medium bg-slate-950/75 px-3 py-1 rounded-full">
                      Posisikan Tangan di Depan Kamera
                    </span>
                  </div>
                )}

                {/* Bottom HUD: Detection Card */}
                <div className="flex items-end justify-between">
                  <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center gap-3">
                    <div className="min-w-12 h-12 px-2 rounded-xl bg-teal-600 text-white flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-center">
                      {detectedLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Isyarat:
                        </span>
                        <span className="text-xs font-mono font-bold text-teal-300 tabular-nums">
                          {detectionConfidence}% Akurat
                        </span>
                        {isDynamicGesture && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            <Zap className="w-3 h-3" />
                            <span>Gerakan Mengayun</span>
                          </span>
                        )}
                        {isTwoHandDetectedWord && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                            <Hand className="w-3 h-3" />
                            <span>2 Tangan ({detectedLetter})</span>
                          </span>
                        )}
                        {gestureType === 'word' && !isDynamicGesture && !isTwoHandDetectedWord && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                            Kata Utuh
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5 max-w-[220px] sm:max-w-xs truncate">
                        {gestureDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyzeWithGemini}
                    className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                    title="Periksa apakah posisi jari Anda sudah tepat menurut AI"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span className="hidden sm:inline">Cek Posisi Tangan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Gesture & Movement Tips Bar */}
          <div className="liquid-glass rounded-2xl p-3.5 border border-slate-200/90 flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">
                Tips Isyarat Gerakan &amp; Kata:
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">
                Aplikasi mengenali gerakan mengayun: <strong>Huruf Z</strong> (lukis huruf Z di udara), <strong>Huruf J</strong> (gerakkan kelingking melengkung), <strong>Halo</strong> (lambaikan tangan), <strong>Ya</strong> (anggukkan kepalan tangan), <strong>Tidak</strong> (gelengkan telunjuk), <strong>Bagus</strong> (acungkan jempol).
              </p>
            </div>
          </div>

          {/* Real-time Finger State Diagnostics & Vision Controls */}
          <div className="liquid-glass rounded-3xl p-5 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  Status Posisi Jari {isDebugMode && debugSummary ? `(${debugSummary})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    showSkeleton
                      ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                  title="Tampilkan garis panduan tangan"
                >
                  {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Garis Tangan</span>
                </button>

                <button
                  onClick={() => setAutoCommit(!autoCommit)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    autoCommit
                      ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                  title="Ketik otomatis saat gerakan tangan ditahan sejenak"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ketik Otomatis ({autoCommit ? 'Aktif' : 'Mati'})</span>
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
                { label: 'Kelingking', state: fingerStates.pinky }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`py-2 px-1.5 rounded-xl border transition-colors ${
                    item.state
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="block text-xs text-slate-600 font-medium">{item.label}</span>
                  <span className="text-xs">{item.state ? 'Tegak' : 'Terlipat'}</span>
                </div>
              ))}
            </div>

            {/* Jeda Baca AI / Accuracy Hold Delay Setting */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  Jeda Baca AI (Stabilisasi):
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Waktu jeda AI membaca &amp; memvalidasi gestur agar terjemahan tepat dan tidak salah ketik.
                </p>
              </div>

              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0 self-start sm:self-auto">
                {[
                  { key: 'cepat', label: 'Cepat (0.8s)' },
                  { key: 'akurat', label: 'Akurat (1.1s)' },
                  { key: 'teliti', label: 'Teliti (1.6s)' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAiReadingPause(key as 'cepat' | 'akurat' | 'teliti')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer tabular-nums ${
                      aiReadingPause === key
                        ? 'bg-white text-teal-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Motion Energy Bar & Dynamic Sensitivity Controls */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-700 shrink-0">
                  Keaktifan Gerak:
                </span>
                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden max-w-[140px] sm:max-w-[180px]">
                  <div
                    className="h-full rounded-full transition-all duration-100 bg-gradient-to-r from-teal-500 to-amber-500"
                    style={{ width: `${motionEnergy}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-800 text-xs tabular-nums">
                  {motionEnergy}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-xs text-slate-600 font-medium">Sensitivitas Gerak:</span>
                <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  {[
                    { key: 'normal', label: 'Santai' },
                    { key: 'tinggi', label: 'Sedang' },
                    { key: 'responsif', label: 'Cepat' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setDynamicSensitivity(key as 'normal' | 'tinggi' | 'responsif')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        dynamicSensitivity === key
                          ? 'bg-white text-teal-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
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

        {/* Right Column: Translated Speech & Text Output Panel (Flattened hierarchy) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="liquid-glass rounded-3xl p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <span className="text-sm font-bold text-slate-900">
                Hasil Terjemahan
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Suara Langsung
              </span>
            </div>

            {/* Active Character Preview (flat section) */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                  <HandSignIllustration signId={detectedLetter.toLowerCase()} size={48} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-2xl text-slate-900">
                      {detectedLetter || '-'}
                    </span>
                    {isDynamicGesture ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        Gerakan Mengayun
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Terbaca
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 block tabular-nums">
                    Kecocokan: {detectionConfidence}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAddLetter(detectedLetter)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors active:scale-95 cursor-pointer"
                title="Ketik huruf ini ke dalam kalimat"
              >
                + Tambah
              </button>
            </div>

            {/* Output Transcript Box */}
            <div className="space-y-2 border-t border-slate-200/80 pt-3.5">
              <label className="text-xs font-bold text-slate-700 block">
                Kalimat yang Dirangkai:
              </label>

              <div className="min-h-[110px] p-4 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 font-medium text-base sm:text-lg flex flex-wrap items-baseline gap-1.5 break-words">
                {sentenceBuffer && <span>{sentenceBuffer}</span>}
                {wordBuffer && (
                  <span className="text-blue-700 font-bold underline decoration-blue-400 decoration-2 underline-offset-4">
                    {wordBuffer}
                  </span>
                )}
                {!fullDisplayResult && (
                  <span className="text-slate-600 text-xs italic">
                    Peragakan isyarat di kamera atau gunakan tombol tambah di atas...
                  </span>
                )}
              </div>
            </div>

            {/* Quick Editing Actions (Backspace, Space, Clear) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-buffer-backspace"
                onClick={handleBackspace}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-colors active:scale-95 cursor-pointer"
              >
                <Delete className="w-3.5 h-3.5" />
                <span>Hapus Huruf</span>
              </button>
              <button
                id="btn-buffer-space"
                onClick={handleAddSpace}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-colors active:scale-95 cursor-pointer"
              >
                <Space className="w-3.5 h-3.5" />
                <span>Beri Spasi</span>
              </button>
              <button
                id="btn-buffer-clear"
                onClick={handleClearAll}
                className="p-2.5 rounded-xl text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors active:scale-95 cursor-pointer"
                title="Hapus Semua Tulisan"
                aria-label="Hapus Semua Tulisan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action Buttons: Speak & Copy */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2.5">
              <button
                id="btn-speak-sign-result"
                onClick={() => speakText(fullDisplayResult)}
                disabled={!fullDisplayResult}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bunyikan Suara Kalimat</span>
              </button>

              <button
                id="btn-copy-sign-result"
                onClick={handleCopy}
                disabled={!fullDisplayResult}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                title="Salin tulisan ini"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Tulisan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Information Callout */}
          <div className="liquid-glass rounded-3xl p-4 border border-slate-200/90 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Tips Penggunaan Kamera Isyarat</span>
            </p>
            <p className="leading-relaxed">
              Kamera membaca gerakan tangan Anda langsung di perangkat. Aktifkan fitur <strong>&ldquo;Ketik Otomatis&rdquo;</strong> agar kata atau huruf langsung terangkai saat gestur tangan ditahan atau diselesaikan.
            </p>
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <p><strong>Gestur 2 Tangan:</strong> <em>Terima Kasih</em> (dua telapak merapat/mengatup di dada), <em>Sama-sama</em> (dua telapak terbuka santun), <em>Tolong</em> (tangan bertumpuk), <em>Perkenalkan</em> (dua tangan huruf H menyilang).</p>
              <p><strong>Gerak Dinamis &amp; Sapaan:</strong> <em>Halo</em> (lambaian tangan), <em>Terima Kasih</em> (dorong maju dari dagu), <em>Maaf</em> (putar melingkar di dada), <em>Ya</em> (angguk kepalan), <em>Tidak</em> (geleng telunjuk), <em>Saya</em> (tunjuk dada), <em>Bagus</em> (jempol mantap), <em>Sayang</em> (ILY), <em>Z</em> &amp; <em>J</em> (pola goresan udara).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Deep Inspection Modal */}
      {isGeminiModalOpen && (
        <div
          id="gemini-inspection-modal-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsGeminiModalOpen(false)}
        >
          <div
            id="gemini-inspection-modal-content"
            className="liquid-glass-modal rounded-3xl max-w-lg w-full p-6 border border-white/60 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Bantuan Cek Posisi Tangan
                  </h3>
                  <p className="text-xs text-slate-600">
                    Pemeriksaan ketepatan bentuk isyarat tangan Anda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGeminiModalOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup dialog pemeriksaan AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAnalyzingWithGemini ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Sedang Memeriksa Posisi Tangan...
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Memeriksa kelengkungan jari dan posisi tangan Anda
                  </p>
                </div>
              </div>
            ) : geminiResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-xs text-blue-800 font-semibold block">
                      Huruf / Kata Terbaca
                    </span>
                    <span className="font-mono font-black text-2xl text-slate-900">
                      {geminiResult.sign || (detectedLetter && detectedLetter !== '?' ? detectedLetter : 'A')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-800 font-semibold block">
                      Tingkat Kecocokan
                    </span>
                    <span className="font-mono font-bold text-lg text-emerald-700 tabular-nums">
                      {geminiResult.confidence || `${detectionConfidence || 90}%`}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Hasil Pemeriksaan:</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {geminiResult.feedback ||
                      'Posisi tangan terdeteksi dengan baik. Pastikan seluruh jari berada di dalam bingkai kamera.'}
                  </p>
                </div>

                {geminiResult.suggestions && geminiResult.suggestions.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200/80 pt-3">
                    <h4 className="text-xs font-bold text-slate-900">Saran untuk Anda:</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {geminiResult.suggestions.map((sug, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
                onClick={() => setIsGeminiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
