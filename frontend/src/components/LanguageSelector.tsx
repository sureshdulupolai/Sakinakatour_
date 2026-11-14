import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Search } from 'lucide-react';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { currentLang, currentLanguageOption, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = INDIAN_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left notranslate" translate="no" ref={dropdownRef}>
      {/* Sleek Trigger Button showing the active selected language */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors select-none"
        title={`Current Language: ${currentLanguageOption?.name || 'English'}`}
      >
        <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span className="font-bold text-slate-800">{currentLanguageOption?.nativeName || 'English'}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 notranslate"
          translate="no"
        >
          {/* Header & Quick Search */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider px-1">
              Select Language
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-100">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-slate-900">{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-500 font-normal">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3] shrink-0" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching language
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
