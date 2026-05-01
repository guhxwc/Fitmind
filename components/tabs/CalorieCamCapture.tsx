import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '../core/Icons';
import { motion, AnimatePresence } from 'motion/react';

export const CalorieCamCapture = ({ onClose, onCapture }: { onClose: () => void, onCapture: (f: File) => void }) => {
  const [step, setStep] = useState<'instructions' | 'camera'>('instructions');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleEntendi = async () => {
    try {
      // First ask for permission while the instructional modal is still up
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      // Once granted, open the camera UI
      setStep('camera');
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback para galeria ou abrir a UI mesmo sem stream
      setStep('camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleCaptureClick = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            onCapture(file);
          }
        }, 'image/jpeg', 0.8);
      }
    } else {
        // Fallback se não tiver câmera
        fileInputRef.current?.click();
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  return createPortal(
    <>
      {step === 'instructions' && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-12 sm:pb-8 flex flex-col shadow-2xl relative" style={{ animation: 'slideUp 0.3s ease-out' }}>
             <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-10">
               <XMarkIcon className="w-6 h-6" />
             </button>
             <h2 className="text-[22px] font-bold text-center mt-2 mb-6 dark:text-white tracking-tight">Capture a refeição completa</h2>
             
             <div className="bg-[#3A3A3C] w-full rounded-2xl aspect-[1.3] flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="relative w-[55%] h-[55%]">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white" />
                   <div className="flex items-center justify-center w-full h-full">
                     <svg className="w-14 h-14 text-white stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                       <circle cx="12" cy="12" r="10" />
                       <path d="M12 2L12 6" />
                       <path d="M12 18L12 22" />
                       <path d="M22 12L18 12" />
                       <path d="M6 12L2 12" />
                       <path d="M19.07 4.93L16.24 7.76" />
                       <path d="M7.76 16.24L4.93 19.07" />
                       <path d="M19.07 19.07L16.24 16.24" />
                       <path d="M7.76 7.76L4.93 4.93" />
                       <circle cx="12" cy="12" r="4" />
                     </svg>
                   </div>
                </div>
             </div>

             <div className="space-y-4 mb-8 px-2">
               <div className="flex items-center gap-3">
                 <div className="w-[22px] h-[22px] rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
                   <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <span className="text-gray-700 dark:text-[#EBEBF5] text-[15px] font-medium tracking-tight">Enquadre toda a refeição nas linhas.</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-[22px] h-[22px] rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
                   <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <span className="text-gray-700 dark:text-[#EBEBF5] text-[15px] font-medium tracking-tight">Não corte os lados do prato.</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-[22px] h-[22px] rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
                   <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <span className="text-gray-700 dark:text-[#EBEBF5] text-[15px] font-medium tracking-tight">Garanta uma boa iluminação.</span>
               </div>
             </div>

             <button onClick={handleEntendi} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-[17px] active:scale-[0.98] transition-transform">
               Entendi
             </button>
          </div>
        </div>
      )}

      {step === 'camera' && (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          
          <video ref={videoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover ${stream ? 'opacity-100' : 'opacity-0'}`} />
          
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Iniciando câmera...
            </div>
          )}

          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 pt-4 sm:pt-4 bg-gradient-to-b from-black/50 to-transparent">
             <button onClick={onClose} className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform">
                <XMarkIcon className="w-5 h-5 text-white" />
             </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 hidden sm:flex">
             <div className="relative w-[70vw] h-[70vw] max-w-[300px] max-h-[300px] opacity-80">
                 <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white" />
                 <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white" />
                 <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white" />
                 <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white" />
             </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 sm:hidden pb-32">
             <div className="relative w-[85vw] h-[100vw] opacity-80">
                 <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white" />
                 <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white" />
                 <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white" />
                 <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white" />
             </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col items-center pb-10 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
             <div className="flex gap-6 mb-8 text-sm font-semibold tracking-wide">
                <button className="text-[#FFD700] uppercase pr-2">Câmera</button>
                <button onClick={handleGalleryClick} className="text-white/70 uppercase pl-2 active:text-white transition-colors">Galeria</button>
             </div>
             
             <button onClick={handleCaptureClick} className="w-[76px] h-[76px] border-[4px] border-white rounded-full flex items-center justify-center p-1 active:scale-95 transition-transform shadow-xl">
               <div className="w-full h-full rounded-full bg-white" />
             </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

const PHRASES = [
  "Analisando sua refeição...",
  "Identificando ingredientes...",
  "Calculando macronutrientes...",
  "Preparando resultados..."
];

export const ImageAnalyzingOverlay = ({ imageUrl }: { imageUrl: string }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-white/90 dark:bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      <div className="relative w-48 h-48 mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-[#34C759] border-r-[#34C759] opacity-80"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[6px] rounded-full border-[4px] border-transparent border-l-[#5AC8FA] border-b-[#5AC8FA] opacity-60"
        />
        
        <div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-800">
           <motion.img 
              src={imageUrl} 
              alt="Refeição" 
              className="w-full h-full object-cover" 
              initial={{ scale: 1 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: 15, ease: "linear" }}
           />
        </div>
      </div>

      <div className="h-8 flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-[19px] font-semibold tracking-tight text-gray-900 dark:text-white absolute"
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
};
