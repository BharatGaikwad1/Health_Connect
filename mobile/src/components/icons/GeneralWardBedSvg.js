import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export default function GeneralWardBedSvg({ 
  size = 20, 
  color = '#2563EB', 
  pillowColor = '#93C5FD',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* High Headboard */}
      <Path
        d="M3 6V18.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Low Footboard */}
      <Path
        d="M21 11V18.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Primary Bed Mattress */}
      <Rect
        x="3"
        y="12.5"
        width="18"
        height="3"
        rx="1"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="1.6"
      />

      {/* Patient Pillow */}
      <Rect
        x="5.5"
        y="9.8"
        width="4.5"
        height="2.7"
        rx="1"
        fill={pillowColor}
      />

      {/* Protective Safety Side Rail */}
      <Path
        d="M11 11.5H19"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Line x1="13" y1="11.5" x2="13" y2="12.5" stroke={color} strokeWidth="1.2" />
      <Line x1="17" y1="11.5" x2="17" y2="12.5" stroke={color} strokeWidth="1.2" />

      {/* Sturdy Leg Supports & Castors */}
      <Line x1="4.5" y1="15.5" x2="4.5" y2="19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="19.5" y1="15.5" x2="19.5" y2="19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="4.5" cy="20.2" r="0.9" fill={color} />
      <Circle cx="19.5" cy="20.2" r="0.9" fill={color} />

      {/* Hospital IV Drip Stand Pole on Head Side */}
      <Path
        d="M2 3V6M1 3H3"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* IV Infusion Fluid Bag */}
      <Rect
        x="1.2"
        y="4"
        width="1.6"
        height="2.5"
        rx="0.5"
        fill="#38BDF8"
      />
    </Svg>
  );
}
