import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface GuestbookProps {
  isOpen: boolean;
  onClose: () => void;
  entries: string[];
  onAddEntry: (entry: string) => void;
}

export const Guestbook: React.FC<GuestbookProps> = ({ isOpen, onClose, entries, onAddEntry }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddEntry(inputValue.trim());
      setInputValue("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#f0e6d2] text-black p-8 rounded shadow-2xl border-8 border-[#8b4513] relative font-serif"
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-red-900 hover:text-red-700 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-[#5c4033] border-b-2 border-[#5c4033] pb-2 uppercase tracking-widest">
          VISITOR LOG
        </h2>

        <div className="h-64 overflow-y-auto mb-4 border border-[#d2b48c] p-4 bg-[#fffaf0] shadow-inner">
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <li key={index} className="border-b border-[#e6d2b4] pb-1 last:border-0">
                <span className="text-[#8b0000] mr-2 text-xs">{index + 1}.</span>
                <span className="text-[#2f1b0c]">{entry}</span>
              </li>
            ))}
            <div ref={bottomRef} />
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Leave your name..."
            className="flex-1 bg-transparent border-b-2 border-[#5c4033] px-2 py-1 focus:outline-none focus:border-red-800 placeholder-[#a08060]"
            maxLength={20}
          />
          <button 
            type="submit"
            className="px-4 py-1 bg-[#8b4513] text-[#f0e6d2] hover:bg-[#5c4033] transition-colors font-bold text-sm"
          >
            SIGN
          </button>
        </form>

        <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-red-900/20 rounded-full blur-xl pointer-events-none"></div>
      </motion.div>
    </div>
  );
};
