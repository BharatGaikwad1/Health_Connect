import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export default function IcuBedSvg({ 
  size = 20, 
  color = '#6366F1', 
  accent = '#10B981',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Bed Headboard */}
      <Path
        d="M2 10V18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Bed Footboard */}
      <Path
        d="M22 13V18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Articulated ICU Patient Mattress Frame (Angled Backrest) */}
      <Path
        d="M2 14.5L7.5 12.5H21.5V15H2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.12"
      />
      {/* Patient Pillow */}
      <Rect
        x="4.2"
        y="11.5"
        width="4"
        height="2.2"
        rx="1"
        transform="rotate(-15 4.2 11.5)"
        fill={color}
      />
      {/* Bed Base & Wheels */}
      <Line x1="4" y1="18" x2="4" y2="19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="20" y1="18" x2="20" y2="19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="4" cy="20" r="0.8" fill={color} />
      <Circle cx="20" cy="20" r="0.8" fill={color} />

      {/* Bedside Cardiac ICU Monitor Screen */}
      <Rect
        x="13"
        y="3"
        width="8.5"
        height="6.5"
        rx="1.5"
        stroke={color}
        strokeWidth="1.4"
        fill="#0F172A"
      />
      {/* Monitor Stand */}
      <Path d="M17.2 9.5V12.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* Live ECG Vitals Waveform on Monitor */}
      <Path
        d="M14.5 6.2H15.8L16.5 4.5L17.5 8L18.3 5.5L18.8 6.2H20"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
