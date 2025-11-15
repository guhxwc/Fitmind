import React from 'react';

interface OnboardingScreenProps {
  children: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ children }) => {
  return <div className="flex flex-col h-full p-6 bg-white dark:bg-black">{children}</div>;
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
          <button onClick={onBack} className="mr-4 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-black dark:bg-white h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
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
        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold transition-colors duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-600"
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
            isSelected 
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        <span className="text-lg font-medium">{children}</span>
    </button>
);

// FIX: Add missing Picker component to resolve import error in StepDob.tsx.
interface PickerProps {
  items: (string | number)[];
  onSelect: (value: string | number) => void;
  initialValue: string | number;
}

export const Picker: React.FC<PickerProps> = ({ items, onSelect, initialValue }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value);
  };

  return (
    <div className="relative">
      <select
        value={initialValue}
        onChange={handleChange}
        className="text-xl text-center font-semibold text-gray-900 dark:text-white bg-gray-100/80 dark:bg-gray-800/80 rounded-xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:shadow-md p-4 appearance-none"
      >
        {items.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};
