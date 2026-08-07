import React from 'react';
import { 
  Sparkles, 
  Compass, 
  FolderHeart, 
  Grid, 
  Users, 
  Building2, 
  Cpu, 
  Bookmark, 
  Eye, 
  MessageSquare, 
  Briefcase, 
  ChevronDown, 
  Mail,
  Database,
  ArrowRight,
  LogOut,
  Settings
} from 'lucide-react';
import { BusinessDNA } from '../types';
import { Check } from 'lucide-react';

interface LeftSidebarProps {
  businessDNA: BusinessDNA;
  onOpenDNA: () => void;
  savedCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDatabase?: () => void;
  onLogOut: () => void;
  userProfile?: any;
}

export default function LeftSidebar({
  businessDNA,
  onOpenDNA,
  savedCount,
  activeTab,
  setActiveTab,
  onOpenDatabase,
  onLogOut,
  userProfile
}: LeftSidebarProps) {
  const isCreator = userProfile?.userType === 'creator';

  const primaryMenu = isCreator ? [
    { id: 'creator-dashboard', label: 'Creator Portal', icon: Sparkles },
    { id: 'discover', label: 'Marketplace Feed', icon: Compass },
    { id: 'collections', label: 'Collections', icon: FolderHeart },
    { id: 'creators', label: 'Global Builders', icon: Users },
  ] : [
    { id: 'discover', label: 'Marketplace', icon: Compass },
    { id: 'collections', label: 'Collections', icon: FolderHeart },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'creators', label: 'Creators', icon: Users },
  ];

  const myFlowmintMenu = [
    { id: 'saved', label: 'Saved Automations', icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-white/75 backdrop-blur-xl border-r border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-screen sticky top-0 text-left select-none p-5 shrink-0 hidden lg:flex z-20">
      
      {/* Top Section */}
      <div className="space-y-4 overflow-y-auto scrollbar-none flex-1 pb-4 pr-1">
        
        {/* Logo */}
        <div className="flex items-center space-x-2.5 px-1 py-1">
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Cpu className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-md font-extrabold text-neutral-950 tracking-tight font-sans">Flowmint</span>
        </div>

        {/* Primary Menu */}
        <div className="space-y-1 pt-2">
          {primaryMenu.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id || (item.id === 'discover' && activeTab === 'all');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id === 'discover' ? 'all' : item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-150 cursor-pointer ${
                  active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-950'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider 1 */}
        <hr className="border-neutral-200/90 my-3" />

        {/* Personal section: Saved Automations, Recent Views, Messages, Projects */}
        <div className="space-y-1">
          {myFlowmintMenu.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-150 cursor-pointer ${
                  active 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}


        </div>



      </div>

      {/* User Profile pinned to bottom */}
      <div className="pt-4 border-t border-neutral-200/95 flex items-center justify-between bg-white shrink-0">
        {userProfile ? (
          <>
            <div className="flex items-center space-x-2.5">
              <img 
                src={userProfile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150"} 
                alt={userProfile.name} 
                className="w-8 h-8 rounded-full object-cover border border-neutral-200 outline outline-1 outline-black/10 outline-offset-[-1px]"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <h6 className="text-[12px] font-bold text-neutral-950 leading-none truncate max-w-[100px]">{userProfile.name}</h6>
                <p className="text-[10px] text-neutral-500 font-semibold mt-1 truncate max-w-[100px]">{userProfile.role || 'Business Plan'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={onLogOut}
                className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer active:scale-[0.96] transition-all duration-150 border border-transparent hover:border-red-100"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              
              <button 
                onClick={onOpenDNA}
                className="p-1.5 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer active:scale-[0.96] transition-transform duration-150"
                title="View DNA Settings"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={onOpenDNA}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl active:scale-[0.96] transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1 shadow-sm shadow-blue-500/10"
          >
            <span>Sign In / Connect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </aside>
  );
}
