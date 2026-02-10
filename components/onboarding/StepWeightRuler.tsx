
import React, { useState, useRef, useEffect } from 'react';
import { OnboardingScreen, OnboardingHeader, OnboardingFooter } from './OnboardingComponents';

interface StepWeightRulerProps {
  title: string;
  onNext: () => void;
  onBack: () => void;
  value: number;
  startWeight?: number;
  onSelect: (w: number) => void;
  isGoal?: boolean;
  step: number;
  total: number;
}

export const StepWeightRuler: React.FC<StepWeightRulerProps> = ({ title, onNext, onBack, value, onSelect, isGoal, startWeight, step, total }) => {
  const [weight, setWeight] = useState(value);
  const scrollRef = useRef<HTMLDivElement>(null);

  const min = 30;
  const max = 250;
  const stepSize = 10; // pixels per 0.1kg

  useEffect(() => {
    // Small timeout ensures DOM is fully rendered and width is calculable
    const timer = setTimeout(() => {
        if (scrollRef.current) {
            // Formula: (CurrentWeight - MinWeight) * 10 ticks/kg * stepSize
            const stepsFromMin = (value - min) * 10;
            const pixelOffset = stepsFromMin * stepSize;
            
            // Scroll directly to that position
            // Since padding-left is 50%, 0 scroll puts the first tick in center.
            // So scrolling 'pixelOffset' puts the target tick in center.
            scrollRef.current.scrollLeft = pixelOffset;
        }
    }, 100);

    return () => clearTimeout(timer);
  }, []); 

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const stepsFromMin = scrollLeft / stepSize;
    const rawWeight = min + (stepsFromMin / 10);
    const roundedWeight = Math.round(rawWeight * 10) / 10;
    
    if (roundedWeight >= min && roundedWeight <= max) {
        setWeight(roundedWeight);
    }
  };

  const diff = startWeight ? Math.round((weight - startWeight) * 10) / 10 : 0;

  return (
    <OnboardingScreen>
      <OnboardingHeader 
        title={title} 
        onBack={onBack}
        step={step}
        totalSteps={total}
      />

      <div className="flex-grow flex flex-col items-center justify-center w-full">
        
        {/* Main Display */}
        <div className="relative mb-12 flex flex-col items-center animate-fade-in">
            <div className="flex items-baseline gap-2">
                <span className="text-[90px] leading-none font-bold tracking-tighter text-gray-900 dark:text-white tabular-nums">
                    {weight.toFixed(1)}
                </span>
                <span className="text-3xl font-bold text-gray-400 mb-2">kg</span>
            </div>
            
            {isGoal && diff !== 0 && (
                <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-bold bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 shadow-sm ${diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {diff > 0 ? `+${diff}` : diff} kg
                </div>
            )}
        </div>

        {/* Ruler Container */}
        <div className="w-full relative h-32">
            {/* Center Marker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-14 bg-blue-600 dark:bg-blue-500 rounded-full z-20 shadow-lg shadow-blue-500/30"></div>
            
            {/* Triangular Indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-blue-600 dark:border-b-blue-500 z-20"></div>

            {/* Scrolling Area */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full overflow-x-scroll hide-scrollbar snap-x snap-mandatory flex items-start h-full"
                style={{ paddingLeft: '50%', paddingRight: '50%' }}
            >
                {Array.from({ length: (max - min) * 10 + 1 }).map((_, i) => {
                    const isKg = i % 10 === 0;
                    const isHalfKg = i % 5 === 0 && !isKg;
                    const val = min + (i / 10);

                    return (
                        <div 
                            key={i} 
                            className="flex-shrink-0 flex flex-col items-center justify-start h-full relative"
                            style={{ width: `${stepSize}px` }}
                        >
                            <div 
                                className={`w-[2px] rounded-full transition-all ${
                                    isKg 
                                    ? 'h-12 bg-gray-400 dark:bg-gray-300' 
                                    : isHalfKg 
                                        ? 'h-8 bg-gray-300 dark:bg-gray-600' 
                                        : 'h-4 bg-gray-200 dark:bg-gray-800'
                                }`}
                            ></div>
                            {isKg && (
                                <span className={`absolute top-14 text-[10px] font-bold transform -translate-x-1/2 transition-colors ${
                                    Math.round(val) === Math.round(weight) 
                                    ? 'text-black dark:text-white scale-110' 
                                    : 'text-gray-400 dark:text-gray-600'
                                }`}>
                                    {val}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Fade Gradients */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F2F2F7] dark:from-black to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F2F2F7] dark:from-black to-transparent pointer-events-none z-10"></div>
        </div>

      </div>

      <OnboardingFooter onContinue={() => { onSelect(weight); onNext(); }} />
    </OnboardingScreen>
  );
};
