
import React, { useRef, useEffect, useState } from 'react';

interface OnboardingScreenProps {
  children: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ children }) => {
  return <div className="flex flex-col h-full p-6 bg-white">{children}</div>;
};

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  step: number;
  totalSteps: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ title, subtitle, onBack, step, totalSteps }) => {
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {onBack && (
          <button onClick={onBack} className="mr-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-black h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
};

interface OnboardingFooterProps {
  onContinue: () => void;
  label?: string;
  disabled?: boolean;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({ onContinue, label = "Continuar", disabled = false }) => {
  return (
    <div className="mt-auto pt-6">
      <button
        onClick={onContinue}
        disabled={disabled}
        className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold transition-colors duration-200 disabled:bg-gray-300"
      >
        {label}
      </button>
    </div>
  );
};

interface OptionButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    isSelected: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({children, onClick, isSelected}) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 my-2 rounded-xl border-2 transition-all duration-200 ${
            isSelected ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-900 border-gray-100 hover:border-gray-300'
        }`}
    >
        <span className="text-lg font-medium">{children}</span>
    </button>
);

// FIX: Added missing Picker component used in StepDob.tsx
interface PickerProps {
  items: (string | number)[];
  onSelect: (item: string | number) => void;
  initialValue: string | number;
}

export const Picker: React.FC<PickerProps> = ({ items, onSelect, initialValue }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const itemHeight = 40; // h-10 in tailwind

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const initialIndex = items.indexOf(initialValue);
      if (initialIndex > -1) {
        scroller.scrollTop = initialIndex * itemHeight;
      }
    }
  }, [initialValue, items]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const index = Math.round(scroller.scrollTop / itemHeight);
      if (index >= 0 && index < items.length) {
        setSelectedValue(items[index]);
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const index = Math.round(scroller.scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
          const selectedItem = items[index];
          onSelectRef.current(selectedItem);
          if (scroller.scrollTop !== index * itemHeight) {
             scroller.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
          }
        }
      }, 150);
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => {
      scroller.removeEventListener('scroll', handleScroll);
    };
  }, [items, itemHeight]);

  return (
    <div className="h-48 w-full relative overflow-hidden flex-1">
      <div 
        ref={scrollerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          paddingTop: `calc(50% - ${itemHeight / 2}px)`,
          paddingBottom: `calc(50% - ${itemHeight / 2}px)`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`h-10 flex items-center justify-center text-xl snap-center transition-all duration-200 ${
              selectedValue === item ? 'font-bold text-gray-800 scale-110' : 'text-gray-400'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center">
        <div className="h-10 border-y-2 border-gray-300 rounded-lg" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />
    </div>
  );
};