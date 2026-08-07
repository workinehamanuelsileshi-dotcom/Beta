import { Automation } from '../types';
import { Heart, Bookmark, Star, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import React from 'react';
import { BrandIcon } from './BrandIcons';

interface AutomationCardProps {
  key?: string;
  automation: Automation;
  isBookmarked: boolean;
  isLiked: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleLike: (id: string) => void;
  onOpenPreview: (id: string) => void;
}

export default function AutomationCard({
  automation,
  isBookmarked,
  isLiked,
  onToggleBookmark,
  onToggleLike,
  onOpenPreview
}: AutomationCardProps) {
  const getTagColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'customer support': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'sales': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'finance': return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'ai agents': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      default: return 'bg-neutral-100 text-neutral-800 border border-neutral-200';
    }
  };

  const tagColor = getTagColor(automation.category);
  const platforms = automation.integrations || automation.platforms || [];
  const creatorDisplay = automation.creatorName || (automation.creatorId ? automation.creatorId.split('@')[0] : 'Creator');
  const avatarUrl = automation.creatorAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(creatorDisplay)}`;
  const titleText = automation.title || automation.name;
  const descText = automation.description || automation.problemSolved;
  const ratingVal = automation.rating || 4.9;
  const reviewCount = automation.reviewCount || 120;
  const savesCount = automation.savesCount || automation.likesCount || 312;

  return (
    <div 
      onClick={() => onOpenPreview(automation.id)}
      className="group bg-white border border-[#E6E9EF] rounded-2xl p-4 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(11,18,32,0.08)] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between text-left select-none relative cursor-pointer break-inside-avoid mb-6"
    >
      <div>
        {/* Top Image Thumbnail Area */}
        <div className="relative w-full h-44 bg-neutral-100 rounded-xl overflow-hidden mb-4 border border-[#E6E9EF]">
          {automation.thumbnailUrl ? (
            <img 
              src={automation.thumbnailUrl} 
              alt={titleText} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#EAF0FF]/60 flex flex-col items-center justify-center p-4">
              {platforms.length > 0 ? (
                <div className="flex items-center space-x-2">
                  {platforms.slice(0, 3).map((brand, idx) => (
                    <div key={brand} className="p-2 bg-white rounded-xl shadow-xs border border-neutral-200 flex items-center justify-center">
                      <BrandIcon name={brand.toLowerCase()} className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-[#2F5FF6] text-xs font-bold">
                  <Zap className="w-5 h-5" />
                  <span>Verified Automation Pipeline</span>
                </div>
              )}
            </div>
          )}

          {/* Top-left: Match Score Badge if available */}
          {typeof automation.matchScore === 'number' && automation.matchScore > 0 && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-[#2F5FF6] text-white rounded-full text-[10px] font-extrabold shadow-sm tracking-wide">
                {automation.matchScore}% Match
              </span>
            </div>
          )}

          {/* Top-right: Bookmark/Save Button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(automation.id);
              }}
              className={`p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-all duration-150 active:scale-90 cursor-pointer ${
                isBookmarked ? 'text-[#2F5FF6] bg-blue-50' : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title={isBookmarked ? 'Saved' : 'Save automation'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pill & Tags */}
        <div className="flex items-center space-x-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${tagColor}`}>
            {automation.category || 'Operations'}
          </span>
          {automation.tags && automation.tags[0] && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600">
              #{automation.tags[0]}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-[15px] font-extrabold text-[#0B1220] group-hover:text-[#2F5FF6] transition-colors duration-200 font-sans leading-snug line-clamp-1">
            {titleText}
          </h3>
          <p className="text-[12px] text-[#68707E] font-medium leading-relaxed font-sans line-clamp-2">
            {descText}
          </p>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="mt-4 pt-3.5 border-t border-[#E6E9EF] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={avatarUrl} 
            alt={creatorDisplay} 
            className="w-6 h-6 rounded-full object-cover border border-[#E6E9EF]"
            referrerPolicy="no-referrer"
          />
          <span className="text-[11px] font-bold text-[#0B1220] truncate max-w-[100px]">{creatorDisplay}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-[11px] text-[#68707E] font-semibold">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{ratingVal}</span>
            <span className="text-neutral-300">({savesCount})</span>
          </div>
          <span className="text-[13px] font-extrabold text-[#0B1220] font-mono">
            {typeof automation.price === 'number' ? `$${automation.price}` : automation.price}
          </span>
        </div>
      </div>
    </div>
  );
}

