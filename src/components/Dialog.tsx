import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DialogProps {
  speaker: string;
  text: string;
  onNext: () => void;
  isOpen: boolean;
  options?: string[];
  onSelect?: (index: number) => void;
}

export const Dialog: React.FC<DialogProps> = ({ speaker, text, onNext, isOpen, options, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (options && options.length > 0) {
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (onSelect) onSelect(selectedIndex);
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          onNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, options, onSelect, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 min-h-32 bg-black border-4 border-white p-4 z-50 font-pixel text-sm md:text-base leading-relaxed shadow-lg">
      <div className="flex flex-col h-full">
        {speaker && (
          <div className="mb-2 text-yellow-400 font-bold uppercase tracking-wider">
            {speaker}
          </div>
        )}
        <div className="text-white whitespace-pre-wrap mb-4">{text}</div>
        
        {options && options.length > 0 ? (
          <div className="flex flex-col gap-2 mt-2">
            {options.map((option, idx) => (
              <div 
                key={idx}
                className={`px-2 py-1 cursor-pointer ${selectedIndex === idx ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                onClick={() => onSelect && onSelect(idx)}
              >
                {selectedIndex === idx ? '> ' : '  '} {option}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-auto text-right animate-pulse text-xs text-gray-400">
            ▼ Press Space
          </div>
        )}
      </div>
    </div>
  );
};
