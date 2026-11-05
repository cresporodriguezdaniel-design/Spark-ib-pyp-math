import React from 'react';

export interface SparkSkills {
  logicalReasoning: number;
  problemSolving: number;
  numericalThinking: number;
  patternRecognition: number;
  spatialReasoning: number;
  creativity: number;
  perseverance: number;
}

interface SparkRadarChartProps {
  skills: SparkSkills;
  classAverages?: SparkSkills;
  title?: string;
}

export const SparkRadarChart: React.FC<SparkRadarChartProps> = ({
  skills,
  classAverages,
  title,
}) => {
  const size = 320;
  const center = size / 2;
  const radius = 105;

  const axes = [
    { key: 'logicalReasoning', label: 'Logical & Math Reasoning', desc: 'Constructs logical arguments' },
    { key: 'problemSolving', label: 'Problem-Solving', desc: 'Selects effective strategies' },
    { key: 'numericalThinking', label: 'Numerical Thinking', desc: 'Beyond memorizing algorithms' },
    { key: 'patternRecognition', label: 'Pattern & Abstract', desc: 'Discovers general rules' },
    { key: 'spatialReasoning', label: 'Spatial Reasoning', desc: 'Manipulates shapes & dimensions' },
    { key: 'creativity', label: 'Creativity & Divergent', desc: 'Explores multiple strategies' },
    { key: 'perseverance', label: 'Perseverance & Metacognition', desc: 'Faces challenges & reflects' },
  ];

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getPolygonPoints = (data: SparkSkills) => {
    return axes
      .map((axis, i) => {
        const val = data[axis.key as keyof SparkSkills] || 0;
        const { x, y } = getCoordinates(val, i, axes.length);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
      {title && (
        <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
          {title}
        </div>
      )}
      <div className="text-[10px] text-slate-400 mb-3 text-center">
        SPARK — A System for the Development of Mathematical Skills and Aptitudes
      </div>

      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric Heptagons */}
          {levels.map((level, lvlIdx) => {
            const pts = axes
              .map((_, i) => {
                const { x, y } = getCoordinates(level * 100, i, axes.length);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={lvlIdx}
                points={pts}
                fill="none"
                stroke="#334155"
                strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
                strokeDasharray={lvlIdx === levels.length - 1 ? 'none' : '3 3'}
              />
            );
          })}

          {/* Axis Radiating Lines */}
          {axes.map((_, i) => {
            const { x, y } = getCoordinates(100, i, axes.length);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
              />
            );
          })}

          {/* Class Average Polygon (if provided) */}
          {classAverages && (
            <polygon
              points={getPolygonPoints(classAverages)}
              fill="#38bdf8"
              fillOpacity="0.15"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Student/Main Skills Polygon */}
          <polygon
            points={getPolygonPoints(skills)}
            fill="#ec4899"
            fillOpacity="0.35"
            stroke="#ec4899"
            strokeWidth="2.5"
          />

          {/* Vertices Dots */}
          {axes.map((axis, i) => {
            const val = skills[axis.key as keyof SparkSkills] || 0;
            const { x, y } = getCoordinates(val, i, axes.length);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#f43f5e"
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Axis Labels positioned around */}
        {axes.map((axis, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
          const labelRadius = radius + 32;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);

          // Determine text alignment based on x position relative to center
          let textAlign = 'text-center';
          let transform = 'translate(-50%, -50%)';

          return (
            <div
              key={axis.key}
              className="absolute text-[10px] font-bold text-slate-300 pointer-events-none max-w-[90px] leading-tight text-center"
              style={{
                left: `calc(50% + ${labelRadius * Math.cos(angle)}px)`,
                top: `calc(50% + ${labelRadius * Math.sin(angle)}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="text-white font-black drop-shadow-xs">{axis.label}</div>
              <div className="text-rose-400 font-mono text-[9px]">
                {skills[axis.key as keyof SparkSkills]}%
              </div>
            </div>
          );
        })}
      </div>

      {classAverages && (
        <div className="flex items-center gap-4 mt-3 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-pink-500/60 border border-pink-400 rounded-xs inline-block"></span>
            <span className="text-pink-300">Student Profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-sky-400/30 border border-sky-400 rounded-xs inline-block"></span>
            <span className="text-sky-300">Class Average</span>
          </div>
        </div>
      )}
    </div>
  );
};
