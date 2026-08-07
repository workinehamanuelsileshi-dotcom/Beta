import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Mail, MapPin, Sparkles, Code, Globe, MessageSquare, DollarSign, Briefcase, ChevronRight, ArrowLeft, Heart, Users } from 'lucide-react';
import { Automation, Creator } from '../types';
import { FlowDB } from '../lib/database';

interface CreatorDirectoryProps {
  automations: Automation[];
  onOpenAutomation: (id: string) => void;
  onStartChat: (creatorName: string) => void;
}

export default function CreatorDirectory({ automations, onOpenAutomation, onStartChat }: CreatorDirectoryProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTech, setFilterTech] = useState('all');
  const [creators, setCreators] = useState<Creator[]>(() => FlowDB.getCreators());

  useEffect(() => {
    const handleSync = () => {
      setCreators(FlowDB.getCreators());
    };
    window.addEventListener('flowdb-sync', handleSync);
    return () => window.removeEventListener('flowdb-sync', handleSync);
  }, []);

  const handleBack = () => {
    setSelectedCreatorId(null);
  };

  const selectedCreator = creators.find(c => c.id === selectedCreatorId);

  // If a creator is selected, render their Profile
  if (selectedCreator) {
    const creatorAutomations = automations.filter(a => a.creatorId === selectedCreator.id);

    return (
      <div className="space-y-8 animate-fadeIn text-left">
        
        {/* Profile Header */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleBack}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer text-neutral-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-400">Back to Creator Directory</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedCreator.avatar} 
                alt={selectedCreator.name} 
                className="w-20 h-20 rounded-full object-cover border-2 border-neutral-100 outline outline-1 outline-black/15 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-950 font-sans leading-none">{selectedCreator.name}</h2>
                  <ShieldCheck className="w-5 h-5 text-blue-600 fill-blue-50" />
                </div>
                <p className="text-[13px] text-neutral-400 font-bold leading-none">{selectedCreator.handle}</p>
                <div className="flex items-center space-x-3 text-[11px] text-neutral-500 font-bold">
                  <span className="flex items-center space-x-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-neutral-900">{selectedCreator.rating}</span>
                    <span className="text-neutral-400 font-semibold">({selectedCreator.reviewsCount} reviews)</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{selectedCreator.country}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button 
                onClick={() => onStartChat(selectedCreator.name)}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl cursor-pointer transition-all active:scale-[0.96]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Creator</span>
              </button>
              <div className={`px-4 py-3 rounded-2xl text-[11px] font-bold border ${
                selectedCreator.availability === 'Available'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                {selectedCreator.availability === 'Available' ? '● Available for Custom Hire' : '● Fully Booked'}
              </div>
            </div>
          </div>

          <p className="text-[14px] text-neutral-600 leading-relaxed font-medium max-w-2xl pt-2">
            {selectedCreator.bio}
          </p>

          <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Total Sales</p>
              <p className="text-lg font-bold text-neutral-950 mt-1">{selectedCreator.totalSales}</p>
            </div>
            <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Revenue Generated</p>
              <p className="text-lg font-bold text-neutral-950 mt-1">{selectedCreator.revenueGenerated}</p>
            </div>
            <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Rating Score</p>
              <p className="text-lg font-bold text-neutral-950 mt-1">{selectedCreator.rating} / 5.0</p>
            </div>
            <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Author Rank</p>
              <p className="text-lg font-bold text-neutral-950 mt-1">Level 4 Elite</p>
            </div>
          </div>

        </div>

        {/* Creator Portfolio Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold tracking-tight text-neutral-950 font-sans">
              Author Portfolio ({creatorAutomations.length} Active Automations)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creatorAutomations.map((aut) => (
              <div 
                key={aut.id}
                onClick={() => onOpenAutomation(aut.id)}
                className="group bg-white border border-neutral-200/90 hover:border-neutral-800 p-5 rounded-3xl transition-all duration-200 hover:shadow-md cursor-pointer text-left space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-neutral-50 text-neutral-500 rounded-full text-[9px] font-extrabold tracking-wide border border-neutral-150">
                      {aut.category}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">{aut.price}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-neutral-950 group-hover:text-blue-600 transition-colors leading-snug">{aut.name}</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-semibold line-clamp-2">{aut.problemSolved}</p>
                </div>

                <div className="pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] font-bold text-neutral-500">
                  <span className="text-blue-600">ROI: {aut.roi}</span>
                  <span>Hours Saved: {aut.hoursSaved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // Filter creators list based on search and technology
  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = filterTech === 'all' || c.technologies.includes(filterTech);
    return matchesSearch && matchesTech;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Verified Experts
        </span>
        <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
          Creator Directory
        </h2>
        <p className="text-[14px] text-neutral-500 font-medium max-w-xl leading-relaxed">
          Hire certified experts, browse elite automation architects, and buy production-tested pipelines crafted by top-tier builders.
        </p>
      </div>

      {/* Directory Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search verified creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-neutral-400 font-medium text-neutral-800"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-neutral-400">Technology:</span>
          <select 
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Tech</option>
            <option value="OpenAI">OpenAI</option>
            <option value="HubSpot">HubSpot</option>
            <option value="Slack">Slack</option>
            <option value="Airtable">Airtable</option>
            <option value="Zapier">Zapier</option>
          </select>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => (
          <div 
            key={creator.id}
            onClick={() => setSelectedCreatorId(creator.id)}
            className="group bg-white border border-neutral-200 hover:border-neutral-850 p-6 rounded-3xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] cursor-pointer text-left space-y-4 flex flex-col justify-between h-[300px]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  className="w-12 h-12 rounded-full object-cover border border-neutral-100 outline outline-1 outline-black/10"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center space-x-1 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-150 text-[10px] font-bold text-neutral-900">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{creator.rating}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-[14px] font-bold text-neutral-950 group-hover:text-blue-600 transition-colors leading-none">{creator.name}</h4>
                  <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-50" />
                </div>
                <p className="text-[10px] text-neutral-400 font-bold leading-none">{creator.handle}</p>
              </div>

              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed line-clamp-3">
                {creator.bio}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-50">
              <div className="flex flex-wrap gap-1">
                {(creator.technologies || []).slice(0, 3).map((tech) => (
                  <span key={tech} className="px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded-full text-[9px] font-bold text-neutral-500">
                    {tech}
                  </span>
                ))}
                {(creator.technologies || []).length > 3 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-neutral-400">+{(creator.technologies || []).length - 3}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
                <span>{creator.totalSales} Sales</span>
                <span className="text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                  <span>View Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
