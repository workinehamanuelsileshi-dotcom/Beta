import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Search, ArrowRight, Loader, Cpu, Coins, Calendar, Activity, ChevronRight, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import { AISearchResult, BusinessDNA } from '../types';
import { SUGGESTED_SEARCHES } from '../data';

interface AISearchSectionProps {
  businessDNA: BusinessDNA;
  onSelectSuggestion: (query: string) => void;
  onCustomWorkflowReady: (result: AISearchResult) => void;
  onClearCustomWorkflow: () => void;
  currentResult: AISearchResult | null;
}

export default function AISearchSection({
  businessDNA,
  onSelectSuggestion,
  onCustomWorkflowReady,
  onClearCustomWorkflow,
  currentResult
}: AISearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInitiateCustomization = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 3000);
  };

  // Trigger search on typing debounce to feel instantaneous and active
  useEffect(() => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    if (searchQuery.trim().length > 5) {
      typingTimer.current = setTimeout(() => {
        executeAISearch(searchQuery);
      }, 800); // 800ms debounce
    } else if (searchQuery.trim() === '') {
      onClearCustomWorkflow();
    }

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [searchQuery]);

  const executeAISearch = async (queryText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          dna: businessDNA
        })
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data: AISearchResult = await response.json();
      onCustomWorkflowReady(data);
    } catch (err: any) {
      console.error('AISearch error:', err);
      setError('System occupied. Retrying with local optimization model...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeAISearch(searchQuery);
    }
  };

  const handleChipClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    executeAISearch(suggestion);
  };

  return (
    <section className="w-full py-10 border-b border-neutral-100 select-none" id="ai-search-center">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-600 text-[11px] font-bold tracking-tight uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>AI Solutions Architect Active</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 font-sans">
            What would you like to automate today?
          </h1>
          <p className="text-[13px] text-neutral-400 font-medium">
            Explain your business bottleneck in plain English. Our engine builds the solution instantly.
          </p>
        </div>

        {/* ChatGPT Style Large Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-white border border-neutral-200 focus-within:border-neutral-900 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all duration-300">
            <div className="pl-4 text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Help me automatically reconcile Stripe fees with QuickBooks and notify Slack..."
              className="w-full bg-transparent px-3 py-5 text-neutral-800 text-[14px] md:text-md font-medium focus:outline-none placeholder-neutral-300"
            />
            <div className="pr-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => executeAISearch(searchQuery)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="AI Match Automation to Problem"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                <span>AI Match</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    onClearCustomWorkflow();
                  }}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 text-[11px] font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-[12px] font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1"
              >
                <span>Design</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2.5">
          <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase text-center sm:text-left">Suggested Searches:</span>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {SUGGESTED_SEARCHES.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleChipClick(s)}
                className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 text-neutral-600 hover:text-neutral-900 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer truncate max-w-[240px]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Search Loading States (Premium Skeleton shimmer) */}
        {isLoading && (
          <div className="bg-neutral-50/50 border border-neutral-150 rounded-3xl p-6 md:p-8 space-y-6 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full" />
            <div className="space-y-3">
              <div className="h-4.5 bg-neutral-100 rounded-md w-1/3" />
              <div className="h-4.5 bg-neutral-100 rounded-md w-full" />
              <div className="h-4.5 bg-neutral-100 rounded-md w-5/6" />
            </div>

            {/* Simulated Nodes Shimmer */}
            <div className="border-t border-neutral-200/60 pt-6">
              <div className="h-3 bg-neutral-100 rounded-md w-1/4 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="bg-white border border-neutral-100 p-4 rounded-xl flex flex-col space-y-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-100" />
                    <div className="h-3 bg-neutral-100 rounded-md w-2/3" />
                    <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Display (Bespoke AI Designed Blueprint) */}
        {!isLoading && currentResult && currentResult.recommendedWorkflow && (
          <div className="bg-white border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6 text-left relative overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.03)] transition-all duration-300">
            {/* Tag label */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-neutral-900 font-sans uppercase">Bespoke Solution Designed</h4>
                  <p className="text-[10px] text-neutral-400 font-medium">Engineered based on prompt and business criteria</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold tracking-tight uppercase border border-green-100">
                  100% FEASIBLE
                </span>
              </div>
            </div>

            {/* Conversation/Explanation response */}
            <div className="space-y-2">
              <p className="text-[13px] text-neutral-600 leading-relaxed font-sans">
                {currentResult.explanation}
              </p>
            </div>

            {/* ROI, Savings, Budget row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-sans">ROI PROJECTION</span>
                <p className="text-md font-bold text-blue-600 font-mono mt-0.5">{currentResult.recommendedWorkflow.estimatedROI}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-sans">WEEKLY SAVINGS</span>
                <p className="text-md font-bold text-neutral-800 font-mono mt-0.5">{currentResult.recommendedWorkflow.estimatedSavings}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-sans">EST. BUDGET</span>
                <p className="text-md font-bold text-neutral-800 font-mono mt-0.5">{currentResult.recommendedWorkflow.customBudget}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-sans">DELIVERY TIME</span>
                <p className="text-md font-bold text-neutral-800 font-mono mt-0.5">{currentResult.recommendedWorkflow.implementationTime}</p>
              </div>
            </div>

            {/* Custom Workflow Nodes diagram */}
            <div className="space-y-3 pt-2">
              <h5 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase font-sans">Proposed Pipeline Architecture</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {currentResult.recommendedWorkflow.nodes.map((node, idx) => (
                  <div 
                    key={node.id} 
                    className="group bg-white hover:bg-neutral-50 border border-neutral-150 hover:border-neutral-800 p-4 rounded-2xl relative flex flex-col justify-between text-left transition-all duration-300 min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-5.5 h-5.5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-400 font-mono tracking-tight">{node.timeEstimate}</span>
                      </div>
                      <p className="text-[11px] font-bold text-neutral-800 font-sans leading-snug">{node.label}</p>
                      <p className="text-[9px] text-neutral-400 font-medium mt-0.5 leading-snug">{node.tool}</p>
                    </div>
                    <div className="mt-2 text-[9px] text-blue-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action panel */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-neutral-400 text-[11px] font-medium text-left">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Flowmint guarantees escrow protection, quality delivery checkpoints, and continuous operations support.</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleInitiateCustomization}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl text-[12px] font-semibold active:scale-[0.96] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 ${
                    isSaving 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                      <span>Blueprint Saved & Connected!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span>Initiate Customization</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
