import React, { useState } from 'react';
import { X } from 'lucide-react';
import Portal from './Portal';

export interface EditAttributeModalProps {
    title: string;
    initialValue: string | number;
    type: 'text' | 'number' | 'date' | 'select' | 'password';
    options?: string[];
    onClose: () => void;
    onSave: (value: any) => Promise<void>;
    unit?: string;
}

export const EditAttributeModal: React.FC<EditAttributeModalProps> = ({ title, initialValue, type, options, onClose, onSave, unit }) => {
    const formatInitialDate = (val: string | number) => {
        if (type === 'date' && typeof val === 'string') {
            const parts = val.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
        return val;
    };

    const [value, setValue] = useState(() => formatInitialDate(initialValue));
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        let finalValue = value;
        if (type === 'date' && typeof value === 'string') {
            const parts = value.split('/');
            if (parts.length === 3) {
                finalValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        await onSave(finalValue);
        setLoading(false);
        onClose();
    };

    const isUnchanged = value === formatInitialDate(initialValue);
    const isInvalidDate = type === 'date' && String(value).length !== 10;
    const isInvalidPassword = type === 'password' && String(value).length < 6;

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/40 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    <div className="mb-8">
                        {type === 'select' ? (
                            <div className="space-y-2">
                                {options?.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setValue(opt)}
                                        className={`w-full p-4 rounded-2xl font-medium text-left transition-all text-[16px] flex justify-between items-center ${
                                            value === opt 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/50' 
                                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {opt}
                                        {value === opt && <span className="text-blue-500">✓</span>}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type={type === 'date' ? 'text' : type}
                                    inputMode={type === 'date' ? 'numeric' : type === 'number' ? 'decimal' : undefined}
                                    value={value}
                                    onChange={(e) => {
                                        if (type === 'date') {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 8) val = val.slice(0, 8);
                                            if (val.length >= 5) {
                                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                            } else if (val.length >= 3) {
                                                val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                            }
                                            setValue(val);
                                        } else {
                                            setValue(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-4 text-lg font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    autoFocus
                                    placeholder={type === 'password' ? 'Nova senha' : type === 'date' ? 'DD/MM/AAAA' : ''}
                                />
                                {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || isUnchanged || isInvalidDate || isInvalidPassword}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </Portal>
    );
};
