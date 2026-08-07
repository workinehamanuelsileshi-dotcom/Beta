import React from 'react';
import { LayoutGrid, Cpu, TrendingUp, Sparkles, BarChart3, Users, Network } from 'lucide-react';
import { CATEGORIES } from '../data';
import { Automation } from '../types';

interface CategoryExplorerProps {
  automations: Automation[];
  onSelectCategory: (category: string) => void;
  onOpenAutomation: (id: string) => void;
}

export default function CategoryExplorer({ automations, onSelectCategory, onOpenAutomation }: CategoryExplorerProps) {
  // Compute some high-fidelity statistics for categories
  const categoryStats = [
    { name: 'Sales', count: automations.filter(a => a.category === 'Sales').length, trend: '+24%', color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp, desc: 'Lead retrieval, CRM sync, cold sales pipeline automation' },
    { name: 'Customer Support', count: automations.filter(a => a.category === 'Customer Support').length, trend: '+18%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Users, desc: 'Auto-responders, multi-agent ticketing, instant resolve engines' },
    { name: 'Marketing', count: automations.filter(a => a.category === 'Marketing').length, trend: '+12%', color: 'text-purple-600', bg: 'bg-purple-50', icon: Sparkles, desc: 'AI content generation, automated scheduled campaigns, performance analytics' },
    { name: 'Operations', count: automations.filter(a => a.category === 'Operations').length, trend: '+31%', color: 'text-orange-600', bg: 'bg-orange-50', icon: Cpu, desc: 'Internal tasks, folder management, dynamic Slack notifications' },
    { name: 'Finance', count: automations.filter(a => a.category === 'Finance').length, trend: '+7%', color: 'text-amber-600', bg: 'bg-amber-50', icon: BarChart3, desc: 'Billing synchronization, quick invoice parsing, expense trackers' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Category Hero */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Flowmint Ecosystem
        </span>
        <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
          Category Explorer
        </h2>
        <p className="text-[14px] text-neutral-500 font-medium max-w-xl leading-relaxed">
          Browse specialized AI automation pipelines categorised by business function. Tap any category to narrow your active search feed instantly.
        </p>
      </div>

      {/* Category Statistics & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group bg-white border border-neutral-200 hover:border-neutral-850 p-6 rounded-3xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] cursor-pointer flex flex-col justify-between h-[210px] text-left active:scale-[0.98]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center border border-neutral-100/50`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-1">
                    <span>Trending</span>
                    <span className="text-emerald-500 font-black">{cat.trend}</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{cat.name}</h4>
                  <p className="text-[11px] text-neutral-400 font-medium mt-1 leading-relaxed line-clamp-2">{cat.desc}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-50 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>{cat.count} Active Solutions</span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">Explore Feed →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured AI Pipelines Section */}
      <div className="space-y-5 pt-4">
        <h3 className="text-[15px] font-extrabold text-neutral-900 tracking-tight font-sans">
          Top Rated Category Pick
        </h3>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl text-left">
            <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full">
              Editor's Spotlight
            </span>
            <h4 className="text-lg font-bold leading-tight">AI Multi-Channel Support Lead Dispatcher</h4>
            <p className="text-[12px] text-blue-100/90 leading-relaxed font-medium">
              Automatically listens to incoming emails, website forms, and Slack messages. Utilizes deep sentiment extraction to assign prioritized pipelines directly to sales representatives.
            </p>
          </div>

          <button 
            onClick={() => onOpenAutomation('aut1')}
            className="px-5 py-3 bg-white hover:bg-neutral-50 text-blue-600 text-[12px] font-bold rounded-2xl transition-all duration-150 shrink-0 shadow-sm active:scale-[0.96] cursor-pointer"
          >
            Launch Case Study
          </button>
        </div>
      </div>

    </div>
  );
}
