import React from 'react';
import Portal from './core/Portal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-ios-dark-card w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{message}</p>
          </div>
          
          <div className="flex border-t border-gray-200 dark:border-gray-800">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 py-4 text-base font-semibold text-blue-500 border-r border-gray-200 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`flex-1 py-4 text-base font-semibold active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${
                isDestructive ? 'text-red-500' : 'text-blue-500'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
