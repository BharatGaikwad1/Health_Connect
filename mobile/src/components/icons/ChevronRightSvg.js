import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ChevronRightSvg({ size = 24, color = '#64748B', strokeWidth = 2.4, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 5L16 12L9 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
