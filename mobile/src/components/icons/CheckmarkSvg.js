import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function CheckmarkSvg({ size = 24, color = '#10B981', circled = false, strokeWidth = 2.4, ...props }) {
  if (circled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        <Circle cx="12" cy="12" r="9.5" fill={color} />
        <Path
          d="M8 12.2L10.7 14.8L16 9.5"
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M4.5 12.5L9.5 17.5L19.5 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
