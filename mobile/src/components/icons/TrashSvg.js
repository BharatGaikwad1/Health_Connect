import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function TrashSvg({ size = 24, color = '#E11D48', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 6H21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path d="M10 11V17M14 11V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
