import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export default function VentilatorSvg({ 
  size = 20, 
  color = '#8B5CF6', 
  oxygenColor = '#06B6D4',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Mobile Cart Stand Frame */}
      <Rect
        x="6"
        y="5"
        width="11"
        height="10"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
        fill={color}
        fillOpacity="0.1"
      />
      {/* Digital Ventilator Display Window */}
      <Rect
        x="8"
        y="7"
        width="7"
        height="4"
        rx="1"
        fill="#0F172A"
      />
      {/* Respiratory Pressure Waveform */}
      <Path
        d="M9 9H10L10.8 7.8L11.8 10L12.5 8.5L13 9H14"
        stroke={oxygenColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Control Dial Knobs */}
      <Circle cx="9.5" cy="12.5" r="0.8" fill={color} />
      <Circle cx="12" cy="12.5" r="0.8" fill={color} />
      <Circle cx="14.5" cy="12.5" r="0.8" fill={color} />

      {/* Cart Pole & Wheeled Base */}
      <Line x1="11.5" y1="15" x2="11.5" y2="19" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="6.5" y1="19" x2="16.5" y2="19" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="7.5" cy="20.5" r="1" fill={color} />
      <Circle cx="15.5" cy="20.5" r="1" fill={color} />

      {/* Breathing Delivery Circuit (Oxygen Tube Arcing Outward) */}
      <Path
        d="M17 9.5C19.5 9.5 21 11 21 13.5C21 16 19.5 17 18 17"
        stroke={oxygenColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />
      {/* Patient Mask Adapter Tip */}
      <Circle cx="17.5" cy="17" r="1.2" fill={oxygenColor} />

      {/* Oxygen Cylinder Outline on Left Side */}
      <Path
        d="M4.5 9C4.5 7.5 5 7.5 5 7.5V17H3.5V9H4.5Z"
        stroke={oxygenColor}
        strokeWidth="1.2"
        fill={oxygenColor}
        fillOpacity="0.2"
      />
    </Svg>
  );
}
