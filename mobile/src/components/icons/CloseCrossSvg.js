import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function CloseCrossSvg({ size = 24, color = '#64748B', circled = false, strokeWidth = 2.2, ...props }) {
  if (circled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        <Circle cx="12" cy="12" r="9.5" fill={color} opacity={0.15} />
        <Path
          d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
