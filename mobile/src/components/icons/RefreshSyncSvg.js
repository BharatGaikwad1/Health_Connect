import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function RefreshSyncSvg({ size = 24, color = '#2563EB', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M20 4V9H15"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 20V15H9"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.6 15C17.5 18 14.5 20.2 11 20C7 19.8 3.7 16.7 3.5 12.7C3.3 9.7 4.9 7 7.5 5.7L20 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
