import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function ClockTimeSvg({ size = 24, color = '#2563EB', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle
        cx="12"
        cy="12"
        r="9.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M12 7V12L15.5 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
