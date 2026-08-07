import React, { useState, useEffect, useMemo } from 'react';
import LeftSidebar from './components/LeftSidebar';
import AutomationCard from './components/AutomationCard';
import WorkflowModal from './components/WorkflowModal';

import DatabaseManager from './components/DatabaseManager';
import CategoryExplorer from './components/CategoryExplorer';
import CreatorDirectory from './components/CreatorDirectory';
import MessagesPage from './components/MessagesPage';
import ProjectsPage from './components/ProjectsPage';
import CollectionsPage from './components/CollectionsPage';
import SettingsPage from './components/SettingsPage';
import EnterprisePage from './components/EnterprisePage';
import OnboardingModal from './components/OnboardingModal';
import AuthPage from './components/AuthPage';
import CreatorDashboard from './components/CreatorDashboard';
import { FlowDB } from './lib/database';
import { INDUSTRIES, TECH_STACKS } from './data';
import { Automation, BusinessDNA, AISearchResult } from './types';
import { 
  Search, 
  Bell, 
  Plus, 
  SlidersHorizontal, 
  RotateCcw, 
  X, 
  Check, 
  Fingerprint, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Database,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  // 1. Reactive Database Integration (FlowDB)
  const [automations, setAutomations] = useState<Automation[]>(() => FlowDB.getAutomations());
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);

  // 2. Personalization / Business DNA State
  const [businessDNA, setBusinessDNA] = useState<BusinessDNA>(() => FlowDB.getBusinessDNA());
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('flowmint_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasVisited, setHasVisited] = useState(() => {
    return localStorage.getItem('flowmint_visited') === 'true';
  });

  // FlowDB Synchronization listener
  useEffect(() => {
    const handleSync = () => {
      setAutomations(FlowDB.getAutomations());
      setBusinessDNA(FlowDB.getBusinessDNA());
      try {
        const saved = localStorage.getItem('flowmint_user_profile');
        setUserProfile(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setUserProfile(null);
      }
    };
    handleSync();
    const timer = setTimeout(() => {
      setIsAutomationsLoading(false);
    }, 450);
    return () => {
      FlowDB.subscribe(handleSync)();
      clearTimeout(timer);
    };
  }, []);

  const [isAutomationsLoading, setIsAutomationsLoading] = useState(true);

  // Open onboarding on very first load
  useEffect(() => {
    if (!hasVisited) {
      setIsOnboardingOpen(true);
      localStorage.setItem('flowmint_visited', 'true');
      setHasVisited(true);
    }
  }, [hasVisited]);

  // 3. Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedROI, setSelectedROI] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // 4. Search query State
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Saved / Liked Automations State (with persistence)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('flowmint_bookmarks');
    return saved ? JSON.parse(saved) : ['aut1', 'aut4']; // Preset bookmarks
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('flowmint_likes');
    return saved ? JSON.parse(saved) : ['aut2'];
  });

  useEffect(() => {
    localStorage.setItem('flowmint_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('flowmint_likes', JSON.stringify(likedIds));
  }, [likedIds]);

  // 6. Modal View States
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // 7. Custom AI Search Results State
  const [customAIWorkflow, setCustomAIWorkflow] = useState<AISearchResult | null>(null);
  
  // 8. Dribbble Tab, Sorting & Load More states
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('flowmint_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userType === 'creator') {
          return 'creator-dashboard';
        }
      }
    } catch (e) {}
    return 'discover';
  });
  const [activeNavigationTab, setActiveNavigationTab] = useState('foryou');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(8);
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>(['aut1', 'aut2']);
  const [initialChatCreator, setInitialChatCreator] = useState('FlowGenius');

  // Sidebar expand/collapse states synced with localStorage to prevent layout shifts upon navigation and reloads
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);

  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem('flowmint_left_sidebar_expanded');
      if (savedLeft !== null) {
        setIsLeftSidebarExpanded(JSON.parse(savedLeft));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('flowmint_left_sidebar_expanded', JSON.stringify(isLeftSidebarExpanded));
    } catch {}
  }, [isLeftSidebarExpanded]);

  const recommendedAutomations = useMemo(() => {
    if (!userProfile || !businessDNA) return automations.slice(0, 3);
    const interests = businessDNA.interests || [];
    const industry = businessDNA.industry || '';
    const recs = automations.filter(aut => {
      const matchesCategory = interests.some(interest =>
        aut?.category?.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(aut?.category?.toLowerCase() || '')
      );
      const matchesIndustry = aut?.industry?.toLowerCase() === industry.toLowerCase();
      return matchesCategory || matchesIndustry;
    });
    return recs.length > 0 ? recs.slice(0, 3) : automations.slice(0, 3);
  }, [automations, userProfile, businessDNA]);

  const trendingAutomations = useMemo(() => {
    return [...automations]
      .sort((a, b) => (b?.likesCount || 0) - (a?.likesCount || 0))
      .slice(0, 3);
  }, [automations]);

  const handleUpdateDNA = (newDNA: BusinessDNA) => {
    setBusinessDNA(newDNA);
    FlowDB.updateBusinessDNA(newDNA);
  };

  const handleLogOut = () => {
    // Clear visiting and persistent states
    localStorage.removeItem('flowmint_visited');
    localStorage.removeItem('flowmint_onboarding_step');
    localStorage.removeItem('flowmint_onboarding_draft');
    localStorage.removeItem('flowdb_business_dna');
    localStorage.removeItem('flowmint_user_profile');
    
    // Reset hasVisited
    setHasVisited(false);
    setUserProfile(null);
    
    const emptyDNA: BusinessDNA = {
      companyName: '',
      website: '',
      industry: 'Finance & Fintech',
      country: 'United States',
      companySize: '1-10',
      revenueStage: '< $1M',
      goals: [],
      challengesText: '',
      extractedPainPoints: [],
      extractedOpportunities: [],
      extractedKeywords: [],
      techStack: [],
      interests: [],
      monthlyBudget: '',
      timeline: '',
      urgency: 'Medium',
      projectSize: 'Small Business',
      commChannel: 'Email digests',
      timezone: 'GMT+0 (London Greenwich Time)',
      language: 'English',
      maturity: 'Beginner'
    };
    
    setBusinessDNA(emptyDNA);
    FlowDB.updateBusinessDNA(emptyDNA);
    
    // Instantly show the onboarding overlay with options to configure new DNA or login
    setIsOnboardingOpen(true);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleToggleLike = (id: string) => {
    setLikedIds(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleOpenWorkflow = (id: string) => {
    setActiveWorkflowId(id);
    setRecentViewedIds(prev => {
      const filtered = prev.filter(v => v !== id);
      return [id, ...filtered];
    });
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedIndustry('all');
    setSelectedComplexity('all');
    setSelectedPrice('all');
    setSelectedROI('all');
    setVerifiedOnly(false);
    setSearchQuery('');
    setSortBy('popular');
    setActiveNavigationTab('foryou');
    setVisibleCount(8);
  };

  // 7. Filter and Re-evaluate feed dynamically
  const getFilteredAutomations = (): Automation[] => {
    let list = automations.filter(aut => aut.status !== 'draft');

    // Filter by Dribbble Tab
    if (activeNavigationTab === 'saved') {
      list = list.filter(aut => bookmarkedIds.includes(aut.id));
    } else if (activeNavigationTab === 'following') {
      // Show automations from creators the user follows (verified creators)
      list = list.filter(aut => ['c1', 'c2', 'c3'].includes(aut.creatorId));
    } else if (activeNavigationTab === 'trending') {
      // Sort by rating or ROI, or we can just prioritize high rated/ROI ones
      list = (list || []).slice().sort((a, b) => {
        const ratingA = parseFloat((a?.roi || '$0').replace(/[^0-9]/g, '')) || 0;
        const ratingB = parseFloat((b?.roi || '$0').replace(/[^0-9]/g, '')) || 0;
        return ratingB - ratingA;
      });
    } else if (activeNavigationTab === 'newest') {
      // Newest added first
      list = (list || []).slice().reverse();
    } else if (activeNavigationTab === 'foryou') {
      // Prioritize the user's DNA industry or stack matching
      const userInd = (businessDNA?.industry || 'SaaS & Tech').toLowerCase().split(' ')[0];
      list = (list || []).slice().sort((a, b) => {
        const matchA = (a?.industry || '').toLowerCase().includes(userInd) ? 1 : 0;
        const matchB = (b?.industry || '').toLowerCase().includes(userInd) ? 1 : 0;
        return matchB - matchA;
      });
    }

    // Standard search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(aut => {
        const matchesName = (aut?.name || '').toLowerCase().includes(query);
        const matchesProblem = (aut?.problemSolved || '').toLowerCase().includes(query);
        const matchesCategory = (aut?.category || '').toLowerCase().includes(query);
        return matchesName || matchesProblem || matchesCategory;
      });
    }

    // Category Filter (Mapped dynamically from our search tags)
    if (activeCategory !== 'all') {
      const catLower = activeCategory.toLowerCase();
      list = list.filter(aut => {
        const autoCatLower = (aut?.category || '').toLowerCase();
        if (catLower === 'customer support' && autoCatLower !== 'customer support') return false;
        if (catLower === 'lead generation' && autoCatLower !== 'sales') return false;
        if (catLower === 'invoice automation' && autoCatLower !== 'finance') return false;
        if (catLower === 'crm' && autoCatLower !== 'sales' && autoCatLower !== 'operations') return false;
        if (catLower === 'hr onboarding' && autoCatLower !== 'operations') return false;
        if (catLower === 'data entry' && autoCatLower !== 'operations') return false;
        if (catLower === 'ai agents' && autoCatLower !== 'customer support' && autoCatLower !== 'sales') return false;
        return true;
      });
    }
    
    // Industry Filter
    if (selectedIndustry !== 'all') {
      list = list.filter(aut => aut?.industry === selectedIndustry);
    }
    
    // Complexity Filter
    if (selectedComplexity !== 'all') {
      list = list.filter(aut => aut?.difficulty === selectedComplexity);
    }
    
    // Price Tier Filter
    if (selectedPrice !== 'all') {
      list = list.filter(aut => {
        const priceStr = aut?.price || '$0';
        const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
        if (selectedPrice === 'under1k' && numericPrice >= 1000) return false;
        if (selectedPrice === '1kto2k' && (numericPrice < 1000 || numericPrice > 2000)) return false;
        if (selectedPrice === 'over2k' && numericPrice <= 2000) return false;
        return true;
      });
    }
    
    // ROI Filter
    if (selectedROI !== 'all') {
      const limit = parseInt(selectedROI, 10);
      list = list.filter(aut => {
        const roiStr = aut?.roi || '$0';
        const numericROI = parseInt(roiStr.replace(/[^0-9]/g, ''), 10) || 0;
        return numericROI >= limit;
      });
    }

    // Verified Creator Filter
    if (verifiedOnly) {
      list = list.filter(aut => ['c1', 'c2', 'c3'].includes(aut?.creatorId));
    }

    // Apply Sorting dropdown state if it's not overridden by specific tab sorts
    if (sortBy === 'newest') {
      list = (list || []).slice().reverse();
    } else if (sortBy === 'roi') {
      list = (list || []).slice().sort((a, b) => {
        const roiA = parseInt((a?.roi || '$0').replace(/[^0-9]/g, ''), 10) || 0;
        const roiB = parseInt((b?.roi || '$0').replace(/[^0-9]/g, ''), 10) || 0;
        return roiB - roiA;
      });
    } else if (sortBy === 'popular') {
      // Let's rank by a custom score
      list = (list || []).slice().sort((a, b) => {
        const scoreA = parseFloat((a?.roi || '$0').replace(/[^0-9]/g, '')) * (a?.creatorId === 'c1' ? 1.2 : 1) || 0;
        const scoreB = parseFloat((b?.roi || '$0').replace(/[^0-9]/g, '')) * (b?.creatorId === 'c1' ? 1.2 : 1) || 0;
        return scoreB - scoreA;
      });
    }

    return list;
  };

  const filteredAutomations = getFilteredAutomations();
  const activeSelectedAutomation = automations.find(aut => aut.id === activeWorkflowId);

  // Suggested category filters matching the mockup image tags exactly
  const searchTags = [
    { label: 'Customer Support', value: 'Customer Support' },
    { label: 'Lead Generation', value: 'Lead Generation' },
    { label: 'Invoice Automation', value: 'Invoice Automation' },
    { label: 'CRM', value: 'CRM' },
    { label: 'HR Onboarding', value: 'HR Onboarding' },
    { label: 'Data Entry', value: 'Data Entry' },
    { label: 'AI Agents', value: 'AI Agents' }
  ];

  if (!userProfile) {
    return (
      <AuthPage 
        onAuthSuccess={(profile, isNewUser) => {
          setUserProfile(profile);
          if (profile.userType === 'creator') {
            setActiveTab('creator-dashboard');
          } else if (isNewUser) {
            setIsOnboardingOpen(true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-blue-100 selection:text-blue-900 flex relative overflow-x-hidden">
      
      {/* 1. Left Sidebar Navigation (Collapsible) */}
      <div className={`transition-all duration-300 ${isLeftSidebarExpanded ? 'w-64' : 'w-0 overflow-hidden opacity-0'}`}>
        <LeftSidebar 
          businessDNA={businessDNA}
          onOpenDNA={() => {
            setActiveTab('settings');
            setIsOnboardingOpen(true);
          }}
          savedCount={bookmarkedIds.length}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'all') {
              setActiveTab('discover');
            }
          }}
          onOpenDatabase={() => setIsDatabaseOpen(true)}
          onLogOut={handleLogOut}
          userProfile={userProfile}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header bar - Dribbble style sticky blurred header */}
        <header className="px-6 md:px-10 py-3.5 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between sticky top-0 z-30 transition-all">
          <div className="flex items-center space-x-6 flex-1">
            {/* Toggle Left Sidebar & Logo */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
                className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 transition-colors cursor-pointer"
                title={isLeftSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('discover')}>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">F</div>
                <span className="font-extrabold text-neutral-950 text-base tracking-tight hidden sm:inline">Flowmint</span>
              </div>
            </div>
            
            {/* Centered Large Dominant Search Bar */}
            <div className="relative flex-1 max-w-xl mx-auto hidden md:block">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </span>
              <input
                type="text"
                placeholder="Search automations, creators, integrations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200/80 rounded-full text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-neutral-200/80 text-neutral-500 rounded text-[10px] font-mono font-bold pointer-events-none">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Become Creator / Sign in action */}
            {userProfile?.userType !== 'creator' && (
              <button
                onClick={() => {
                  if (!userProfile) {
                    setIsOnboardingOpen(true);
                  } else {
                    setActiveTab('creator-dashboard');
                  }
                }}
                className="hidden sm:inline-flex px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Become a Creator
              </button>
            )}

            {/* Message indicator */}
            <button 
              onClick={() => setActiveTab('messages')}
              className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 relative transition-colors cursor-pointer"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* Notification Bell */}
            <button className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 relative transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                6
              </span>
            </button>

            {/* User Avatar */}
            <div 
              onClick={() => setIsOnboardingOpen(true)}
              className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer flex items-center justify-center text-neutral-500 hover:border-neutral-300 transition-all shrink-0"
              title={userProfile ? `Logged in as ${userProfile.name}` : "Sign In"}
            >
              {userProfile ? (
                <img 
                  src={userProfile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150"} 
                  alt={userProfile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Fingerprint className="w-4 h-4 text-neutral-400" />
              )}
            </div>
          </div>
        </header>

        {/* Sticky Dribbble-Style Category/Filter Rail directly below header */}
        {activeTab === 'discover' && (
          <div className="sticky top-[65px] z-20 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 md:px-10 py-3 flex items-center justify-between gap-4">
            {/* Horizontal scrollable row of pill-shaped filter chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
              {[
                { id: 'foryou', label: 'For You' },
                { id: 'trending', label: 'Trending' },
                { id: 'newest', label: 'Newest' },
                { id: 'popular', label: 'Popular' },
                { id: 'Sales', label: 'Sales' },
                { id: 'Customer Support', label: 'Support' },
                { id: 'Marketing', label: 'Marketing' },
                { id: 'Finance', label: 'Finance' },
                { id: 'Operations', label: 'Ops' },
                { id: 'AI Agents', label: 'AI Agents' },
              ].map((tab) => {
                const active = activeNavigationTab === tab.id || activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveNavigationTab(tab.id);
                      if (['Sales', 'Customer Support', 'Marketing', 'Finance', 'Operations', 'AI Agents'].includes(tab.id)) {
                        setActiveCategory(tab.id);
                      } else {
                        setActiveCategory('all');
                      }
                      setVisibleCount(8);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      active 
                        ? 'bg-[#0B1220] text-white shadow-md' 
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sort segment control right-aligned */}
            <div className="hidden lg:flex items-center space-x-2 shrink-0">
              <div className="flex items-center bg-neutral-100/80 border border-neutral-200/80 rounded-full p-0.5 text-xs font-semibold text-neutral-600">
                {['popular', 'roi', 'newest'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSortBy(st)}
                    className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                      sortBy === st ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {st === 'popular' ? 'Popular' : st === 'roi' ? 'Highest ROI' : 'Newest'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inner Content Area */}
        <div className="flex-1 p-6 md:p-10 space-y-8 w-full max-w-7xl mx-auto">
          
          {activeTab === 'discover' && (
            <>
              {/* Context row: Title & Result count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left pt-2">
                <div>
                  <h1 className="text-2xl font-black text-neutral-950 tracking-tight font-sans">
                    Explore Automations
                  </h1>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    Showing {filteredAutomations.length} published creator automations
                  </p>
                </div>

                {/* Mobile Sort & Filters */}
                <div className="flex items-center space-x-2 lg:hidden">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none cursor-pointer"
                  >
                    <option value="popular">Sort: Popular</option>
                    <option value="roi">Sort: ROI</option>
                    <option value="newest">Sort: Newest</option>
                  </select>
                  <button
                    onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                    className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 flex items-center space-x-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>


          {/* Advanced sliding Filter bar */}
          {showAdvanceFilters && (
            <div className="bg-neutral-50/50 border border-neutral-150 p-5 rounded-3xl text-left grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vertical Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-white border border-neutral-150 rounded-xl px-2.5 py-2 text-[12px] text-neutral-700 outline-none cursor-pointer"
                >
                  <option value="all">All Industries</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Complexity Level</label>
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="w-full bg-white border border-neutral-150 rounded-xl px-2.5 py-2 text-[12px] text-neutral-700 outline-none cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ROI (Estimated)</label>
                <select
                  value={selectedROI}
                  onChange={(e) => setSelectedROI(e.target.value)}
                  className="w-full bg-white border border-neutral-150 rounded-xl px-2.5 py-2 text-[12px] text-neutral-700 outline-none cursor-pointer"
                >
                  <option value="all">Any ROI Percentage</option>
                  <option value="300">Over 300% ROI</option>
                  <option value="400">Over 400% ROI</option>
                  <option value="500">Over 500% ROI</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2 border border-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-xl text-[12px] font-bold text-center transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-center transition-all border cursor-pointer ${
                    verifiedOnly 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  {verifiedOnly ? '✓ Verified' : 'Verified Only'}
                </button>
              </div>
            </div>
          )}

          {/* Main Feed Content - Dribbble/Pinterest style Masonry Grid */}
          {isAutomationsLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6 [column-fill:balance] w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="break-inside-avoid mb-6 w-full bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-neutral-100 rounded-full"></div>
                    <div className="h-6 w-6 bg-neutral-100 rounded-full"></div>
                  </div>
                  <div className="h-20 w-full bg-neutral-100 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-4/5 bg-neutral-100 rounded"></div>
                    <div className="h-3 w-full bg-neutral-100 rounded"></div>
                    <div className="h-3 w-2/3 bg-neutral-100 rounded"></div>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                    <div className="h-4 w-16 bg-neutral-100 rounded"></div>
                    <div className="h-4 w-20 bg-neutral-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAutomations.length === 0 ? (
            <div className="p-12 border border-dashed border-neutral-200 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
              <RotateCcw className="w-8 h-8 text-neutral-300 mx-auto animate-spin-slow" />
              <div>
                <h4 className="text-md font-semibold text-neutral-900">No AI Automations Found</h4>
                <p className="text-[12px] text-neutral-400 mt-1 max-w-sm mx-auto">
                  Try relaxing your budget, ROI, or industry filters. Or, use the AI Solutions Architect above to build a custom solution.
                </p>
              </div>
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer"
              >
                Reset Current Filters
              </button>
            </div>
          ) : (
            <div className="space-y-12 text-left">
              
              {/* Curated Sections for Recommended or Trending */}
              {activeNavigationTab === 'foryou' && recommendedAutomations.length > 0 && (
                <div className="space-y-4 mb-10 pb-10 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-neutral-950 uppercase tracking-wide">Recommended For You</h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">Personalized</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendedAutomations.map(aut => (
                      <AutomationCard 
                        key={'rec_' + aut.id}
                        automation={aut}
                        isBookmarked={bookmarkedIds.includes(aut.id)}
                        isLiked={likedIds.includes(aut.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleLike={handleToggleLike}
                        onOpenPreview={handleOpenWorkflow}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeNavigationTab === 'trending' && trendingAutomations.length > 0 && (
                <div className="space-y-4 mb-10 pb-10 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-neutral-950 uppercase tracking-wide">Trending This Week</h3>
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-bold">Top Market</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trendingAutomations.map(aut => (
                      <AutomationCard 
                        key={'trend_' + aut.id}
                        automation={aut}
                        isBookmarked={bookmarkedIds.includes(aut.id)}
                        isLiked={likedIds.includes(aut.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleLike={handleToggleLike}
                        onOpenPreview={handleOpenWorkflow}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Columns masonry layout exactly representing authentic Pinterest masonry */}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6 [column-fill:balance] w-full">
                {filteredAutomations.slice(0, visibleCount).map((aut) => (
                  <div key={aut.id} className="break-inside-avoid mb-6 w-full">
                    <AutomationCard 
                      automation={aut}
                      isBookmarked={bookmarkedIds.includes(aut.id)}
                      isLiked={likedIds.includes(aut.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onToggleLike={handleToggleLike}
                      onOpenPreview={(id) => setActiveWorkflowId(id)}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="flex flex-col items-center justify-center pt-6 pb-12 border-t border-neutral-100">
                {visibleCount < filteredAutomations.length ? (
                  <div className="text-center space-y-3">
                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                      Showing {Math.min(visibleCount, filteredAutomations.length)} of {filteredAutomations.length} AI Automations
                    </p>
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 4)}
                      className="px-6 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-800 text-xs font-bold rounded-full transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm flex items-center space-x-1"
                    >
                      <span>Load More</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-neutral-400 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-150 text-[11px] font-bold uppercase tracking-wide">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span>You've caught up with all AI Automations</span>
                  </div>
                )}
              </div>

            </div>
          )}
          </>)}

          {activeTab === 'collections' && (
            <CollectionsPage 
              automations={automations.filter(aut => aut.status !== 'draft')} 
              onSelectCollection={(cat) => { setActiveCategory(cat); setActiveTab('discover'); }} 
              onOpenAutomation={handleOpenWorkflow} 
            />
          )}

          {activeTab === 'categories' && (
            <CategoryExplorer 
              automations={automations.filter(aut => aut.status !== 'draft')} 
              onSelectCategory={(cat) => { setActiveCategory(cat); setActiveTab('discover'); }} 
              onOpenAutomation={handleOpenWorkflow} 
            />
          )}

          {activeTab === 'creators' && (
            <CreatorDirectory 
              automations={automations.filter(aut => aut.status !== 'draft')} 
              onOpenAutomation={handleOpenWorkflow} 
              onStartChat={(creatorName) => { 
                setInitialChatCreator(creatorName); 
                setActiveTab('messages'); 
              }} 
            />
          )}

          {activeTab === 'saved' && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="bg-neutral-50 border border-neutral-150 p-8 rounded-3xl space-y-3 relative overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Saved Items
                </span>
                <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
                  Your Bookmarked & Favorited Pipelines
                </h2>
                <p className="text-[14px] text-neutral-500 font-medium max-w-xl leading-relaxed">
                  Instantly access your custom shortlisted and reviewed automation blueprints for execution or deployment.
                </p>
              </div>

              {bookmarkedIds.length === 0 && likedIds.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-neutral-200 rounded-3xl text-neutral-400 font-bold text-xs">
                  No bookmarked automations. Tap the heart or save icon on cards to save them here!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {automations.filter(a => bookmarkedIds.includes(a.id) || likedIds.includes(a.id)).map(aut => (
                    <div key={aut.id} className="w-full">
                      <AutomationCard 
                        automation={aut}
                        isBookmarked={bookmarkedIds.includes(aut.id)}
                        isLiked={likedIds.includes(aut.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleLike={handleToggleLike}
                        onOpenPreview={handleOpenWorkflow}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <MessagesPage 
              initialCreatorName={initialChatCreator} 
              onOpenAutomation={(id) => handleOpenWorkflow(id)} 
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}

          {activeTab === 'creator-dashboard' && (
            <CreatorDashboard 
              userProfile={userProfile} 
              onOpenWorkflow={handleOpenWorkflow} 
            />
          )}

        </div>
      </div>



      {/* 3. Active Workflow SVG Detail Modal Sheet */}
      {activeSelectedAutomation && (
        <WorkflowModal 
          automation={activeSelectedAutomation}
          isOpen={activeWorkflowId !== null}
          onClose={() => setActiveWorkflowId(null)}
          onToggleBookmark={handleToggleBookmark}
          onToggleLike={handleToggleLike}
          isBookmarked={bookmarkedIds.includes(activeSelectedAutomation.id)}
          isLiked={likedIds.includes(activeSelectedAutomation.id)}
          onStartChat={(creatorName) => {
            setInitialChatCreator(creatorName);
            setActiveTab('messages');
            setActiveWorkflowId(null);
          }}
          onViewCreator={() => {
            const dbCreator = FlowDB.getCreatorById(activeSelectedAutomation.creatorId);
            const creatorName = dbCreator ? dbCreator.name : (activeSelectedAutomation.creatorId ? activeSelectedAutomation.creatorId.split('@')[0] : 'Creator');
            setInitialChatCreator(creatorName);
            setActiveTab('creators');
            setActiveWorkflowId(null);
          }}
        />
      )}

      {/* 4. Business DNA Setup Calibration Dialog (Onboarding overlay) */}
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
        onComplete={handleUpdateDNA} 
      />

      {/* 5. Database Console / Operations Manager */}
      <DatabaseManager 
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
      />
    </div>
  );
}
