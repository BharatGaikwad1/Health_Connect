import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function AdminShieldHqSvg({ 
  size = 24, 
  color = '#7C3AED', 
  secondaryColor = '#A78BFA',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Outer Regulatory Defense Shield */}
      <Path
        d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22.5C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
        fill={color}
        fillOpacity="0.16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Classical Administrative Pediment / Roof */}
      <Path
        d="M8 9.5L12 7L16 9.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Administrative Authority Columns */}
      <Rect x="8.5" y="10.5" width="1.6" height="4.5" rx="0.5" fill={color} />
      <Rect x="11.2" y="10.5" width="1.6" height="4.5" rx="0.5" fill={color} />
      <Rect x="13.9" y="10.5" width="1.6" height="4.5" rx="0.5" fill={color} />
      {/* Plinth Base */}
      <Path
        d="M7.5 16H16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Verification Check Badge at the Shield apex/center */}
      <Path
        d="M10 18.5L11.5 20L14.5 17"
        stroke={secondaryColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
