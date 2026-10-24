import React, { useState } from 'react';
import { formatPaise } from '../utils/money';

export function CashFlowChart({ weeks = [], safetyBufferPaise = 20000000 }) {
  const [hoveredWeek, setHoveredWeek] = useState(null);

  if (!weeks || weeks.length === 0) return null;

  // Find min and max closing cash to scale Y-axis
  const closingValues = weeks.map((w) => w.closingCashPaise);
  const minVal = Math.min(...closingValues, safetyBufferPaise * 0.5);
  const maxVal = Math.max(...closingValues, safetyBufferPaise * 2.5);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinate mapping
  const getX = (index) => paddingLeft + (index / (weeks.length - 1)) * chartWidth;
  const getY = (valPaise) => paddingTop + chartHeight - ((valPaise - minVal) / range) * chartHeight;

  // Points for closing cash line
  const points = weeks.map((w, idx) => ({
    x: getX(idx),
    y: getY(w.closingCashPaise),
    week: w,
  }));

  const linePathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Gradient area under curve
  const areaPathD = `${linePathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${
    points[0].x
  } ${paddingTop + chartHeight} Z`;

  const safetyY = getY(safetyBufferPaise);

  return (
    <div className="relative w-full bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-white/5 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">13-Week Cash Horizon Curve</h3>
          <p className="text-xs text-slate-400">
            Real-time projection with minimum ₹2,00,000 liquidity buffer threshold
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 rounded shadow-xs shadow-indigo-400/50" />
            <span className="font-semibold text-slate-300">Projected Cash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-400" />
            <span className="font-semibold text-rose-400">Safety Buffer (₹2L)</span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px] h-auto select-none"
        >
          <defs>
            <linearGradient id="darkCashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#818cf8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Safety Buffer Horizontal Line */}
          {safetyY >= paddingTop && safetyY <= paddingTop + chartHeight && (
            <g>
              <line
                x1={paddingLeft}
                y1={safetyY}
                x2={width - paddingRight}
                y2={safetyY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              <text
                x={paddingLeft - 8}
                y={safetyY + 3}
                textAnchor="end"
                className="text-[10px] font-mono font-bold fill-rose-400"
              >
                ₹2.0L
              </text>
            </g>
          )}

          {/* Area fill */}
          <path d={areaPathD} fill="url(#darkCashGradient)" />

          {/* Line stroke */}
          <path
            d={linePathD}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glowEffect)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isBreach = pt.week.isBelowSafetyBuffer;
            const isHovered = hoveredWeek?.weekIndex === pt.week.weekIndex;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredWeek(pt.week)}
                onMouseLeave={() => setHoveredWeek(null)}
                className="cursor-pointer"
              >
                {/* Vertical Guide on Hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + chartHeight}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isBreach ? 4.5 : 3.5}
                  className={`transition-all duration-150 ${
                    isBreach
                      ? 'fill-rose-500 stroke-[#0f172a] stroke-2 shadow-lg shadow-rose-500/50'
                      : 'fill-indigo-400 stroke-[#0f172a] stroke-2 shadow-lg shadow-indigo-400/50'
                  }`}
                />

                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono select-none ${
                    isBreach ? 'fill-rose-400 font-bold' : 'fill-slate-400'
                  }`}
                >
                  W{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Tooltip details if hovered */}
      {hoveredWeek && (
        <div className="mt-3 p-3.5 bg-[#0b0f19] text-white rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xl border border-white/10 ring-1 ring-indigo-500/30">
          <div>
            <strong className="text-white block">
              Week {hoveredWeek.weekIndex} ({hoveredWeek.startDate} to {hoveredWeek.endDate})
            </strong>
            <span className="text-slate-400 text-[11px]">
              Opening: {formatPaise(hoveredWeek.openingCashPaise)}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <span className="text-emerald-400 font-semibold">
              +{formatPaise(hoveredWeek.inflowPaise)} in
            </span>
            <span className="text-rose-400 font-semibold">
              -{formatPaise(hoveredWeek.outflowPaise)} out
            </span>
            <span className={`font-bold ${hoveredWeek.isBelowSafetyBuffer ? 'text-rose-400 font-black' : 'text-indigo-300'}`}>
              Closing: {formatPaise(hoveredWeek.closingCashPaise)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
