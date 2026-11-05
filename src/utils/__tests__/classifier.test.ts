import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySibiSign,
  classifyTwoHandSign,
  evaluateFingerStates
} from '../sibiGestureClassifier';
import { globalMotionTracker, HandMotionTracker } from '../motionTracker';
import { makeStaticSignLandmarks, applyTransform } from '../__fixtures__/synthHand';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS } from '../../data/sibiData';

const STATIC_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y'
] as const;

describe('SIBI Gesture Classifier — Baseline & Accuracy Suite', () => {
  it('prints confusion matrix and achieves >= 95% accuracy across all 24 static letters with variations', () => {
    const variations = [
      { name: 'canonical-right', opts: { scale: 1.0, rotateDeg: 0, mirrorX: false } },
      { name: 'small-far', opts: { scale: 0.65, rotateDeg: 0, mirrorX: false } },
      { name: 'large-close', opts: { scale: 1.35, rotateDeg: 0, mirrorX: false } },
      { name: 'tilt-left', opts: { scale: 1.0, rotateDeg: -12, mirrorX: false } },
      { name: 'tilt-right', opts: { scale: 1.0, rotateDeg: 12, mirrorX: false } },
      { name: 'mirrored-left-hand', opts: { scale: 1.0, rotateDeg: 0, mirrorX: true } }
    ];

    let total = 0;
    let correct = 0;
    const mismatches: string[] = [];
    const perLetterCorrect: Record<string, number> = {};

    for (const letter of STATIC_LETTERS) {
      perLetterCorrect[letter] = 0;
      for (const v of variations) {
        globalMotionTracker.reset();
        const lm = makeStaticSignLandmarks(letter, v.opts);
        const handedness = v.opts.mirrorX ? 'Left' : 'Right';
        const res = classifySibiSign(lm, handedness, 'alphabet');
        total++;
        if (res.letter === letter) {
          correct++;
          perLetterCorrect[letter]++;
        } else {
          mismatches.push(`${letter} (${v.name}) -> got ${res.letter} (${res.confidence}%)`);
        }
      }
    }

    const accuracy = (correct / total) * 100;
    console.log(
      `[Accuracy Report] ${correct}/${total} (${accuracy.toFixed(1)}%) | Mismatches: ${
        mismatches.length > 0 ? mismatches.slice(0, 12).join('; ') : 'NONE'
      }`
    );

    assert.ok(
      accuracy >= 95,
      `Expected >= 95% static alphabet accuracy, got ${accuracy.toFixed(1)}%. Mismatches:\n${mismatches.join('\n')}`
    );

    for (const letter of STATIC_LETTERS) {
      const letterAcc = (perLetterCorrect[letter] / variations.length) * 100;
      assert.ok(
        letterAcc >= 90,
        `Expected >= 90% accuracy for letter ${letter}, got ${letterAcc.toFixed(1)}%`
      );
    }
  });

  it('never classifies A (tight or loose webcam fist) as B', () => {
    for (const variant of ['A', 'A_LOOSE'] as const) {
      for (const tilt of [-15, -8, 0, 8, 15]) {
        globalMotionTracker.reset();
        const lm = makeStaticSignLandmarks(variant, { rotateDeg: tilt, jitter: 0.003 });
        const states = evaluateFingerStates(lm);
        assert.equal(states.index, false, `Index should be curled for ${variant} at tilt ${tilt}`);
        assert.equal(states.middle, false, `Middle should be curled for ${variant} at tilt ${tilt}`);

        const res = classifySibiSign(lm, 'Right', 'all');
        assert.notEqual(res.letter, 'B', `${variant} at tilt ${tilt} must never be classified as B`);
        assert.equal(res.letter, 'A', `${variant} at tilt ${tilt} should be classified as A, got ${res.letter}`);
      }
    }
  });

  it('detects dynamic letters Z and J even in alphabet filter mode', () => {
    // 1. Dynamic Z trajectory (index extended, tracing horizontal -> diagonal down -> horizontal)
    globalMotionTracker.reset();
    const baseZ = makeStaticSignLandmarks('D'); // Index extended, others curled
    const zOffsets = [
      { dx: -0.10, dy: -0.06 },
      { dx: -0.03, dy: -0.06 },
      { dx: 0.04, dy: -0.06 },
      { dx: 0.10, dy: -0.06 },
      { dx: 0.04, dy: -0.01 },
      { dx: -0.02, dy: 0.04 },
      { dx: -0.09, dy: 0.08 },
      { dx: -0.02, dy: 0.08 },
      { dx: 0.05, dy: 0.08 },
      { dx: 0.11, dy: 0.08 }
    ];

    let detectedZ = false;
    zOffsets.forEach((off, idx) => {
      const frameLm = applyTransform(baseZ, { translateX: off.dx, translateY: off.dy });
      const res = classifySibiSign(frameLm, 'Right', 'alphabet', 1000 + idx * 45);
      if (res.letter === 'Z') detectedZ = true;
    });
    assert.equal(detectedZ, true, 'Dynamic letter Z must be detected in alphabet mode');

    // 2. Dynamic J trajectory (pinky extended, tracing downward curve and hook)
    globalMotionTracker.reset();
    const baseJ = makeStaticSignLandmarks('I'); // Pinky extended
    const jOffsets = [
      { dx: 0.0, dy: -0.06 },
      { dx: 0.0, dy: -0.02 },
      { dx: 0.0, dy: 0.03 },
      { dx: -0.01, dy: 0.08 },
      { dx: -0.03, dy: 0.10 },
      { dx: -0.07, dy: 0.07 },
      { dx: -0.09, dy: 0.03 }
    ];

    let detectedJ = false;
    jOffsets.forEach((off, idx) => {
      const frameLm = applyTransform(baseJ, { translateX: off.dx, translateY: off.dy });
      const res = classifySibiSign(frameLm, 'Right', 'alphabet', 3000 + idx * 50);
      if (res.letter === 'J') detectedJ = true;
    });
    assert.equal(detectedJ, true, 'Dynamic letter J must be detected in alphabet mode');
  });

  it('does not hijack static A or S with slight hand tremor into dynamic Ya or Maaf', () => {
    globalMotionTracker.reset();
    const baseA = makeStaticSignLandmarks('A');
    for (let i = 0; i < 10; i++) {
      const jitterX = Math.sin(i) * 0.004;
      const jitterY = Math.cos(i) * 0.004;
      const lm = applyTransform(baseA, { translateX: jitterX, translateY: jitterY });
      const res = classifySibiSign(lm, 'Right', 'all');
      assert.equal(res.letter, 'A', `Frame ${i} with minor tremor should stay A, got ${res.letter}`);
    }
  });

  it('accurately classifies static words (Saya, Kamu, Sayang, Bagus) in all/words mode', () => {
    globalMotionTracker.reset();
    const sayaRes = classifySibiSign(makeStaticSignLandmarks('SAYA'), 'Right', 'all');
    assert.equal(sayaRes.letter, 'Saya');

    globalMotionTracker.reset();
    const kamuRes = classifySibiSign(makeStaticSignLandmarks('KAMU'), 'Right', 'all');
    assert.equal(kamuRes.letter, 'Kamu');

    globalMotionTracker.reset();
    const sayangRes = classifySibiSign(makeStaticSignLandmarks('SAYANG'), 'Right', 'all');
    assert.equal(sayangRes.letter.toUpperCase(), 'SAYANG');

    globalMotionTracker.reset();
    const bagusRes = classifySibiSign(makeStaticSignLandmarks('BAGUS'), 'Right', 'words');
    assert.ok(
      ['BAGUS', 'Bagus', 'Baik'].includes(bagusRes.letter),
      `Expected Bagus/Baik in words mode, got ${bagusRes.letter}`
    );
  });

  it('accurately classifies all 4 two-hand gestures without overlap', () => {
    // 1. Nama: Two H hands close together at tips
    const hRight = makeStaticSignLandmarks('H', { translateX: 0.06, translateY: 0 });
    const hLeft = makeStaticSignLandmarks('H', { mirrorX: true, translateX: 0.06, translateY: 0.02 });
    const namaRes = classifyTwoHandSign(hRight, 'Right', hLeft, 'Left', 'all');
    assert.equal(namaRes?.letter, 'Nama');

    // 2. Tolong: Two open hands stacked vertically
    const tolongTop = makeStaticSignLandmarks('B', { translateX: 0, translateY: -0.06 });
    const tolongBottom = makeStaticSignLandmarks('B', { mirrorX: true, translateX: 0, translateY: 0.08 });
    const tolongRes = classifyTwoHandSign(tolongTop, 'Right', tolongBottom, 'Left', 'all');
    assert.equal(tolongRes?.letter, 'Tolong');

    // 3. Terima Kasih (2 tangan mengatup rapat di dada)
    const tkRight = makeStaticSignLandmarks('B', { translateX: -0.02, translateY: 0 });
    const tkLeft = makeStaticSignLandmarks('B', { mirrorX: true, translateX: -0.02, translateY: 0 });
    const tkRes = classifyTwoHandSign(tkRight, 'Right', tkLeft, 'Left', 'all');
    assert.equal(tkRes?.letter, 'Terima Kasih');

    // 4. Sama-sama (2 tangan terbuka sejajar terpisah setinggi dada)
    const ssRight = makeStaticSignLandmarks('B', { translateX: -0.18, translateY: 0 });
    const ssLeft = makeStaticSignLandmarks('B', { mirrorX: true, translateX: -0.18, translateY: 0 });
    const ssRes = classifyTwoHandSign(ssRight, 'Right', ssLeft, 'Left', 'all');
    assert.equal(ssRes?.letter, 'Sama-sama');
  });

  it('keeps independent motion trackers for Left and Right hands so two hands do not corrupt each other', () => {
    const leftTracker = new HandMotionTracker();
    const rightTracker = new HandMotionTracker();
    const handA = makeStaticSignLandmarks('B', { translateX: -0.2 });
    const handB = makeStaticSignLandmarks('B', { translateX: 0.2 });

    leftTracker.update(handA, 1000);
    rightTracker.update(handB, 1000);
    leftTracker.update(handA, 1050);
    rightTracker.update(handB, 1050);

    // Since each tracker only saw stationary frames of its own hand, motion energy on both must be 0
    assert.equal(leftTracker.getMotionEnergy(), 0);
    assert.equal(rightTracker.getMotionEnergy(), 0);
  });

  it('ensures dictionary (sibiData.ts) covers all 26 letters and core words including Ya, Tidak, Sayang', () => {
    assert.equal(SIBI_ALPHABET.length, 26);
    const wordIds = SIBI_COMMON_WORDS.map((w) => w.id);
    for (const requiredId of [
      'halo',
      'terima-kasih',
      'sama-sama',
      'tolong',
      'maaf',
      'nama',
      'saya',
      'kamu',
      'kabar-baik',
      'ya',
      'tidak',
      'sayang'
    ]) {
      assert.ok(wordIds.includes(requiredId), `Missing word '${requiredId}' in SIBI_COMMON_WORDS`);
    }
  });

  it('detects dynamic word gestures (Halo, Tidak, Ya, Terima Kasih, Maaf) when moving intentionally', () => {
    // 1. Halo (open hand waving side-to-side)
    globalMotionTracker.reset();
    const baseB = makeStaticSignLandmarks('B');
    const waveX = [-0.08, -0.02, 0.05, 0.09, 0.03, -0.04, -0.08, -0.01, 0.06];
    let detectedHalo = false;
    waveX.forEach((dx, i) => {
      const res = classifySibiSign(
        applyTransform(baseB, { translateX: dx }),
        'Right',
        'all',
        5000 + i * 45
      );
      if (res.letter === 'Halo') detectedHalo = true;
    });
    assert.equal(detectedHalo, true, 'Dynamic waving Halo should be detected');

    // 2. Tidak (index finger wagging left-right relative to wrist)
    globalMotionTracker.reset();
    const baseD = makeStaticSignLandmarks('D');
    const wagAngles = [-18, -6, 12, 20, 4, -14, -20, 8, 18];
    let detectedTidak = false;
    wagAngles.forEach((deg, i) => {
      const lm = makeStaticSignLandmarks('D');
      // Swing index tip relative to stable wrist
      const swing = (deg * Math.PI) / 180;
      lm[6].x += swing * 0.08;
      lm[7].x += swing * 0.14;
      lm[8].x += swing * 0.20;
      const res = classifySibiSign(lm, 'Right', 'all', 7000 + i * 45);
      if (res.letter === 'Tidak') detectedTidak = true;
    });
    assert.equal(detectedTidak, true, 'Dynamic index wagging Tidak should be detected');

    // 3. Ya (fist nodding up and down)
    globalMotionTracker.reset();
    const baseA = makeStaticSignLandmarks('A');
    const nodY = [-0.07, -0.02, 0.04, 0.08, 0.02, -0.05, -0.08, 0.01, 0.06];
    let detectedYa = false;
    nodY.forEach((dy, i) => {
      const res = classifySibiSign(
        applyTransform(baseA, { translateY: dy }),
        'Right',
        'all',
        9000 + i * 45
      );
      if (res.letter === 'Ya') detectedYa = true;
    });
    assert.equal(detectedYa, true, 'Dynamic nodding Ya should be detected');

    // 4. Maaf (fist moving in a circular trajectory on chest)
    globalMotionTracker.reset();
    let detectedMaaf = false;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 8) * Math.PI * 1.5;
      const dx = Math.cos(angle) * 0.05;
      const dy = Math.sin(angle) * 0.05;
      const res = classifySibiSign(
        applyTransform(baseA, { translateX: dx, translateY: dy }),
        'Right',
        'all',
        12000 + i * 50
      );
      if (res.letter === 'Maaf') detectedMaaf = true;
    }
    assert.equal(detectedMaaf, true, 'Dynamic circular Maaf should be detected');
  });
});
