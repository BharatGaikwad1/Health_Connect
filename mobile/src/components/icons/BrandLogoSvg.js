import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function BrandLogoSvg({ 
  size = 28, 
  primaryColor = '#2563EB', 
  secondaryColor = '#06B6D4',
  accentColor = '#FFFFFF',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="brandGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={primaryColor} />
          <Stop offset="100%" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient id="crossGlow" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      {/* Rounded Super-ellipse Shield Base */}
      <Rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="14"
        fill="url(#brandGrad)"
      />

      {/* Subtle Inner Border Glow */}
      <Rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="13"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Medical Cross Foundation */}
      <Path
        d="M21 12H27C27.55 12 28 12.45 28 13V20H35C35.55 20 36 20.45 36 21V27C36 27.55 35.55 28 35 28H28V35C28 35.55 27.55 36 27 36H21C20.45 36 20 35.55 20 35V28H13C12.45 28 12 27.55 12 27V21C12 20.45 12.45 20 13 20H20V13C20 12.45 20.45 12 21 12Z"
        fill="url(#crossGlow)"
        fillOpacity="0.22"
      />

      {/* Dynamic ECG Vital Pulse Lifeline across the center */}
      <Path
        d="M10 24.5H16L19 17L23.5 32L28 20L31 25.5H38"
        stroke={accentColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vital Pulse Dot */}
      <Circle cx="38" cy="24.5" r="2.2" fill={accentColor} />
    </Svg>
  );
}
