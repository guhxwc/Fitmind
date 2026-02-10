
import React from 'react';

interface OnboardingScreenProps {
  children: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-[100dvh] bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
        <div className="flex flex-col h-full w-full max-w-md mx-auto relative px-6">
            {children}
        </div>
    </div>
  );
};

interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  step: number;
  totalSteps: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ title, subtitle, onBack, step, totalSteps }) => {
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="flex-none pt-safe-top pb-4 z-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-12 mb-4">
        <div className="w-10">
            {onBack && (
            <button 
                onClick={onBack} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm active:scale-90 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            )}
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-4 h-1.5 bg-gray-300 dark:bg-[#1C1C1E] rounded-full overflow-hidden">
          <div 
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="w-10 text-right">
            <span className="text-[11px] font-bold text-gray-500 dark:text-[#636366]">{step + 1}/{totalSteps}</span>
        </div>
      </div>

      {/* Title Area */}
      <div className="animate-fade-in space-y-2 mb-2">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400 text-[16px] font-medium leading-relaxed">
                {subtitle}
            </p>
          )}
      </div>
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
    <div className="flex-none pb-8 pt-4 z-20 safe-bottom">
      <button
        onClick={onContinue}
        disabled={disabled}
        className="w-full bg-black dark:bg-white text-white dark:text-black h-[56px] rounded-[20px] text-[17px] font-bold tracking-tight transition-all active:scale-[0.98] disabled:opacity-30 disabled:scale-100 shadow-xl shadow-black/5 dark:shadow-white/5 hover:shadow-2xl"
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
        className={`w-full text-left px-6 py-5 mb-4 rounded-2xl transition-all duration-200 border flex items-center justify-between group active:scale-[0.99] min-h-[72px] ${
            isSelected 
                ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-md transform scale-[1.01]' 
                : 'bg-white dark:bg-[#1C1C1E] border-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'
        }`}
    >
        <span className="text-[17px] font-semibold tracking-tight flex items-center gap-4 flex-grow leading-snug">
            {children}
        </span>
        {isSelected && (
            <div className="bg-white dark:bg-black rounded-full p-1 flex-shrink-0">
                <svg className="w-3 h-3 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
        )}
    </button>
);

// --- Simple Input Component (Clean Box Style) ---
interface SimpleInputProps {
    value: number | string;
    onChange: (val: string) => void;
    label: string;
    unit?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

export const SimpleInput: React.FC<SimpleInputProps> = ({ value, onChange, label, unit, placeholder, autoFocus }) => {
    return (
        <div className="flex flex-col w-full">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <div className="relative">
                <input 
                    type="number" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl py-4 px-4 text-3xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 text-center shadow-sm"
                />
                {unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    )
}
