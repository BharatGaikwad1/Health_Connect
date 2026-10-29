import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function BellNotificationSvg({ size = 24, color = '#D97706', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21A2 2 0 0 1 10.27 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="18" cy="6" r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
    </Svg>
  );
}
