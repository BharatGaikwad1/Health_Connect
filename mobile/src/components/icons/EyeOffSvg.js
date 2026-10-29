import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function EyeOffSvg({ size = 24, color = '#64748B', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9.88 9.88C9.33 10.43 9 11.18 9 12C9 13.66 10.34 15 12 15C12.82 15 13.57 14.67 14.12 14.12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M3 3L21 21"
        stroke={color}
        strokeWidth={strokeWidth + 0.2}
        strokeLinecap="round"
      />
      <Path
        d="M10.73 5.08C11.15 5.03 11.57 5 12 5C16.5 5 20.2 7.8 22 13C21.27 15.08 19.98 16.82 18.3 18.06"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M6.61 6.61C4.62 7.88 3.08 9.77 2 13C3.8 18.2 7.5 21 12 21C13.68 21 15.26 20.61 16.69 19.92"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
