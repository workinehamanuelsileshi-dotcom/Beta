import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, ShieldCheck, Sparkles, LayoutGrid, Fingerprint, Lock } from 'lucide-react';
import { FlowDB } from '../lib/database';
import { Automation, Creator, BusinessDNA } from '../types';

interface RightSidebarPanelProps {
  onOpenAutomation: (id: string) => void;
}

export default function RightSidebarPanel({ onOpenAutomation }: RightSidebarPanelProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [businessDNA, setBusinessDNA] = useState<BusinessDNA | null>(null);
  const [allAutomations, setAllAutomations] = useState<Automation[]>([]);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const handleSync = () => {
      setAllAutomations(FlowDB.getAutomations());
      setAllCreators(FlowDB.getCreators());
      setBusinessDNA(FlowDB.getBusinessDNA());
      try {
        const saved = localStorage.getItem('flowmint_user_profile');
        setUserProfile(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setUserProfile(null);
      }
    };

    handleSync();
    return FlowDB.subscribe(handleSync);
  }, []);

  // Compute recommendations dynamically from real database content based on User DNA
  const getDisplayRecommendations = () => {
    if (!userProfile || !businessDNA) return [];
    
    const interests = businessDNA.interests || [];
    const industry = businessDNA.industry || '';

    const recommended = (allAutomations || []).filter(aut => {
      const matchesCategory = interests.some(interest =>
        aut?.category?.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(aut?.category?.toLowerCase() || '')
      );
      const matchesIndustry = aut?.industry?.toLowerCase() === industry.toLowerCase();
      return matchesCategory || matchesIndustry;
    });

    return recommended.length > 0 ? recommended.slice(0, 2) : (allAutomations || []).slice(0, 2);
  };

  // Compute trending items dynamically from real database content based on likesCount
  const getDisplayTrending = () => {
    if (!userProfile) return [];
    return [...(allAutomations || [])]
      .sort((a, b) => (b?.likesCount || 0) - (a?.likesCount || 0))
      .slice(0, 4);
  };

  // Compute categories dynamically from real database content
  const getDisplayCategories = () => {
    if (!userProfile) return [];
    
    const categoryCounts = (allAutomations || []).reduce((acc, aut) => {
      if (aut?.category) {
        acc[aut.category] = (acc[aut.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .map(([name, count]) => {
        const cnt = count as number;
        return {
          name,
          count: `${cnt} solution${cnt > 1 ? 's' : ''}`,
          active: businessDNA?.interests?.includes(name) || false
        };
      })
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 4);
  };

  // Compute creators dynamically from real database content
  const getDisplayCreators = () => {
    if (!userProfile) return [];
    return [...(allCreators || [])]
      .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
      .slice(0, 3);
  };

  const recommendedItems = getDisplayRecommendations();
  const trendingItems = getDisplayTrending();
  const popularCategories = getDisplayCategories();
  const topCreators = getDisplayCreators();

  return (
    <aside className="w-80 shrink-0 lg:sticky lg:top-6 space-y-5 text-left select-none hidden xl:block pb-12">
      
      {/* 1. Recommended For You Card */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <h4 className="text-[13px] font-bold text-neutral-950 tracking-tight font-sans">Recommended For You</h4>
          </div>
          {userProfile && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold">Personalized</span>
          )}
        </div>

        {!userProfile ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
            <Fingerprint className="w-5 h-5 text-neutral-300 mx-auto" />
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">
              No active recommendations. Please sign up or log in to generate your Business DNA.
            </p>
          </div>
        ) : recommendedItems.length === 0 ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">
              No recommendations matched your current interest filters yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendedItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => onOpenAutomation(item.id)}
                className="p-3 bg-neutral-50/55 hover:bg-blue-50/20 border border-neutral-100 hover:border-blue-100 rounded-2xl cursor-pointer transition-all duration-150 group"
              >
                <h5 className="text-[12px] font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug">{item.name}</h5>
                <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500 font-medium">
                  <span>ROI: <strong className="text-blue-600">{item.roi}</strong></span>
                  <span className="text-neutral-950 font-bold">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Trending This Week Card */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="text-[13px] font-bold text-neutral-950 tracking-tight font-sans">Trending This Week</h4>
          </div>
          {userProfile && (
            <span className="text-[11px] font-bold text-neutral-400">Market</span>
          )}
        </div>

        {!userProfile ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
            <TrendingUp className="w-5 h-5 text-neutral-300 mx-auto" />
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">
              Sign in to view real-time market trends.
            </p>
          </div>
        ) : trendingItems.length === 0 ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center">
            <p className="text-[11px] text-neutral-400 font-medium">No trending solutions logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {trendingItems.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => onOpenAutomation(item.id)}
                className="group flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-[12px] font-bold text-neutral-300 group-hover:text-blue-600 transition-colors w-3">{index + 1}</span>
                  <div>
                    <h5 className="text-[12px] font-bold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">{item.name}</h5>
                    <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-0.5 text-[10px] font-bold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded-lg shrink-0">
                  <span>★ {(5 - (index * 0.1)).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Popular Categories Card */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <h4 className="text-[13px] font-bold text-neutral-950 tracking-tight font-sans">Popular Categories</h4>
          </div>
        </div>

        {!userProfile ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
            <LayoutGrid className="w-5 h-5 text-neutral-300 mx-auto" />
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">
              Sign in to explore solutions across categories.
            </p>
          </div>
        ) : popularCategories.length === 0 ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center">
            <p className="text-[11px] text-neutral-400 font-medium">No popular categories logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {popularCategories.map((cat) => (
              <div 
                key={cat.name} 
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-[12px] font-medium transition-colors ${
                  cat.active 
                    ? 'bg-blue-50/55 border-blue-100 text-blue-900 font-semibold' 
                    : 'bg-white border-neutral-100 text-neutral-600'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] ${cat.active ? 'text-blue-600 font-bold' : 'text-neutral-400'}`}>{cat.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Top Creators Card */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="text-[13px] font-bold text-neutral-950 tracking-tight font-sans">Top Creators</h4>
          </div>
        </div>

        {!userProfile ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
            <ShieldCheck className="w-5 h-5 text-neutral-300 mx-auto" />
            <p className="text-[11px] text-neutral-400 font-medium leading-normal">
              Sign in to connect with verified specialists.
            </p>
          </div>
        ) : topCreators.length === 0 ? (
          <div className="py-6 px-4 border border-dashed border-neutral-200 rounded-2xl text-center">
            <p className="text-[11px] text-neutral-400 font-medium">No registered creator networks found.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {topCreators.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-7 h-7 rounded-full object-cover border border-neutral-250 outline outline-1 outline-black/10 outline-offset-[-1px]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="flex items-center space-x-0.5">
                      <span className="text-[12px] font-bold text-neutral-900 leading-none">{creator.name}</span>
                      {creator.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />}
                    </div>
                    <p className="text-[9px] text-neutral-400 font-medium mt-0.5">{creator.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-0.5 text-[10px] font-bold text-neutral-900 shrink-0">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{creator.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
}
