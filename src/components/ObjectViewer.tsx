import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ObjectViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'locker' | 'file';
  items?: string[]; // For locker
  text?: string;    // For file
}

export const ObjectViewer: React.FC<ObjectViewerProps> = ({ isOpen, onClose, title, type, items, text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setSelectedItem(null);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'x')) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded shadow-2xl border-4 relative p-6 ${
            type === 'locker' 
                ? 'bg-zinc-800 border-zinc-600 text-zinc-300' 
                : 'bg-[#f0e6d2] border-[#8b4513] text-[#2f1b0c] font-serif'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-2 right-2 font-bold text-xl ${
              type === 'locker' ? 'text-zinc-500 hover:text-white' : 'text-red-900 hover:text-red-700'
          }`}
        >
          ✕
        </button>

        <h2 className={`text-2xl font-bold text-center mb-6 border-b-2 pb-2 uppercase tracking-widest ${
            type === 'locker' ? 'border-zinc-600 text-zinc-100' : 'border-[#5c4033] text-[#5c4033]'
        }`}>
          {title}
        </h2>

        <div className="max-h-[60vh] overflow-y-auto">
            {type === 'locker' && items && (
                <div className="space-y-4">
                    <ul className="space-y-2">
                        {items.map((item, idx) => (
                            <li 
                                key={idx} 
                                onClick={() => setSelectedItem(item)}
                                className={`flex items-center gap-3 p-3 rounded border transition-colors cursor-pointer ${
                                    selectedItem === item 
                                        ? 'bg-zinc-700 border-zinc-400 text-white' 
                                        : 'bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800'
                                }`}
                            >
                                <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center rounded text-lg">
                                    📦
                                </div>
                                <span>{item}</span>
                            </li>
                        ))}
                        {items.length === 0 && <li className="text-center italic opacity-50">비어있음</li>}
                    </ul>
                    
                    {selectedItem && (
                        <div className="mt-4 p-3 bg-black/50 border border-zinc-600 rounded text-sm text-zinc-300">
                            <span className="text-white font-bold">"{selectedItem}"</span>을(를) 확인했습니다.
                            <br/>
                            <span className="text-xs text-zinc-500">특별한 것은 없어 보입니다.</span>
                        </div>
                    )}
                </div>
            )}

            {type === 'file' && text && (
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-mono">
                    {text}
                </div>
            )}
        </div>

        <div className={`mt-6 text-center text-xs ${type === 'locker' ? 'text-zinc-500' : 'text-[#8b4513]/50'}`}>
            ESC 또는 X를 눌러 닫기
        </div>

      </motion.div>
    </div>
  );
};
