import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function InfoCircleSvg({ size = 24, color = '#2563EB', strokeWidth = 2, ...props }) {
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
        d="M12 11V16M12 7.8V8"
        stroke={color}
        strokeWidth={strokeWidth + 0.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}
