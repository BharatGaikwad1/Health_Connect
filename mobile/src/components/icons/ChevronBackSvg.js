import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ChevronBackSvg({ size = 24, color = '#1E293B', strokeWidth = 2.4, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M15 19L8 12L15 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
