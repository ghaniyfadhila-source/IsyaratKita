import React from 'react';

interface HandSignIllustrationProps {
  signId: string;
  size?: number | string;
  className?: string;
  animate?: boolean;
}

/**
 * HandSignIllustration renders clear, anatomically styled SVG illustrations
 * of Indonesian SIBI hand signs (manual alphabet A-Z and vocabulary words).
 */
export const HandSignIllustration: React.FC<HandSignIllustrationProps> = ({
  signId,
  size = 120,
  className = '',
  animate = false
}) => {
  let normalizedId = signId.toLowerCase().trim();
  if (normalizedId === 'bagus' || normalizedId === 'baik') normalizedId = 'kabar-baik';
  if (normalizedId === 'salam') normalizedId = 'halo';
  if (normalizedId === 'terima kasih') normalizedId = 'terima-kasih';
  if (normalizedId === 'sama sama') normalizedId = 'sama-sama';

  // Common styles
  const handSkin = '#FDE047'; // bright warm skin gold
  const handSkinDark = '#FBBF24'; // shadow
  const strokeColor = '#78350F'; // warm deep brown outline for maximum contrast
  const strokeWidth = 2.5;
  const creaseColor = '#B45309';
  const arrowColor = '#0D9488'; // teal for motion arrows

  const renderSignGraphics = () => {
    switch (normalizedId) {
      case 'a':
        // A: Closed fist, thumb upright resting alongside index finger
        return (
          <g>
            {/* Palm/Fist base */}
            <rect x="35" y="45" width="48" height="52" rx="16" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled 4 fingers */}
            <path d="M 38 48 C 38 38, 48 38, 48 48 L 48 68 C 48 70, 38 70, 38 68 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 50 45 C 50 35, 60 35, 60 45 L 60 68 C 60 70, 50 70, 50 68 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 62 46 C 62 36, 72 36, 72 46 L 72 68 C 72 70, 62 70, 62 68 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 74 52 C 74 42, 82 42, 82 52 L 82 68 C 82 70, 74 70, 74 68 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb standing upright along the side */}
            <path d="M 27 68 C 24 55, 25 35, 33 30 C 39 27, 43 32, 40 45 C 38 52, 38 68, 38 78 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb knuckle line */}
            <path d="M 29 46 C 33 46, 37 47, 39 49" stroke={creaseColor} strokeWidth="2" strokeLinecap="round" />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'b':
        // B: 4 fingers straight up touching, thumb folded across palm
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="58" width="46" height="42" rx="12" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 4 Straight vertical fingers tightly aligned */}
            <rect x="37" y="16" width="10" height="52" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="48" y="12" width="10.5" height="56" rx="5.25" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="59.5" y="14" width="10" height="54" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="70.5" y="22" width="9" height="46" rx="4.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb tucked across palm */}
            <path d="M 26 76 C 24 64, 34 60, 46 64 C 54 66, 62 70, 60 78 C 58 84, 48 84, 40 82 C 34 81, 28 84, 26 76 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="98" width="34" height="18" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'c':
        // C: Hand forming curved C shape
        return (
          <g>
            {/* Wrist */}
            <rect x="22" y="85" width="22" height="30" rx="6" transform="rotate(-20 22 85)" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Upper curve (curved 4 fingers grouped) */}
            <path d="M 36 68 C 30 50, 42 20, 68 20 C 82 20, 94 28, 92 38 C 90 44, 82 44, 78 38 C 72 32, 60 30, 52 42 C 46 52, 48 64, 52 70 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Lower curve (curved thumb) */}
            <path d="M 38 72 C 40 84, 54 94, 72 94 C 84 94, 94 86, 92 78 C 90 72, 82 72, 78 78 C 70 84, 56 82, 50 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Connecting palm arch */}
            <path d="M 36 50 C 30 65, 34 78, 42 84" stroke={creaseColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'd':
        // D: Index finger points straight up, thumb meets other three curled fingers
        return (
          <g>
            {/* Palm base */}
            <rect x="36" y="56" width="46" height="42" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index finger pointing tall and straight up */}
            <rect x="38" y="14" width="12" height="54" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Other 3 fingers curled in an arch */}
            <path d="M 50 56 C 50 42, 68 42, 72 52 C 75 60, 72 70, 65 72 C 58 74, 50 70, 50 56 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb curling to touch tips */}
            <path d="M 28 78 C 24 68, 32 60, 48 62 C 58 64, 66 66, 68 70 C 66 76, 52 76, 42 78 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Hole center representation */}
            <circle cx="60" cy="62" r="5" fill="#FFFFFF" opacity="0.6" />
            {/* Wrist */}
            <rect x="42" y="96" width="34" height="20" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'e':
        // E: All fingers curled tight down with thumb tucked underneath
        return (
          <g>
            {/* Palm */}
            <rect x="34" y="44" width="50" height="52" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Bent finger tips touching pad, showing nails */}
            <rect x="37" y="34" width="10" height="24" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="48" y="32" width="10" height="26" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="59" y="33" width="10" height="25" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="70" y="38" width="9" height="20" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb tucked horizontally below bent fingertips */}
            <path d="M 28 66 C 30 58, 42 56, 60 58 C 72 60, 76 66, 72 72 C 64 76, 48 76, 38 74 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'f':
        // F: Index & Thumb touch forming circle, remaining 3 fingers (middle, ring, pinky) extended up
        return (
          <g>
            {/* Extended Middle, Ring, Pinky */}
            <rect x="52" y="14" width="10.5" height="54" rx="5.25" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="63.5" y="18" width="10" height="50" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="74.5" y="26" width="9" height="42" rx="4.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Palm */}
            <rect x="38" y="60" width="44" height="40" rx="12" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Circle of Index & Thumb */}
            <path d="M 38 52 C 32 46, 26 56, 30 68 C 34 76, 44 76, 48 68 C 50 62, 48 54, 42 52 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="38" cy="62" r="5" fill="#FFFFFF" opacity="0.6" />
            {/* Wrist */}
            <rect x="44" y="98" width="32" height="18" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'g':
        // G: Index and thumb pointing horizontally to the side (parallel pinch)
        return (
          <g>
            {/* Closed fist base */}
            <rect x="25" y="45" width="46" height="46" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled middle, ring, pinky */}
            <rect x="30" y="48" width="22" height="10" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="60" width="22" height="10" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="72" width="20" height="9" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Horizontal Index finger extended */}
            <path d="M 45 40 L 96 40 C 101 40, 101 49, 96 49 L 45 49 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Horizontal Thumb extended parallel below */}
            <path d="M 42 56 L 86 56 C 91 56, 91 65, 86 65 L 42 65 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="16" y="60" width="16" height="30" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'h':
        // H: Index and middle fingers extended together horizontally
        return (
          <g>
            {/* Fist base */}
            <rect x="24" y="44" width="44" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled ring, pinky, thumb over */}
            <rect x="28" y="62" width="22" height="10" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="28" y="74" width="20" height="9" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Two horizontal parallel fingers: Index and Middle */}
            <path d="M 44 38 L 98 38 C 103 38, 103 48, 98 48 L 44 48 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 44 49 L 96 49 C 101 49, 101 59, 96 59 L 44 59 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb folded over */}
            <path d="M 30 52 C 34 46, 46 48, 52 56 C 48 64, 36 64, 30 58 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="14" y="58" width="16" height="32" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'i':
        // I: Pinky upright, others curled into fist with thumb locked over
        return (
          <g>
            {/* Fist base */}
            <rect x="34" y="48" width="48" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled 3 fingers */}
            <rect x="38" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="49" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="60" y="46" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb locked over fingers */}
            <path d="M 28 66 C 26 56, 38 54, 52 56 C 60 58, 62 66, 56 70 C 46 72, 36 74, 28 66 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Pinky extended straight up */}
            <rect x="71" y="16" width="10" height="52" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'j':
        // J: Same as I, with swooping motion arrow drawing J in the air
        return (
          <g>
            {/* Fist & Pinky (same as I) */}
            <rect x="30" y="46" width="44" height="46" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="34" y="42" width="9" height="20" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="44" y="42" width="9" height="20" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="54" y="44" width="9" height="18" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 26 62 C 24 54, 34 52, 46 54 C 54 56, 56 62, 50 66 C 42 68, 32 70, 26 62 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="64" y="18" width="9.5" height="48" rx="4.75" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="38" y="90" width="30" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Motion Arrow: J swooping curve */}
            <path d="M 72 20 C 88 40, 92 82, 70 94 C 56 102, 46 94, 52 86" fill="none" stroke={arrowColor} strokeWidth="3.5" strokeDasharray="4 2" strokeLinecap="round" />
            <polygon points="50,82 56,88 46,92" fill={arrowColor} />
            <text x="82" y="58" fill={arrowColor} fontSize="11" fontWeight="bold" fontFamily="sans-serif">gerak J</text>
          </g>
        );

      case 'k':
        // K: Index straight up, middle angled forward/up, thumb placed between
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="52" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index straight up */}
            <rect x="38" y="14" width="11" height="54" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Middle finger angled / forward */}
            <path d="M 52 48 L 74 22 C 78 18, 86 24, 82 28 L 60 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb tucked in between index and middle */}
            <path d="M 30 72 C 28 60, 36 54, 48 50 C 56 46, 62 48, 58 56 C 54 62, 46 68, 38 72 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ring and pinky folded */}
            <rect x="64" y="56" width="18" height="12" rx="6" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'l':
        // L: Index straight up, thumb opened horizontally 90 degrees
        return (
          <g>
            {/* Palm base */}
            <rect x="38" y="48" width="44" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled middle, ring, pinky */}
            <rect x="50" y="44" width="10" height="24" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="61" y="44" width="10" height="24" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="72" y="48" width="9" height="20" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Vertical Index finger (sharp vertical) */}
            <rect x="38" y="12" width="11" height="56" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Horizontal Thumb extended 90 degrees to the left */}
            <path d="M 44 76 L 12 76 C 6 76, 6 66, 12 66 L 44 66 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* L corner highlight */}
            <path d="M 44 58 L 44 70 L 32 70" fill="none" stroke={creaseColor} strokeWidth="2" />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'm':
        // M: 3 fingers folded down over thumb (thumb peeks through near pinky)
        return (
          <g>
            {/* Palm */}
            <rect x="34" y="46" width="50" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb tucked underneath horizontally */}
            <path d="M 28 66 C 26 58, 40 56, 66 56 C 76 56, 80 62, 76 68 C 68 74, 46 74, 34 72 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Three fingers folded down covering thumb */}
            <rect x="36" y="36" width="12" height="38" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="49" y="34" width="12" height="40" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="36" width="12" height="38" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Folded pinky on side */}
            <rect x="75" y="48" width="9" height="24" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 3 Finger count indicator */}
            <text x="59" y="24" fill={strokeColor} fontSize="11" fontWeight="bold" textAnchor="middle">3 jari di atas</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'n':
        // N: 2 fingers folded down over thumb
        return (
          <g>
            {/* Palm */}
            <rect x="34" y="46" width="50" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb tucked underneath */}
            <path d="M 28 66 C 26 58, 40 56, 58 56 C 66 56, 70 62, 66 68 C 58 74, 44 74, 34 72 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Two fingers folded down covering thumb */}
            <rect x="38" y="34" width="13" height="40" rx="6.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="52" y="34" width="13" height="40" rx="6.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ring and Pinky curled tight */}
            <rect x="66" y="46" width="10" height="24" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="77" y="50" width="8" height="20" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x="52" y="24" fill={strokeColor} fontSize="11" fontWeight="bold" textAnchor="middle">2 jari di atas</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'o':
        // O: All fingers meet thumb tip in a circular O shape
        return (
          <g>
            {/* Palm profile */}
            <rect x="34" y="54" width="32" height="40" rx="10" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curving 4 fingers top arch */}
            <path d="M 38 56 C 36 34, 52 24, 72 26 C 88 28, 92 46, 82 56 C 76 62, 70 60, 68 54 C 74 46, 70 38, 58 38 C 48 38, 46 48, 48 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curving thumb bottom arch meeting fingers */}
            <path d="M 36 68 C 34 84, 50 90, 68 88 C 84 86, 90 70, 82 60 C 78 56, 72 58, 70 64 C 74 72, 68 78, 56 76 C 46 74, 44 68, 44 64 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Circular center hole */}
            <ellipse cx="64" cy="57" rx="11" ry="12" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 2" />
            {/* Wrist */}
            <rect x="38" y="94" width="30" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'p':
        // P: Like K pointing downward
        return (
          <g transform="rotate(180 60 60)">
            {/* K shape flipped upside down */}
            <rect x="36" y="52" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="38" y="14" width="11" height="54" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 52 48 L 74 22 C 78 18, 86 24, 82 28 L 60 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 30 72 C 28 60, 36 54, 48 50 C 56 46, 62 48, 58 56 C 54 62, 46 68, 38 72 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="64" y="56" width="18" height="12" rx="6" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'q':
        // Q: Like G pointing straight down
        return (
          <g transform="rotate(90 60 60)">
            <rect x="25" y="45" width="46" height="46" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="48" width="22" height="10" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="60" width="22" height="10" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="72" width="20" height="9" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 45 40 L 96 40 C 101 40, 101 49, 96 49 L 45 49 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 42 56 L 86 56 C 91 56, 91 65, 86 65 L 42 65 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="16" y="60" width="16" height="30" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'r':
        // R: Index & Middle fingers crossed together vertically
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="54" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Crossed Index and Middle */}
            {/* Middle finger crossing in back/side */}
            <path d="M 42 60 L 58 14 C 61 8, 69 11, 66 17 L 50 62 Z" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index finger crossing in front */}
            <path d="M 54 60 L 40 14 C 37 8, 29 11, 32 17 L 46 62 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Crossed intersection line accent */}
            <path d="M 43 32 L 53 42" stroke={creaseColor} strokeWidth="2" />
            {/* Curled ring and pinky */}
            <rect x="62" y="52" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="73" y="56" width="9" height="16" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb folded over */}
            <path d="M 28 68 C 28 58, 40 56, 54 58 C 60 62, 58 68, 50 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 's':
        // S: Fist with thumb folded across FRONT of all fingers
        return (
          <g>
            {/* Palm/Fist base */}
            <rect x="34" y="44" width="50" height="52" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 4 Curled fingers in fist */}
            <rect x="36" y="38" width="11" height="22" rx="5.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="48" y="36" width="11" height="24" rx="5.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="60" y="37" width="11" height="23" rx="5.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="72" y="42" width="10" height="18" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb boldly folded horizontally across the front */}
            <path d="M 24 64 C 22 52, 34 50, 52 52 C 68 54, 78 56, 76 68 C 74 76, 62 78, 46 76 C 36 74, 26 74, 24 64 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumbnail highlight */}
            <ellipse cx="68" cy="63" rx="4" ry="5" fill="#FFFFFF" opacity="0.6" />
            <text x="60" y="24" fill={strokeColor} fontSize="10" fontWeight="bold" textAnchor="middle">Jempol di Depan</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 't':
        // T: Fist with thumb tucked between index and middle finger
        return (
          <g>
            {/* Fist base */}
            <rect x="34" y="44" width="50" height="52" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled index finger */}
            <rect x="36" y="36" width="12" height="26" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb poking UP between index and middle */}
            <path d="M 44 48 C 42 36, 48 26, 54 26 C 60 26, 64 36, 60 48 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Middle, ring, pinky fingers */}
            <rect x="58" y="36" width="11" height="24" rx="5.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="70" y="40" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'u':
        // U: Index & Middle fingers straight up and tightly joined together
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="54" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index & Middle held together without gap */}
            <rect x="43" y="14" width="11" height="54" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="54" y="14" width="11" height="54" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="54" y1="20" x2="54" y2="60" stroke={creaseColor} strokeWidth="2" />
            {/* Curled ring and pinky */}
            <rect x="68" y="52" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="78" y="56" width="8" height="18" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb locking fingers */}
            <path d="M 28 68 C 26 58, 38 56, 52 58 C 58 62, 56 68, 48 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x="60" y="24" fill={strokeColor} fontSize="10" fontWeight="bold" textAnchor="middle">2 Jari Rapat</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'v':
        // V: Index & Middle spread apart in peace sign
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="54" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index angled left */}
            <path d="M 44 58 L 26 18 C 23 12, 31 8, 36 14 L 54 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Middle angled right */}
            <path d="M 52 56 L 72 14 C 76 8, 85 12, 82 18 L 62 58 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled ring and pinky */}
            <rect x="66" y="54" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="76" y="58" width="8" height="16" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb locking */}
            <path d="M 32 68 C 30 58, 42 56, 52 58 C 56 62, 54 68, 46 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'w':
        // W: Index, Middle, and Ring fingers extended spread apart
        return (
          <g>
            {/* Palm */}
            <rect x="36" y="54" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 3 Fingers spread like W */}
            <path d="M 42 58 L 25 18 C 21 12, 29 8, 34 14 L 50 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="49" y="12" width="11" height="54" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 58 56 L 76 14 C 80 8, 88 12, 85 18 L 66 58 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled pinky and thumb */}
            <rect x="74" y="56" width="9" height="18" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 32 68 C 30 58, 44 58, 54 62 C 54 68, 46 72, 38 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'x':
        // X: Index bent like a hook, others in fist
        return (
          <g>
            {/* Fist base */}
            <rect x="34" y="46" width="48" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled 3 fingers */}
            <rect x="48" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="59" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="70" y="48" width="9" height="18" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index bent into hook */}
            <path d="M 36 54 L 36 28 C 36 20, 52 20, 52 30 C 52 38, 44 42, 44 48" fill="none" stroke={strokeColor} strokeWidth={strokeWidth + 4} strokeLinecap="round" />
            <path d="M 36 54 L 36 28 C 36 20, 52 20, 52 30 C 52 38, 44 42, 44 48" fill="none" stroke={handSkin} strokeWidth={strokeWidth + 1} strokeLinecap="round" />
            {/* Thumb */}
            <path d="M 28 66 C 26 56, 38 54, 50 56 C 54 60, 52 66, 44 70 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x="60" y="24" fill={strokeColor} fontSize="10" fontWeight="bold" textAnchor="middle">Kait Telunjuk</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'y':
        // Y: Thumb & Pinky extended wide, middle 3 curled (Hang Loose)
        return (
          <g>
            {/* Fist base */}
            <rect x="36" y="48" width="44" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 3 Curled fingers in center */}
            <rect x="44" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="55" y="44" width="10" height="22" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="65" y="46" width="9" height="20" rx="4.5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Thumb stretched far to the left */}
            <path d="M 44 68 L 14 52 C 8 48, 14 38, 20 42 L 46 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Pinky stretched far to the right */}
            <path d="M 68 58 L 96 36 C 102 32, 108 42, 102 46 L 76 70 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'z':
        // Z: Index finger tracing a Z pattern in the air with motion arrows
        return (
          <g>
            {/* Fist base */}
            <rect x="24" y="52" width="40" height="42" rx="12" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled fingers & thumb */}
            <rect x="36" y="50" width="8" height="18" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="45" y="50" width="8" height="18" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="54" y="52" width="8" height="16" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 22 66 C 24 58, 34 58, 44 60 C 44 66, 36 70, 26 70 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Extended Index pointing up-right */}
            <path d="M 32 54 L 54 22 C 58 16, 66 22, 62 28 L 42 60 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Motion Arrow: Z path */}
            <path d="M 55 18 L 88 18 L 62 48 L 95 48" fill="none" stroke={arrowColor} strokeWidth="3" strokeDasharray="4 2" strokeLinecap="round" />
            <polygon points="98,48 90,44 92,52" fill={arrowColor} />
            <text x="82" y="36" fill={arrowColor} fontSize="11" fontWeight="bold" fontFamily="sans-serif">gerak Z</text>
            {/* Wrist */}
            <rect x="28" y="92" width="28" height="20" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      // COMMON VOCABULARY SIGNS
      case 'halo':
        // Halo: Open palm at temple moving outward with waving motion arrow
        return (
          <g>
            {/* Head silhouette hint */}
            <circle cx="34" cy="62" r="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Open Palm near temple */}
            <rect x="52" y="44" width="34" height="36" rx="10" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="54" y="14" width="8" height="34" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="63" y="10" width="8" height="38" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="72" y="12" width="8" height="36" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="81" y="20" width="7" height="28" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 44 54 C 42 46, 48 42, 54 44 L 54 58 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Motion Arrow waving out */}
            <path d="M 88 28 C 98 28, 104 36, 106 48" fill="none" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="3 2" />
            <polygon points="108,52 102,44 110,44" fill={arrowColor} />
            <text x="64" y="105" fill={arrowColor} fontSize="11" fontWeight="bold" textAnchor="middle">Lambaian Ramah</text>
          </g>
        );

      case 'terima-kasih':
        // Terima Kasih: Fingertips touch chin/mouth moving straight forward
        return (
          <g>
            {/* Face chin profile */}
            <path d="M 20 20 C 35 20, 42 42, 36 60 C 30 76, 20 80, 16 80" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Hand flat at chin moving forward */}
            <rect x="36" y="42" width="46" height="32" rx="10" transform="rotate(-15 36 42)" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 40 40 L 76 30 C 80 29, 82 35, 78 37 L 44 48 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 38 48 L 74 38 C 78 37, 80 43, 76 45 L 42 56 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Forward Motion Arrow */}
            <path d="M 75 42 L 108 42" fill="none" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="3 2" />
            <polygon points="112,42 104,37 104,47" fill={arrowColor} />
            <text x="70" y="98" fill={arrowColor} fontSize="11" fontWeight="bold" textAnchor="middle">Maju dari Dagu</text>
          </g>
        );

      case 'sama-sama':
        // Sama-sama: Both open palms facing up
        return (
          <g>
            {/* Left open palm */}
            <rect x="18" y="48" width="36" height="30" rx="8" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="22" y="24" width="7" height="26" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="30" y="22" width="7" height="28" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="38" y="26" width="7" height="24" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Right open palm */}
            <rect x="66" y="48" width="36" height="30" rx="8" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="74" y="26" width="7" height="24" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="82" y="22" width="7" height="28" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="90" y="24" width="7" height="26" rx="3.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x="60" y="98" fill={arrowColor} fontSize="11" fontWeight="bold" textAnchor="middle">Dua Telapak Terbuka</text>
          </g>
        );

      case 'tolong':
        // Tolong: Left palm open upward, right hand placed on it moving forward together
        return (
          <g>
            {/* Lower supporting palm */}
            <rect x="24" y="66" width="70" height="20" rx="8" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Upper helping hand resting on top */}
            <rect x="36" y="38" width="48" height="30" rx="10" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="42" y="16" width="8" height="26" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="52" y="12" width="8" height="30" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="16" width="8" height="26" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Forward arrow */}
            <path d="M 88 52 L 110 52" fill="none" stroke={arrowColor} strokeWidth="3" strokeDasharray="3 2" />
            <polygon points="113,52 106,48 106,56" fill={arrowColor} />
            <text x="60" y="104" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Maju Bersama</text>
          </g>
        );

      case 'maaf':
        // Maaf: Closed fist (A/S) circling over left chest
        return (
          <g>
            {/* Chest outline */}
            <path d="M 25 30 Q 60 45 95 30 L 95 90 Q 60 98 25 90 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
            {/* Heart symbol on chest */}
            <path d="M 45 42 A 5 5 0 0 1 55 42 A 5 5 0 0 1 65 42 Q 65 52 55 60 Q 45 52 45 42 Z" fill="#FCA5A5" opacity="0.6" />
            {/* Fist over chest */}
            <rect x="40" y="44" width="38" height="36" rx="12" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="44" y="40" width="8" height="14" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="53" y="40" width="8" height="14" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="42" width="8" height="12" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 34 54 C 36 46, 44 46, 58 48 C 64 52, 60 58, 48 60 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Circular motion arrow */}
            <path d="M 32 58 A 28 28 0 1 1 76 74" fill="none" stroke={arrowColor} strokeWidth="3" strokeDasharray="3 2" strokeLinecap="round" />
            <polygon points="76,80 72,70 80,72" fill={arrowColor} />
            <text x="60" y="104" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Putar di Dada</text>
          </g>
        );

      case 'nama':
        // Nama: Both hands form 'H', right hand tapping twice onto left hand
        return (
          <g>
            {/* Left Hand H */}
            <rect x="22" y="50" width="30" height="24" rx="6" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="46" y="52" width="36" height="8" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="46" y="62" width="36" height="8" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Right Hand H tapping on top */}
            <rect x="42" y="24" width="30" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="36" y="42" width="44" height="8" rx="4" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Tapping action ripples */}
            <path d="M 72 38 L 82 34" stroke={arrowColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 74 44 L 84 44" stroke={arrowColor} strokeWidth="2.5" strokeLinecap="round" />
            <text x="60" y="98" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Ketuk Silang 2x</text>
          </g>
        );

      case 'saya':
        // Saya: Index finger points to one's own chest
        return (
          <g>
            {/* Body silhouette */}
            <path d="M 20 40 Q 60 55 100 40 L 96 100 Q 60 108 24 100 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
            {/* Hand pointing to chest */}
            <rect x="52" y="50" width="38" height="34" rx="10" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Pointing Index pointing towards left/chest */}
            <path d="M 54 58 L 22 58 C 16 58, 16 48, 22 48 L 54 48 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Pointing indicator arrow */}
            <polygon points="18,53 26,47 26,59" fill={arrowColor} />
            <text x="60" y="104" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Tunjuk ke Dada</text>
          </g>
        );

      case 'kamu':
        // Kamu: Index finger pointing straight toward interlocutor (viewer)
        return (
          <g>
            {/* Fist facing forward */}
            <circle cx="60" cy="64" r="28" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Curled fingers facing forward */}
            <ellipse cx="60" cy="74" rx="16" ry="8" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Index pointing straight forward directly at screen (circle foreshortened) */}
            <circle cx="60" cy="46" r="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="60" cy="44" r="8" fill="#FFFFFF" opacity="0.6" />
            {/* Target outward arrow */}
            <path d="M 60 26 L 60 10" fill="none" stroke={arrowColor} strokeWidth="3" strokeDasharray="3 2" />
            <polygon points="60,6 55,14 65,14" fill={arrowColor} />
            <text x="60" y="106" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Tunjuk Lawan Bicara</text>
          </g>
        );

      case 'kabar-baik':
        // Baik: Thumbs up (Jempol mantap)
        return (
          <g>
            {/* Fist base */}
            <rect x="36" y="50" width="46" height="46" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* 4 Curled fingers */}
            <rect x="40" y="52" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="51" y="52" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="54" width="10" height="18" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="73" y="58" width="8" height="14" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Strong vertical Thumb Up */}
            <path d="M 28 68 C 24 56, 26 30, 36 20 C 44 14, 52 20, 48 38 C 44 48, 42 64, 44 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Star badge of goodness */}
            <circle cx="37" cy="18" r="6" fill="#F59E0B" />
            <text x="60" y="108" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Jempol Mantap</text>
            {/* Wrist */}
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'ya':
        // Ya: Fist nodding up and down
        return (
          <g>
            <rect x="36" y="52" width="46" height="46" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="40" y="54" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="51" y="54" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="56" width="10" height="18" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="73" y="60" width="8" height="14" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 28 66 C 26 56, 36 50, 48 54 L 48 74 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 60 22 L 60 40 M 60 40 L 54 34 M 60 40 L 66 34" stroke={arrowColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="60" y="110" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Angguk Kepalan</text>
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'tidak':
        // Tidak: Index finger shaking left-right
        return (
          <g>
            <rect x="36" y="56" width="46" height="42" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="42" y="16" width="11" height="52" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="55" y="56" width="9.5" height="18" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="66" y="58" width="9" height="16" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="76" y="62" width="8" height="14" rx="4" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 28 26 L 68 26 M 34 20 L 28 26 L 34 32 M 62 20 L 68 26 L 62 32" stroke={arrowColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="60" y="110" fill={arrowColor} fontSize="10" fontWeight="bold" textAnchor="middle">Geleng Telunjuk</text>
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'sayang':
        // ILY / Sayang: Thumb, Index, Pinky extended
        return (
          <g>
            <rect x="36" y="54" width="46" height="44" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="38" y="16" width="11" height="52" rx="5.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="51" y="56" width="10" height="20" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62" y="58" width="10" height="18" rx="5" fill={handSkinDark} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="73" y="24" width="9" height="46" rx="4.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 20 62 C 16 48, 20 34, 30 30 C 38 28, 40 38, 38 48 L 38 68 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x="60" y="110" fill="#E11D48" fontSize="10" fontWeight="bold" textAnchor="middle">I Love You</text>
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      default:
        // Generic hand shape
        return (
          <g>
            <rect x="38" y="48" width="44" height="48" rx="14" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="40" y="16" width="10" height="42" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="51" y="12" width="10.5" height="46" rx="5.25" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="62.5" y="14" width="10" height="44" rx="5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="73.5" y="22" width="9" height="36" rx="4.5" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 26 66 C 24 54, 34 50, 46 54 L 46 72 Z" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="42" y="94" width="34" height="22" rx="6" fill={handSkin} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        className={`w-full h-full drop-shadow-xs transition-transform duration-200 ${
          animate ? 'hover:scale-105' : ''
        }`}
      >
        {/* Soft background glow */}
        <circle cx="60" cy="60" r="54" fill="#F8FAFC" />
        <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        {renderSignGraphics()}
      </svg>
    </div>
  );
};
