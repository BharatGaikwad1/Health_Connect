import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function EyeSvg({ size = 24, color = '#64748B', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2 12C3.8 6.8 7.5 4 12 4C16.5 4 20.2 6.8 22 12C20.2 17.2 16.5 20 12 20C7.5 20 3.8 17.2 2 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="12"
        r="3.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}
