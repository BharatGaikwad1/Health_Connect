import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CloudUploadSvg({ size = 24, color = '#2563EB', strokeWidth = 2, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16 16L12 12M12 12L8 16M12 12V21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.39 18.39A5 5 0 0 0 18 9H16.74A8 8 0 1 0 4.26 15.61"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
