import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function NavigationArrowSvg({ size = 24, color = '#2563EB', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 11.5L21 3L12.5 21L10.5 13.5L3 11.5Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 13.5L21 3"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
