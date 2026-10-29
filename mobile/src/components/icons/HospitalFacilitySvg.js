import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function HospitalFacilitySvg({ 
  size = 22, 
  color = '#2563EB', 
  crossColor = '#EF4444',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Main Hospital Center Tower */}
      <Rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
        fill={color}
        fillOpacity="0.08"
      />

      {/* Red Cross on Rooftop Entrance */}
      <Path
        d="M11 2H13V4H15V6H13V8H11V6H9V4H11V2Z"
        fill={crossColor}
      />

      {/* Hospital Clinical Windows Grid */}
      <Rect x="5.5" y="8" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="9.5" y="8" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="13.5" y="8" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="17.5" y="8" width="2.2" height="2" rx="0.5" fill={color} />

      <Rect x="5.5" y="12" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="9.5" y="12" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="13.5" y="12" width="2.2" height="2" rx="0.5" fill={color} />
      <Rect x="17.5" y="12" width="2.2" height="2" rx="0.5" fill={color} />

      {/* Ground Floor Emergency Double Doors */}
      <Path
        d="M9.5 21V16.5H14.5V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
