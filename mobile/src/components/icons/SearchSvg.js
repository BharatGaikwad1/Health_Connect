import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SearchSvg({ size = 24, color = '#64748B', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 20L16 16"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9.5" cy="8.5" r="1.5" fill={color} opacity={0.35} />
    </Svg>
  );
}
