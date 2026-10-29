import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function AlertTriangleSvg({ size = 24, color = '#E11D48', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 3.5L21.5 19.5C21.9 20.2 21.4 21 20.6 21H3.4C2.6 21 2.1 20.2 2.5 19.5L12 3.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9V14"
        stroke={color}
        strokeWidth={strokeWidth + 0.4}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17.2" r="1.1" fill={color} />
    </Svg>
  );
}
