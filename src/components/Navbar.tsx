import React from 'react';
import { Cpu, Fingerprint, Sparkles, Search, Layers } from 'lucide-react';
import { BusinessDNA } from '../types';

interface NavbarProps {
  businessDNA: BusinessDNA;
  onOpenDNA: () => void;
  onScrollToSearch: () => void;
  totalSaved: number;
  activeFilter: string;
}

export default function Navbar({ businessDNA, onOpenDNA, onScrollToSearch, totalSaved, activeFilter }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 bg-white/85 backdrop-blur-md border-b border-neutral-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Philosophy */}
        <div className="flex items-center space-x-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 text-white transition-transform group-hover:scale-105 duration-300">
            <Cpu className="w-4.5 h-4.5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-md font-semibold tracking-tight text-neutral-900 font-sans">Flowmint</span>
              <span className="px-1.5 py-0.5 text-[9px] font-medium tracking-wide bg-blue-50 text-blue-600 rounded-md border border-blue-100">MARKETPLACE</span>
            </div>
            <p className="text-[10px] text-neutral-400 tracking-normal leading-none mt-0.5">Automation-First Engine</p>
          </div>
        </div>

        {/* Floating Quick Search & Category Info */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={onScrollToSearch}
            className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-100 text-[12px] text-neutral-400 font-medium transition-all duration-200 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search solutions...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white text-[9px] text-neutral-300 border border-neutral-100 rounded font-mono font-normal">⌘K</kbd>
          </button>

          <span className="h-4 w-[1px] bg-neutral-100"></span>

          <div className="flex items-center space-x-1 text-[12px] font-medium text-neutral-500">
            <span className="text-neutral-300 font-normal">Viewing:</span>
            <span className="text-neutral-800">{activeFilter === 'all' ? 'All Solutions' : activeFilter}</span>
          </div>
        </div>

        {/* Business DNA Fingerprint & Secondary Action */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenDNA}
            className="group flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-full text-[12px] font-medium text-neutral-800 transition-all duration-300 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <Fingerprint className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="max-w-[120px] truncate text-neutral-700 font-sans">
              {businessDNA.industry}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-[10px] text-neutral-400 font-normal">DNA Active</span>
          </button>


        </div>
      </div>
    </header>
  );
}
