import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function LocationPinSvg({ size = 24, color = '#2563EB', innerColor = '#FFFFFF', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 21.5C12 21.5 19 15.5 19 9.5C19 5.634 15.866 2.5 12 2.5C8.134 2.5 5 5.634 5 9.5C5 15.5 12 21.5 12 21.5Z"
        fill={color}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9.5" r="3.2" fill={innerColor} />
    </Svg>
  );
}
