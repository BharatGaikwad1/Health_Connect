import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MinusRemoveSvg({ size = 24, color = '#2563EB', strokeWidth = 2.5, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5 12H19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
