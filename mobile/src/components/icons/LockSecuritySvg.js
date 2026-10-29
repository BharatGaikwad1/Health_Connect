import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function LockSecuritySvg({ 
  size = 20, 
  color = '#2563EB', 
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Curved Padlock Shackle */}
      <Path
        d="M7 10V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Solid Vault Body */}
      <Rect
        x="4"
        y="10"
        width="16"
        height="12"
        rx="3"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="1.8"
      />
      {/* Precision Keyhole */}
      <Circle cx="12" cy="15" r="1.5" fill={color} />
      <Path
        d="M12 16.5V18.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}
