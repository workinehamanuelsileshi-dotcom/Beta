import React from 'react';
import { Sparkles, Trophy, Lightbulb, TrendingUp, Cpu, Heart, Check, ArrowRight } from 'lucide-react';
import { Automation } from '../types';

interface CollectionsPageProps {
  automations: Automation[];
  onSelectCollection: (category: string) => void;
  onOpenAutomation: (id: string) => void;
}

export default function CollectionsPage({ automations, onSelectCollection, onOpenAutomation }: CollectionsPageProps) {
  const collections = [
    {
      id: 'customer-support',
      title: 'Top Customer Support',
      desc: 'Tested automatic responding engines and helpdesk dispatchers optimized for multi-channel support.',
      icon: Sparkles,
      count: automations.filter(a => a.category === 'Customer Support').length,
      category: 'Customer Support',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'sales',
      title: 'Sales & Outbound Engines',
      desc: 'CRM sync automations, lead enrichers, and high-convert scrapers to automatically grow pipelines.',
      icon: Trophy,
      count: automations.filter(a => a.category === 'Sales').length,
      category: 'Sales',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      id: 'finance',
      title: 'Finance & Invoice Auto-matchers',
      desc: 'PDF parsing routines, instant Stripe synchronization, billing ledgers, and dynamic Slack alerts.',
      icon: Lightbulb,
      count: automations.filter(a => a.category === 'Finance').length,
      category: 'Finance',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'operations',
      title: 'Operations & internal tasks',
      desc: 'File sorting, cloud folder mirroring, automated task assignment calendars, and data loaders.',
      icon: Cpu,
      count: automations.filter(a => a.category === 'Operations').length,
      category: 'Operations',
      gradient: 'from-amber-500 to-orange-600',
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Curated Portfolios
        </span>
        <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
          Flowmint Curated Collections
        </h2>
        <p className="text-[14px] text-neutral-500 font-medium max-w-xl leading-relaxed">
          Unlock maximum operational efficiency. Discover hand-selected, verified automation workflows customized by our lead solutions editor.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => {
          const Icon = col.icon;
          return (
            <div 
              key={col.id}
              onClick={() => onSelectCollection(col.category)}
              className="group bg-white border border-neutral-200 hover:border-neutral-850 p-6 rounded-3xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between h-[230px] relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                    <Icon className="w-5 h-5 text-neutral-700 group-hover:text-blue-600" />
                  </div>
                  <span className="px-3 py-1 bg-neutral-50 text-neutral-500 rounded-full text-[10px] font-extrabold border border-neutral-150 shrink-0">
                    {col.count} Pipelines
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-neutral-950 group-hover:text-blue-600 transition-colors leading-snug">{col.title}</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-semibold line-clamp-2">{col.desc}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-50 flex items-center justify-between text-[11px] font-bold text-neutral-400 group-hover:text-blue-600 transition-colors">
                <span>Browse Curated Portfolio</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor's Choice Spotlight */}
      <div className="p-6 sm:p-8 bg-neutral-950 text-white rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-4 max-w-xl">
          <span className="px-2.5 py-1 bg-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
            Editor's Pick of the Month
          </span>
          <h3 className="text-xl font-extrabold tracking-tight">Smart PDF Parser & HubSpot Sync</h3>
          <p className="text-[12px] text-neutral-300 leading-relaxed font-semibold">
            Synchronizes Stripe charge receipts, runs a background text parsing sequence via custom GPT nodes, matches customer accounts, and logs clean values into your CRM instantly.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button 
              onClick={() => onOpenAutomation('aut1')}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.97]"
            >
              Explore Pipeline
            </button>
            <span className="text-[11px] font-bold text-neutral-400">Hours Saved: 18 hrs/wk</span>
          </div>
        </div>
      </div>

    </div>
  );
}
