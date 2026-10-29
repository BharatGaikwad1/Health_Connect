import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function BedRosterGridSvg({ 
  size = 24, 
  color = '#2563EB', 
  secondaryColor = '#3B82F6',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Bed Headboard */}
      <Path
        d="M3 7V19M3 15H21M21 11V19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Patient Pillow */}
      <Rect
        x="5.5"
        y="11"
        width="4"
        height="3"
        rx="1"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Mattress Blanket Outline */}
      <Path
        d="M10.5 13.5H19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Bed Side Protective Guard Rail */}
      <Path
        d="M6 8.5H14C14.55 8.5 15 8.95 15 9.5V11"
        stroke={secondaryColor}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Wheels */}
      <Circle cx="4.5" cy="19.5" r="1.2" fill={color} />
      <Circle cx="19.5" cy="19.5" r="1.2" fill={color} />
    </Svg>
  );
}
