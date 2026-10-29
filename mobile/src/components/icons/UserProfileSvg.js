import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function UserProfileSvg({ 
  size = 24, 
  color = '#2563EB', 
  secondaryColor,
  ...props 
}) {
  const accent = secondaryColor || color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Head circle */}
      <Circle 
        cx="12" 
        cy="7.5" 
        r="4.2" 
        fill={color} 
        fillOpacity="0.18" 
        stroke={color} 
        strokeWidth="1.8" 
      />
      {/* Curved shoulders */}
      <Path
        d="M4 20.5C4 16.91 7.13 14 11 14H13C16.87 14 20 16.91 20 20.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Health Plus Badge on chest */}
      <Path
        d="M12 16.8V19.2M10.8 18H13.2"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
