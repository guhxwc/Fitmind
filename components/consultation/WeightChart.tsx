import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { useAppContext } from '../AppContext';

const CHART = {
  width: 500, height: 200,
  padLeft: 28, padRight: 10,
  padTop: 10, padBottom: 30
};

export const WeightChart: React.FC = () => {
  const { weightHistory, userData } = useAppContext();
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    if (!weightHistory || weightHistory.length === 0) {
      return [];
    }

    // sort history ascending for chart (oldest to newest)
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // filter by range
    const now = new Date();
    const daysToSubtract = parseInt(range, 10);
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));

    const filtered = sortedHistory.filter(entry => new Date(entry.date) >= cutoffDate);
    
    // Fallback if not enough data
    const finalData = filtered.length > 0 ? filtered : sortedHistory.slice(-parseInt(range, 10));

    return finalData.map(entry => {
      const d = new Date(entry.date);
      return {
        date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        weight: entry.weight
      };
    });
  }, [weightHistory, range]);

  const chartState = useMemo(() => {
    if (data.length === 0) return null;

    const weights = data.map(d => d.weight);
    // add small padding if min == max
    const rawMin = Math.min(...weights);
    const rawMax = Math.max(...weights);
    const pad = Math.max(1, (rawMax - rawMin) * 0.25);
    const minW = Math.floor(rawMin - pad);
    const maxW = Math.ceil(rawMax + pad);

    const scaleY = (weight: number) => {
      const innerH = CHART.height - CHART.padTop - CHART.padBottom;
      return CHART.padTop + (1 - (weight - minW) / (maxW - minW)) * innerH;
    };

    const scaleX = (i: number, total: number) => {
      const innerW = CHART.width - CHART.padLeft - CHART.padRight;
      if (total === 1) return CHART.padLeft + innerW / 2;
      return CHART.padLeft + (i / (total - 1)) * innerW;
    };

    const points = data.map((d, i) => ({
      ...d,
      x: scaleX(i, data.length),
      y: scaleY(d.weight)
    }));

    const linePath = points.map((p, i) =>
      (i === 0 ? 'M' : 'L') + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1)
    ).join(' ');

    const last = points[points.length - 1];
    const first = points[0];
    const bottom = CHART.height - CHART.padBottom;
    const areaPath = linePath + ` L ${last.x.toFixed(1)} ${bottom} L ${first.x.toFixed(1)} ${bottom} Z`;

    const steps = 5;
    const yGrid = Array.from({ length: steps }).map((_, s) => {
      const val = minW + ((maxW - minW) * (steps - 1 - s)) / (steps - 1);
      return { val: Math.round(val), y: scaleY(val) };
    });

    const maxXLabels = 5;
    const step = Math.max(1, Math.floor((data.length - 1) / (maxXLabels - 1)));
    const shownX = new Set<number>();
    for (let i = 0; i < data.length; i += step) shownX.add(i);
    shownX.add(data.length - 1);

    const xLabels = Array.from(shownX).map(i => ({
      x: points[i].x,
      label: data[i].date
    }));

    return { points, linePath, areaPath, yGrid, xLabels };
  }, [data]);

  // Set initial hover
  useEffect(() => {
    if (chartState) {
      setHoverIndex(chartState.points.length - 1);
    }
  }, [chartState?.points.length, range]);

  const handlePointerMove = (clientX: number) => {
    if (!svgRef.current || !chartState) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = ((clientX - svgRect.left) / svgRect.width) * CHART.width;

    let closestIdx = 0;
    let closestDist = Infinity;
    chartState.points.forEach((p, i) => {
      const d = Math.abs(p.x - mouseX);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = i;
      }
    });

    setHoverIndex(closestIdx);
  };

  const activePoint = chartState && hoverIndex !== null && chartState.points[hoverIndex] ? chartState.points[hoverIndex] : null;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5 flex flex-col h-full w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-500 shrink-0" />
          <h3 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">Evolução de peso</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700/50">
          {(['7', '30', '90'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
                range === r 
                  ? 'text-blue-600 bg-white dark:text-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative min-h-[220px] w-full flex flex-col justify-center mb-6 mt-4">
        {!chartState ? (
          <div className="flex flex-col items-center justify-center h-full w-full py-8">
             <div className="w-14 h-14 rounded-[18px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
               <TrendingDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
             </div>
             <p className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">Nenhum registro de peso</p>
             <p className="text-[13px] font-medium text-gray-500">Peso atual: {userData?.weight ? `${userData.weight} kg` : '--'}</p>
          </div>
        ) : (
          <>
            {activePoint && (
              <div 
                className="absolute z-10 bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-100 dark:border-gray-700 flex flex-col items-center shadow-lg transition-all duration-150 ease-out pointer-events-none"
                style={{
                   left: `${(activePoint.x / CHART.width) * 100}%`,
                   top: `${(activePoint.y / CHART.height) * 100}%`,
                   transform: 'translate(-50%, calc(-100% - 12px))'
                }}
              >
                <span className="text-[13px] font-extrabold text-gray-900 dark:text-white">
                  {activePoint.weight.toFixed(1).replace('.', ',')} kg
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                  {activePoint.date}
                </span>
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            )}

            <div className="absolute inset-0 w-full overflow-hidden">
              <svg 
                ref={svgRef}
                viewBox={`0 0 ${CHART.width} ${CHART.height}`} 
                className="w-full h-full overflow-visible preserve-aspect-ratio-none"
                onMouseMove={(e) => handlePointerMove(e.clientX)}
                onMouseLeave={() => setHoverIndex(chartState.points.length - 1)}
                onTouchMove={(e) => {
                  handlePointerMove(e.touches[0].clientX);
                }}
                onTouchEnd={() => setHoverIndex(chartState.points.length - 1)}
                style={{ touchAction: 'pan-y' }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b6ef5" stopOpacity="0.22"/>
                    <stop offset="100%" stopColor="#3b6ef5" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                <g id="gridLines">
                  {chartState.yGrid.map((g, i) => (
                    <line key={i} x1={CHART.padLeft} y1={g.y} x2={CHART.width} y2={g.y} stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="1" />
                  ))}
                </g>
                
                <g id="yLabels" className="font-sans text-[10px] font-bold fill-gray-400 dark:fill-gray-600">
                  {chartState.yGrid.map((g, i) => (
                    <text key={i} x={2} y={g.y + 3}>{g.val}</text>
                  ))}
                </g>

                <path 
                  d={chartState.areaPath} 
                  fill="url(#areaGrad)" 
                  className="transition-[d] duration-500 ease-out" 
                />
                <path 
                  d={chartState.linePath} 
                  fill="none" 
                  stroke="#3b6ef5" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-[d] duration-500 ease-out" 
                />

                {activePoint && (
                  <line 
                    x1={activePoint.x} x2={activePoint.x} 
                    y1={CHART.padTop} y2={CHART.height - CHART.padBottom} 
                    stroke="#3b6ef5" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" 
                    className="transition-all duration-150 ease-out"
                  />
                )}

                <g id="dataPoints">
                  {chartState.points.map((p, i) => {
                    const isHovered = hoverIndex === i;
                    const isLast = i === chartState.points.length - 1;
                    return (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 5.5 : (isLast ? 5 : 3.5)}
                        fill={isHovered || isLast ? 'white' : '#3b6ef5'}
                        stroke={isHovered || isLast ? '#3b6ef5' : 'transparent'}
                        strokeWidth={isHovered || isLast ? 2.5 : 0}
                        className="transition-all duration-150 ease-out cursor-crosshair dark:fill-gray-900"
                        style={{ 
                           fill: isHovered || isLast ? (document.documentElement.classList.contains('dark') ? '#1C1C1E' : 'white') : '#3b6ef5'
                        }}
                      />
                    );
                  })}
                </g>

                <g id="xLabels" className="font-sans text-[10px] font-bold fill-gray-400 dark:fill-gray-600" textAnchor="middle">
                  {chartState.xLabels.map((xl, i) => (
                    <text key={i} x={xl.x} y={CHART.height - 8}>{xl.label}</text>
                  ))}
                </g>
              </svg>
            </div>
          </>
        )}
      </div>

      <button className="w-full text-[14px] font-bold text-blue-600 border border-blue-50 hover:border-blue-100 bg-white dark:bg-transparent dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 py-3.5 rounded-full transition-colors mt-auto active:scale-95">
        Ver evolução completa
      </button>
    </div>
  );
};
