import React from "react";
import { Circle, Ellipse, G, Line, Path, Svg } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function AkashicSymbol({ size = 80, color = "#c9a840" }: Props) {
  const half = size / 2;

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Outer glow ring */}
      <Circle cx={40} cy={40} r={37} fill="none" stroke={color} strokeWidth={0.4} opacity={0.2} />
      <Circle cx={40} cy={40} r={33} fill="none" stroke={color} strokeWidth={0.3} opacity={0.15} />

      {/* 8 outer lotus petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <G key={`op${angle}`} rotation={angle} origin="40,40">
          <Ellipse
            cx={40}
            cy={19}
            rx={5.5}
            ry={16}
            fill="rgba(201,168,64,0.08)"
            stroke={color}
            strokeWidth={0.7}
            opacity={0.7}
          />
        </G>
      ))}

      {/* 8 inner lotus petals */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
        <G key={`ip${angle}`} rotation={angle} origin="40,40">
          <Ellipse
            cx={40}
            cy={27}
            rx={4}
            ry={11}
            fill="rgba(201,168,64,0.15)"
            stroke={color}
            strokeWidth={0.6}
            opacity={0.8}
          />
        </G>
      ))}

      {/* Inner ring */}
      <Circle cx={40} cy={40} r={12} fill="rgba(201,168,64,0.06)" stroke={color} strokeWidth={0.8} opacity={0.6} />

      {/* Eye of Akasha — horizontal almond */}
      <Path
        d="M28,40 Q34,33 40,33 Q46,33 52,40 Q46,47 40,47 Q34,47 28,40 Z"
        fill="rgba(201,168,64,0.12)"
        stroke={color}
        strokeWidth={0.9}
        opacity={0.9}
      />

      {/* Iris */}
      <Circle cx={40} cy={40} r={5} fill="none" stroke={color} strokeWidth={0.9} opacity={0.9} />

      {/* Pupil */}
      <Circle cx={40} cy={40} r={2.2} fill={color} opacity={0.95} />

      {/* Centre glow */}
      <Circle cx={40} cy={40} r={8} fill={color} opacity={0.06} />

      {/* 8 tiny dot accents on outer ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 40 + 37 * Math.cos(rad);
        const y = 40 + 37 * Math.sin(rad);
        return <Circle key={`dot${angle}`} cx={x} cy={y} r={0.8} fill={color} opacity={0.4} />;
      })}
    </Svg>
  );
}
