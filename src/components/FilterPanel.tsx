import React from 'react';
import { CATEGORIES, INDUSTRIES } from '../data';
import { Filter, Star, Clock, Coins, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface FilterPanelProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
  selectedComplexity: string;
  onSelectComplexity: (complexity: string) => void;
  selectedPrice: string;
  onSelectPrice: (price: string) => void;
  selectedROI: string;
  onSelectROI: (roi: string) => void;
  verifiedOnly: boolean;
  onToggleVerified: (val: boolean) => void;
  onResetFilters: () => void;
}

export default function FilterPanel({
  activeCategory,
  onSelectCategory,
  selectedIndustry,
  onSelectIndustry,
  selectedComplexity,
  onSelectComplexity,
  selectedPrice,
  onSelectPrice,
  selectedROI,
  onSelectROI,
  verifiedOnly,
  onToggleVerified,
  onResetFilters
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Categories</h3>
          {(activeCategory !== 'all' || selectedIndustry !== 'all' || selectedComplexity !== 'all' || selectedPrice !== 'all' || selectedROI !== 'all' || verifiedOnly) && (
            <button 
              onClick={onResetFilters}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
        <div className="flex flex-wrap lg:flex-col gap-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
            }`}
          >
            <span>All Automations</span>
            <Layers className="w-3.5 h-3.5 opacity-60" />
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
              }`}
            >
              <span>{cat}</span>
              <ArrowRight className={`w-3 h-3 transition-transform duration-200 ${activeCategory === cat ? 'translate-x-0 opacity-100' : 'translate-x-[-4px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Industry Filter */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Target Industry</h3>
        <select
          value={selectedIndustry}
          onChange={(e) => onSelectIndustry(e.target.value)}
          className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-neutral-800 focus:outline-none focus:border-neutral-900 transition-all duration-200"
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {/* Complexity / Maturity Filter */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Complexity</h3>
        <div className="grid grid-cols-3 gap-1">
          {['all', 'Beginner', 'Intermediate', 'Advanced'].filter(c => c !== 'all').map((level) => (
            <button
              key={level}
              onClick={() => onSelectComplexity(selectedComplexity === level ? 'all' : level)}
              className={`py-1.5 rounded-lg text-[11px] font-semibold tracking-tight transition-all duration-200 border cursor-pointer ${
                selectedComplexity === level
                  ? 'bg-neutral-900 text-white border-neutral-950'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Budget/Price Tier Filter */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Implementation Budget</h3>
        <div className="flex flex-col gap-1">
          {[
            { value: 'all', label: 'Any Budget' },
            { value: 'under1k', label: 'Under $1,000' },
            { value: '1kto2k', label: '$1,000 - $2,000' },
            { value: 'over2k', label: 'Over $2,000' }
          ].map((tier) => (
            <button
              key={tier.value}
              onClick={() => onSelectPrice(tier.value)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                selectedPrice === tier.value
                  ? 'text-blue-600 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Coins className={`w-3.5 h-3.5 ${selectedPrice === tier.value ? 'text-blue-500' : 'text-neutral-300'}`} />
              <span>{tier.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expected ROI Filter */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Minimum ROI</h3>
        <div className="flex flex-col gap-1">
          {[
            { value: 'all', label: 'Any ROI' },
            { value: '300', label: 'Over 300%' },
            { value: '400', label: 'Over 400%' },
            { value: '500', label: 'Over 500%' }
          ].map((tier) => (
            <button
              key={tier.value}
              onClick={() => onSelectROI(tier.value)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                selectedROI === tier.value
                  ? 'text-blue-600 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${selectedROI === tier.value ? 'text-blue-500' : 'text-neutral-300'}`} />
              <span>{tier.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verified Creator Toggle */}
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="text-[13px] font-semibold text-neutral-800">Verified Creators Only</span>
        </div>
        <button
          onClick={() => onToggleVerified(!verifiedOnly)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            verifiedOnly ? 'bg-blue-600' : 'bg-neutral-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              verifiedOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
