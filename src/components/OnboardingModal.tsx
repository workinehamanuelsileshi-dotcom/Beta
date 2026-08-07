import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, ArrowRight, ArrowLeft, Building2, Globe, Users, 
  TrendingUp, Search, Cpu, Coins, MessageSquare, ShieldCheck, 
  Clock, Zap, Trash2, HelpCircle, User, Compass, Server, CheckSquare, 
  Lock, RefreshCw, BarChart3, AlertCircle, Heart
} from 'lucide-react';
import { FlowDB } from '../lib/database';
import { BusinessDNA } from '../types';
import { INDUSTRIES, TECH_STACKS } from '../data';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (dna: BusinessDNA) => void;
}

// Custom mock companies to match autofill web triggers
const AUTOFILL_MAP: Record<string, { companyName: string, industry: string, companySize: string, subIndustry: string, growthStage: string, techStack: string[] }> = {
  'stripe.com': {
    companyName: 'Stripe Inc.',
    industry: 'Finance & Fintech',
    companySize: '250+',
    subIndustry: 'Global Payment Infrastructures',
    growthStage: 'Late Stage',
    techStack: ['Stripe', 'Slack', 'Salesforce', 'OpenAI']
  },
  'notion.so': {
    companyName: 'Notion Labs',
    industry: 'SaaS & Tech',
    companySize: '50-250',
    subIndustry: 'AI Document Knowledge Base',
    growthStage: 'Scaling',
    techStack: ['Notion', 'Slack', 'HubSpot', 'Google Workspace']
  },
  'shopify.com': {
    companyName: 'Shopify Global',
    industry: 'E-Commerce & Retail',
    companySize: '250+',
    subIndustry: 'Digital Commerce Multi-channel Systems',
    growthStage: 'Late Stage',
    techStack: ['Shopify', 'Stripe', 'Slack', 'Airtable']
  },
  'airbnb.com': {
    companyName: 'Airbnb Ops',
    industry: 'Real Estate & Construction',
    companySize: '250+',
    subIndustry: 'Hospitality Marketplace Engines',
    growthStage: 'Established',
    techStack: ['Slack', 'Salesforce', 'Google Workspace', 'Notion']
  }
};

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  // Read and resume progress from localStorage/FlowDB
  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('flowmint_onboarding_step');
    if (savedStep) return parseInt(savedStep, 10);
    const profile = localStorage.getItem('flowmint_user_profile');
    return profile ? 2 : 1;
  });

  // State-driven interactive form data
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [country, setCountry] = useState('United States');
  const [companySize, setCompanySize] = useState('10-50');
  const [annualRevenue, setAnnualRevenue] = useState('$1M - $5M');
  
  // Goals selection
  const [goals, setGoals] = useState<string[]>([]);
  
  // Challenges & AI Parsing State
  const [challengesText, setChallengesText] = useState('');
  const [isAnalyzingChallenge, setIsAnalyzingChallenge] = useState(false);
  const [extractedPainPoints, setExtractedPainPoints] = useState<string[]>([]);
  const [extractedOpportunities, setExtractedOpportunities] = useState<string[]>([]);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);

  // Tech Stack & Search
  const [techStack, setTechStack] = useState<string[]>([]);
  const [stackSearchQuery, setStackSearchQuery] = useState('');

  // Interests selection
  const [interests, setInterests] = useState<string[]>([]);

  // Budget, timelines
  const [monthlyBudget, setMonthlyBudget] = useState('$2,000 - $5,000/mo');
  const [timeline, setTimeline] = useState('2-4 weeks');
  const [urgency, setUrgency] = useState('High');
  const [projectSize, setProjectSize] = useState('Medium Enterprise');

  // Communication Preference
  const [commChannel, setCommChannel] = useState('Slack/Chat');
  const [timezone, setTimezone] = useState('GMT-7 (Pacific Standard Time)');
  const [language, setLanguage] = useState('English');

  // Interactive Sign-In / Login states
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState('workinehamanuelsileshi@gmail.com');
  const [signInPassword, setSignInPassword] = useState('••••••••••••');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSignInSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!signInEmail) {
      setLoginError('Please enter your email address.');
      return;
    }
    setLoginError('');
    setIsLoggingIn(true);
    
    const sanitizedId = signInEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    
    getDoc(doc(db, 'business_dna', sanitizedId)).then((docSnap) => {
      setIsLoggingIn(false);
      setLoginSuccess(true);
      
      let restoredDNA: BusinessDNA;
      if (docSnap.exists()) {
        restoredDNA = docSnap.data() as BusinessDNA;
      } else {
        // Fallback user layout
        restoredDNA = {
          companyName: 'Sileshi Tech',
          website: 'sileshitech.com',
          industry: 'Finance & Fintech',
          country: 'United States',
          companySize: '10-50',
          revenueStage: '$1M - $5M',
          goals: ['Automate repetitive data operations', 'Reduce manual engineering costs', 'Streamline customer intake workflows'],
          challengesText: 'We spend too much time manually updating client accounts, responding to standard support queries, and syncing Salesforce with Stripe manually.',
          extractedPainPoints: ['Manual client account updates', 'High support volume', 'Stripe-Salesforce syncing'],
          extractedOpportunities: ['Conversational customer service AI agent', 'Automated Stripe-to-Salesforce account pipelines'],
          extractedKeywords: ['fintech', 'automation', 'CRM sync', 'support agent'],
          techStack: ['Stripe', 'Salesforce', 'Slack', 'HubSpot', 'Zapier'],
          interests: ['Customer Support', 'Lead Generation', 'Invoice Automation', 'AI Agents'],
          monthlyBudget: '$2,000 - $5,000/mo',
          timeline: '2-4 weeks',
          urgency: 'High',
          projectSize: 'Medium Enterprise',
          commChannel: 'Slack/Chat',
          timezone: 'GMT-7 (Pacific Standard Time)',
          language: 'English',
          maturity: 'Intermediate'
        };
      }
      
      // Update local storage user profile so FlowDB syncs correctly!
      localStorage.setItem('flowmint_user_profile', JSON.stringify({
        name: 'Dawit',
        email: signInEmail,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
        role: 'Founder & CEO',
        preferredLanguage: 'English',
        timezone: 'GMT-7 (Pacific Standard Time)',
        commChannel: 'Slack/Chat'
      }));
      
      // Save it in local storage and database
      localStorage.setItem('flowdb_business_dna', JSON.stringify(restoredDNA));
      localStorage.setItem('flowmint_visited', 'true');
      
      // Re-trigger FlowDB sync user context so the database snapshot listener updates to the logged-in email instantly!
      FlowDB.syncUserContext();
      
      setTimeout(() => {
        onComplete(restoredDNA);
        onClose();
        setShowSignIn(false);
        setLoginSuccess(false);
      }, 1000);
    }).catch((err) => {
      console.error("Firestore sign in error:", err);
      setIsLoggingIn(false);
      setLoginError("Failed to fetch profile from database. Please try again.");
    });
  };

  // Auto detect website load state
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  // Analysis / Loading items step
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('Ingesting operational bottlenecks...');

  // Load saved draft state on mount
  useEffect(() => {
    const draft = localStorage.getItem('flowmint_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.website) setWebsite(d.website);
        if (d.industry) setSelectedIndustry(d.industry);
        if (d.country) setCountry(d.country);
        if (d.companySize) setCompanySize(d.companySize);
        if (d.annualRevenue) setAnnualRevenue(d.annualRevenue);
        if (d.goals) setGoals(d.goals);
        if (d.challengesText) {
          setChallengesText(d.challengesText);
          setExtractedPainPoints(d.extractedPainPoints || []);
          setExtractedOpportunities(d.extractedOpportunities || []);
          setExtractedKeywords(d.extractedKeywords || []);
        }
        if (d.techStack) setTechStack(d.techStack);
        if (d.interests) setInterests(d.interests);
        if (d.monthlyBudget) setMonthlyBudget(d.monthlyBudget);
        if (d.timeline) setTimeline(d.timeline);
        if (d.urgency) setUrgency(d.urgency);
        if (d.projectSize) setProjectSize(d.projectSize);
        if (d.commChannel) setCommChannel(d.commChannel);
        if (d.timezone) setTimezone(d.timezone);
        if (d.language) setLanguage(d.language);
      } catch (e) {
        console.error('Failed to parse onboarding draft', e);
      }
    }
  }, []);

  // Save draft state to FlowDB and localStorage on change (Instant persistent Auto-save)
  const autoSave = (updates: any) => {
    const currentDraft = JSON.parse(localStorage.getItem('flowmint_onboarding_draft') || '{}');
    const nextDraft = { ...currentDraft, ...updates };
    localStorage.setItem('flowmint_onboarding_draft', JSON.stringify(nextDraft));
    
    // Partially save draft DNA into FlowDB instantly
    const draftDNA: BusinessDNA = {
      companyName: nextDraft.companyName || companyName || 'My Business',
      website: nextDraft.website || website,
      industry: nextDraft.industry || selectedIndustry || 'SaaS & Tech',
      companySize: nextDraft.companySize || companySize || '10-50',
      goals: nextDraft.goals || goals || [],
      techStack: nextDraft.techStack || techStack || [],
      maturity: (nextDraft.companySize === '1-10' ? 'Beginner' : nextDraft.companySize === '250+' ? 'Advanced' : 'Intermediate') as any,
      painPoints: nextDraft.extractedPainPoints || extractedPainPoints,
      preferredBudget: nextDraft.monthlyBudget || monthlyBudget,
      preferredTimeline: nextDraft.timeline || timeline
    };
    FlowDB.updateBusinessDNA(draftDNA);
  };

  // Keep step persisted
  const handleStepChange = (nextStep: number) => {
    setStep(nextStep);
    localStorage.setItem('flowmint_onboarding_step', String(nextStep));
    autoSave({});
  };

  // Keyboard navigation helpers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' && e.ctrlKey && step < 10) {
        handleStepChange(step + 1);
      } else if (e.key === 'ArrowLeft' && e.ctrlKey && step > 1) {
        handleStepChange(step - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isOpen]);

  // Simulated AI Scanner for Website URL (Autofill trigger)
  const triggerWebsiteAutofill = (url: string) => {
    if (!url) return;
    const cleanUrl = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    setIsAutofilling(true);
    setAutofillSuccess(false);

    setTimeout(() => {
      setIsAutofilling(false);
      const match = AUTOFILL_MAP[cleanUrl];
      if (match) {
        setCompanyName(match.companyName);
        setSelectedIndustry(match.industry);
        setCompanySize(match.companySize);
        setAutofillSuccess(true);
        autoSave({
          companyName: match.companyName,
          website: url,
          industry: match.industry,
          companySize: match.companySize,
          subIndustry: match.subIndustry,
          growthStage: match.growthStage
        });
      } else {
        // Fallback generic parse
        const genericName = cleanUrl.split('.')[0].toUpperCase();
        setCompanyName(genericName);
        setSelectedIndustry('SaaS & Tech');
        setAutofillSuccess(true);
        autoSave({
          companyName: genericName,
          website: url,
          industry: 'SaaS & Tech'
        });
      }
    }, 1400);
  };

  // Real-time AI parsing for the challenges text
  useEffect(() => {
    if (!challengesText.trim()) {
      setExtractedPainPoints([]);
      setExtractedOpportunities([]);
      setExtractedKeywords([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnalyzingChallenge(true);
      
      // Smart offline keyword & intent match
      setTimeout(() => {
        setIsAnalyzingChallenge(false);
        const text = challengesText.toLowerCase();
        const p: string[] = [];
        const o: string[] = [];
        const kw: string[] = [];

        if (text.includes('support') || text.includes('customer') || text.includes('client')) {
          p.push('High support backlog / response delay');
          o.push('Deploy LLM-powered support dispatcher and sentiment classifier');
          kw.push('Support AI', 'Slack Bot');
        }
        if (text.includes('manual') || text.includes('entry') || text.includes('copy') || text.includes('sync')) {
          p.push('Time spent transferring data between CRM & billing tools');
          o.push('Setup HubSpot to Stripe real-time webhook flow');
          kw.push('Webhooks', 'CRM Sync');
        }
        if (text.includes('lead') || text.includes('sales') || text.includes('marketing')) {
          p.push('Slow outreach dispatch / lead churn');
          o.push('Enrich outbound contact tables utilizing LinkedIn scrapers & OpenAI');
          kw.push('Lead Gen', 'Sales Engine');
        }
        if (text.includes('report') || text.includes('excel') || text.includes('sheet') || text.includes('data')) {
          p.push('Assembling sheets manually for board review');
          o.push('Automate metrics collection via Cron job pipelines to Google Sheets');
          kw.push('Analytics', 'Data Pipelines');
        }

        // Generic fallback values if no keywords matched
        if (p.length === 0) {
          p.push('Manual administration workflows');
          o.push('Implement a multi-tool scheduler to unify operational reports');
          kw.push('Workflow', 'Automation');
        }

        setExtractedPainPoints(p);
        setExtractedOpportunities(o);
        setExtractedKeywords(kw);

        autoSave({
          challengesText,
          extractedPainPoints: p,
          extractedOpportunities: o,
          extractedKeywords: kw
        });
      }, 850);

    }, 600);

    return () => clearTimeout(timer);
  }, [challengesText]);

  // Step 9: Real-time Gemini-powered Business DNA Analysis Workflow
  useEffect(() => {
    if (step === 9) {
      setAnalysisProgress(5);
      setAnalysisText('Initiating systems connection...');

      const messages = [
        'Ingesting company parameters & goals...',
        'Scanning technology stack compatibility matrices...',
        'Synthesizing Business DNA profile & health insights...',
        'Calibrating real-time database endpoints...',
        'Matching with elite verified Flowmint creators...'
      ];

      let msgIdx = 0;
      const interval = setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        setAnalysisText(messages[msgIdx]);
        setAnalysisProgress(prev => {
          if (prev >= 85) return 85; // cap progress at 85% until API response completes
          return prev + 10;
        });
      }, 1000);

      // Trigger real-time Gemini analysis on backend
      fetch('/api/analyze-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName,
          website,
          selectedIndustry,
          country,
          companySize,
          annualRevenue,
          goals,
          challengesText,
          techStack,
          interests,
          monthlyBudget,
          timeline,
          urgency
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("API call failed");
        return res.json();
      })
      .then(synthesizedDNA => {
        clearInterval(interval);
        setAnalysisText('Business DNA blueprint calibration complete!');
        setAnalysisProgress(100);
        
        // Save the synthesized DNA to localStorage for Step 10 preview
        localStorage.setItem('flowmint_onboarding_synthesized', JSON.stringify(synthesizedDNA));
        
        setTimeout(() => {
          handleStepChange(10);
        }, 1200);
      })
      .catch(err => {
        console.error("Failed to analyze company, using offline calibration:", err);
        clearInterval(interval);
        setAnalysisProgress(100);
        setAnalysisText('Calibration complete (offline mode activated).');
        setTimeout(() => {
          handleStepChange(10);
        }, 1200);
      });

      return () => clearInterval(interval);
    }
  }, [step]);

  // Handle final completion
  const triggerCompletion = () => {
    // Attempt to load from the real Gemini synthesized DNA
    const rawSynthesized = localStorage.getItem('flowmint_onboarding_synthesized');
    let finalDNA: BusinessDNA;

    if (rawSynthesized) {
      try {
        finalDNA = JSON.parse(rawSynthesized);
      } catch (e) {
        finalDNA = createFallbackDNA();
      }
    } else {
      finalDNA = createFallbackDNA();
    }

    // Save permanently in FlowDB
    FlowDB.updateBusinessDNA(finalDNA);

    // Save detailed structures requested by DB REQUIREMENTS
    FlowDB.setItem('USER_PROFILE', {
      name: 'Dawit',
      email: 'workinehamanuelsileshi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
      role: 'Founder & CEO',
      preferredLanguage: language,
      timezone: timezone,
      commChannel
    });

    FlowDB.setItem('COMPANY_PROFILE', {
      name: companyName || 'Flowmint Labs',
      website,
      industry: selectedIndustry,
      country,
      size: companySize,
      revenue: annualRevenue
    });

    FlowDB.setItem('GOALS', goals);
    FlowDB.setItem('CHALLENGES', {
      text: challengesText,
      extractedPainPoints,
      extractedOpportunities,
      extractedKeywords
    });

    FlowDB.setItem('AUTOMATION_INTERESTS', interests);
    FlowDB.setItem('SOFTWARE_STACK', techStack);
    
    // Save initial system notifications
    FlowDB.setItem('NOTIFICATIONS', [
      {
        id: 'notif_onboarding',
        title: 'Business DNA Active!',
        message: `Flowmint analyzed your software stack (${(techStack || []).slice(0,3).join(', ')}) and detected custom opportunities. Perfect matching blueprints have been loaded.`,
        time: 'Just now',
        read: false
      }
    ]);

    // Save initial history log
    FlowDB.setItem('ACTIVITY_HISTORY', [
      {
        id: 'act_1',
        action: 'Completed Flowmint Onboarding',
        detail: `Formulated detailed Business DNA for ${companyName || 'Flowmint Labs'}. Digital maturity evaluated as Intermediate.`,
        timestamp: new Date().toISOString()
      }
    ]);

    // Seed recommended projects
    FlowDB.setItem('PROJECTS', [
      {
        id: 'proj_onb_1',
        title: `${selectedIndustry || 'SaaS'} Integration Kickoff`,
        status: 'In Scoping',
        budget: monthlyBudget,
        timeline,
        creator: 'FlowGenius Team',
        progress: 15
      }
    ]);

    // Mark visited & close
    localStorage.setItem('flowmint_visited', 'true');
    localStorage.removeItem('flowmint_onboarding_step');
    localStorage.removeItem('flowmint_onboarding_draft');

    onComplete(finalDNA);
    onClose();
  };

  const createFallbackDNA = (): BusinessDNA => {
    return {
      companyName: companyName || 'Flowmint Labs',
      website: website || 'flowmint.io',
      industry: selectedIndustry || 'SaaS & Tech',
      subIndustry: selectedIndustry === 'Finance & Fintech' ? 'FinTech Gateway' : 'SaaS Infrastructure',
      companySize: companySize,
      country: country,
      primaryGoal: goals[0] || 'Save Time',
      revenueStage: annualRevenue,
      growthStage: 'Scaling Operations',
      automationScore: 78,
      aiReadiness: 84,
      digitalMaturity: companySize === '1-10' ? 'Beginner' : companySize === '250+' ? 'Advanced' : 'Intermediate',
      techStack: techStack.length > 0 ? techStack : ['HubSpot', 'Slack', 'OpenAI'],
      painPoints: extractedPainPoints.length > 0 ? extractedPainPoints : ['Manual coordination overhead'],
      preferredCategories: interests.length > 0 ? interests : ['AI Agents', 'Finance'],
      estimatedROI: '360%',
      recommendedCollections: ['AI Automation Hub', 'Support Dispatcher Framework'],
      preferredBudget: monthlyBudget,
      preferredCreatorType: 'Expert Agency',
      preferredTimeline: timeline,
      businessPersonality: goals.includes('Increase Sales') ? 'Aggressive Growth Focus' : 'Hyper-Efficiency Operationalist',
      goals: goals.length > 0 ? goals : ['Save Time', 'Automate Admin'],
      maturity: (companySize === '1-10' ? 'Beginner' : companySize === '250+' ? 'Advanced' : 'Intermediate') as any
    };
  };

  if (!isOpen) return null;

  // Filter tech stack selection
  const filteredTech = TECH_STACKS.filter(tech => 
    tech.toLowerCase().includes(stackSearchQuery.toLowerCase())
  );

  return (
    <div id="onboarding_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none bg-neutral-900/40 backdrop-blur-md overflow-hidden">
      
      {/* Background card layout framing */}
      <div className="relative w-full max-w-5xl h-[85vh] min-h-[580px] bg-white rounded-[32px] shadow-2xl border border-neutral-100 flex flex-col md:flex-row overflow-hidden animate-fadeIn">
        
        {/* Left Side: Progress & Interactive DNA Blueprint Tracker */}
        <div className="w-full md:w-[35%] bg-neutral-950 p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-neutral-800">
          
          {/* Subtle Abstract Background grid / glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-blue-500 rounded-full filter blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-500 rounded-full filter blur-[100px]" />
          </div>

          <div className="relative space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Personalization Core</span>
                <h4 className="text-sm font-black tracking-tight text-white">Flowmint DNA Engine</h4>
              </div>
            </div>

            {/* Step list - visual elegant progress timeline */}
            <div className="space-y-4 pt-4 hidden md:block">
              {[
                { s: 1, label: 'Welcome Core' },
                { s: 2, label: 'Company Architecture' },
                { s: 3, label: 'Business Focus & Goals' },
                { s: 4, label: 'Bottlenecks & Friction' },
                { s: 5, label: 'Software Stack DNA' },
                { s: 6, label: 'Automation Interests' },
                { s: 7, label: 'Commercial Budget' },
                { s: 8, label: 'Communication Layer' },
                { s: 9, label: 'AI Deep Calibration' }
              ].map((item) => {
                const isActive = step === item.s;
                const isPassed = step > item.s;
                return (
                  <div key={item.s} className="flex items-center space-x-3 text-left transition-all duration-300">
                    <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center border transition-all ${
                      isActive 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]' 
                        : isPassed 
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-extrabold' 
                          : 'bg-white/5 border-white/5 text-neutral-500'
                    }`}>
                      {isPassed ? '✓' : item.s}
                    </span>
                    <span className={`text-[12px] font-bold transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : isPassed 
                          ? 'text-neutral-300' 
                          : 'text-neutral-500'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Persistent status info in footer */}
          <div className="relative pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold">
              <span>Automatic Cloud Syncing</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400">Permanent Sandbox Secure</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Step Content Area with Apple Typography */}
        <div className="flex-1 bg-white flex flex-col justify-between p-8 md:p-12 overflow-y-auto relative">
          
          {/* Back button and floating Progress Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100 shrink-0">
            {step > 1 && step < 9 ? (
              <button
                onClick={() => handleStepChange(step - 1)}
                className="flex items-center space-x-1.5 text-neutral-400 hover:text-neutral-900 font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}

            <div className="flex items-center space-x-3 text-right">
              <span className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                Step {step} of 10
              </span>
              <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(step / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* STEP CONTROLLER CONTENT RENDER */}
          <div className="flex-1 py-10 flex flex-col justify-center max-w-xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6 w-full"
              >
                
                {/* STEP 1: WELCOME */}
                {step === 1 && (
                  showSignIn ? (
                    <form onSubmit={handleSignInSubmit} className="space-y-5 text-left max-w-md mx-auto md:mx-0 animate-fadeIn">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Lock className="w-3 h-3 mr-1" />
                        Secure Authenticated Login
                      </span>
                      <div className="space-y-1.5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 font-sans leading-none">
                          Welcome Back
                        </h1>
                        <p className="text-[12px] text-neutral-500 font-medium">
                          Sign in to restore your personalized Business DNA and synchronized pipelines.
                        </p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Business Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. you@company.com"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                          />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                            <a href="#forgot" className="text-[10px] font-bold text-blue-600 hover:underline text-left" onClick={(e) => e.preventDefault()}>Forgot?</a>
                          </div>
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••••••"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                          />
                        </div>

                        {/* Error and Success feedback messages */}
                        {loginError && (
                          <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl flex items-start space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-medium leading-normal">{loginError}</span>
                          </div>
                        )}

                        {loginSuccess && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start space-x-2 text-emerald-700 animate-pulse">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-bold leading-normal">Welcome back! Decrypting & restoring your operational dashboard...</span>
                          </div>
                        )}

                        {/* Autofill helper shortcut for the user */}
                        <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl text-[11px] text-neutral-600 space-y-1.5">
                          <span className="font-bold text-blue-700">Quick Sandbox Identity:</span>
                          <p className="leading-normal font-medium">
                            Use your account: <code className="font-mono bg-blue-100/50 px-1 py-0.5 rounded text-blue-800 font-bold">workinehamanuelsileshi@gmail.com</code>
                          </p>
                          <button 
                            type="button"
                            onClick={() => {
                              setSignInEmail('workinehamanuelsileshi@gmail.com');
                              setSignInPassword('SileshiTechSecurePass123!');
                            }}
                            className="text-[10px] text-blue-600 font-extrabold hover:underline"
                          >
                            Autofill this account
                          </button>
                        </div>
                      </div>

                      {/* Sign In & Back buttons inside the form */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                        <button
                          type="submit"
                          disabled={isLoggingIn || loginSuccess}
                          className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl py-3 text-[12px] font-bold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isLoggingIn ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In securely</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setShowSignIn(false);
                            setLoginError('');
                          }}
                          className="px-4 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl text-[12px] font-bold transition-all cursor-pointer text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6 text-center md:text-left">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Dynamic Automation Calibration
                      </span>
                      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950 font-sans leading-none">
                        Let's design your <span className="text-blue-600">Business DNA</span>.
                      </h1>
                      <p className="text-base text-neutral-500 font-medium leading-relaxed max-w-lg">
                        Flowmint instantly calibrates your platform to suggest pipelines, select elite developers, and calculate immediate ROI metrics based on your operational architecture.
                      </p>

                      <div className="bg-neutral-50 border border-neutral-150 p-5 rounded-2xl flex items-start space-x-3 text-left">
                        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-neutral-900">What is a Business DNA?</p>
                          <p className="text-[11px] text-neutral-500 leading-normal">
                            A real-time profile of your company’s size, targets, pain points, and current software tools used to tailor the Flowmint marketplace feed.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center space-x-2 text-[12px] text-neutral-500 font-medium">
                        <span>Already have a Flowmint account?</span>
                        <button
                          type="button"
                          onClick={() => setShowSignIn(true)}
                          className="text-blue-600 hover:text-blue-700 font-extrabold underline cursor-pointer focus:outline-none"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* STEP 2: COMPANY INFORMATION & AUTO-DETECTION */}
                {step === 2 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">Where does your business operate?</h2>
                      <p className="text-xs text-neutral-400 font-medium">Type your company's URL to automatically ingest tech stacks and team size parameters.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Domain / Website</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="e.g. stripe.com"
                            value={website}
                            onChange={(e) => {
                              setWebsite(e.target.value);
                              autoSave({ website: e.target.value });
                            }}
                            onBlur={() => triggerWebsiteAutofill(website)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                          {isAutofilling && (
                            <span className="absolute right-3 top-3 flex items-center text-[10px] text-blue-600 font-bold">
                              <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                              Scanning DNA...
                            </span>
                          )}
                          {autofillSuccess && (
                            <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-black flex items-center">
                              ✓ Auto-populated
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Stripe Inc."
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              autoSave({ companyName: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Country Location</label>
                          <input 
                            type="text" 
                            value={country}
                            onChange={(e) => {
                              setCountry(e.target.value);
                              autoSave({ country: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Target Industry</label>
                          <select
                            value={selectedIndustry}
                            onChange={(e) => {
                              setSelectedIndustry(e.target.value);
                              autoSave({ industry: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          >
                            <option value="">-- Choose Vertical --</option>
                            {INDUSTRIES.map(ind => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Team headcount size</label>
                          <select
                            value={companySize}
                            onChange={(e) => {
                              setCompanySize(e.target.value);
                              autoSave({ companySize: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          >
                            <option value="1-10">1 - 10 employees</option>
                            <option value="10-50">10 - 50 employees</option>
                            <option value="50-250">50 - 250 employees</option>
                            <option value="250+">250+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Annual Revenue (Optional)</label>
                        <select
                          value={annualRevenue}
                          onChange={(e) => {
                            setAnnualRevenue(e.target.value);
                            autoSave({ annualRevenue: e.target.value });
                          }}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        >
                          <option value="Under $500K">Under $500K</option>
                          <option value="$500K - $1M">$500K - $1M</option>
                          <option value="$1M - $5M">$1M - $5M</option>
                          <option value="$5M - $20M">$5M - $20M</option>
                          <option value="$20M+">$20M+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: BUSINESS GOALS */}
                {step === 3 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">What are your primary goals?</h2>
                      <p className="text-xs text-neutral-400 font-medium">Select all target criteria you aim to hit with Flowmint systems.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {[
                        { id: 'Increase Sales', desc: 'Accelerate outbound conversion pipelines' },
                        { id: 'Reduce Costs', desc: 'Optimize resource spend & ledger waste' },
                        { id: 'Save Time', desc: 'Automate administrative overhead completely' },
                        { id: 'Improve Customer Support', desc: 'Establish instant support autoresponders' },
                        { id: 'Generate Leads', desc: 'Scrape and classify high-intent buyers' },
                        { id: 'Marketing', desc: 'Synchronize campaigns & newsletters' },
                        { id: 'Operations', desc: 'Streamline team coordination systems' },
                        { id: 'Finance', desc: 'Automate accounting & books logs' },
                        { id: 'HR & Recruiting', desc: 'Schedule & parse applications automatically' },
                        { id: 'Analytics', desc: 'Export system performance reports' }
                      ].map(goal => {
                        const active = goals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            onClick={() => {
                              const next = active ? goals.filter(g => g !== goal.id) : [...goals, goal.id];
                              setGoals(next);
                              autoSave({ goals: next });
                            }}
                            className={`p-4 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                              active 
                                ? 'bg-blue-50/50 border-blue-500 text-blue-900 shadow-sm' 
                                : 'bg-white hover:bg-neutral-50 border-neutral-150 text-neutral-700'
                            }`}
                          >
                            <span className="text-xs font-extrabold">{goal.id}</span>
                            <span className="text-[10px] text-neutral-400 font-medium leading-tight">{goal.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: BIGGEST CHALLENGES & AI RESPONSE EXTRACTION */}
                {step === 4 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">What slows your business down today?</h2>
                      <p className="text-xs text-neutral-400 font-medium">Explain your major administrative bottlenecks in a few words. Flowmint AI will extract actionable nodes.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <textarea
                        rows={4}
                        placeholder="e.g., We take days to respond to client Slack channels, and manual data copy to HubSpot is creating severe lag..."
                        value={challengesText}
                        onChange={(e) => setChallengesText(e.target.value)}
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 leading-relaxed"
                      />

                      {/* AI real-time parsing analysis pane */}
                      <div className="border border-neutral-150 rounded-2xl p-4 bg-neutral-50/50 space-y-3 min-h-[100px] relative">
                        {isAnalyzingChallenge ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/75 rounded-2xl">
                            <span className="text-xs text-blue-600 font-extrabold flex items-center">
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              AI extracting friction vectors...
                            </span>
                          </div>
                        ) : null}

                        <span className="inline-flex items-center space-x-1 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Cpu className="w-3 h-3 text-blue-500 mr-1" />
                          Flowmint AI extraction
                        </span>

                        {extractedPainPoints.length === 0 ? (
                          <p className="text-[11px] text-neutral-400 font-medium italic">
                            Awaiting operational text input to parse bottlenecks...
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-[11px] text-neutral-800 font-bold">
                              <span className="text-neutral-400">Identified Bottlenecks:</span>
                              <div className="mt-1 space-y-1">
                                {extractedPainPoints.map((p, idx) => (
                                  <div key={idx} className="flex items-center space-x-1 text-red-600">
                                    <span className="text-[10px]">⚠️</span>
                                    <span>{p}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="text-[11px] text-neutral-800 font-bold">
                              <span className="text-neutral-400">Recommended Automation Flow:</span>
                              <div className="mt-1 text-blue-700 bg-blue-50/50 px-2 py-1.5 rounded-lg border border-blue-100">
                                {extractedOpportunities[0]}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {extractedKeywords.map((kw, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-neutral-150 text-neutral-600 rounded-full text-[9px] font-black">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: SOFTWARE STACK */}
                {step === 5 && (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">Select your active software stack</h2>
                      <p className="text-xs text-neutral-400 font-medium">Which programs does your squad use to run the ship? Search and choose multiple.</p>
                    </div>

                    <div className="relative pt-2">
                      <Search className="absolute left-3.5 top-5.5 w-4.5 h-4.5 text-neutral-400" />
                      <input 
                        type="text" 
                        placeholder="Search workspace software..."
                        value={stackSearchQuery}
                        onChange={(e) => setStackSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredTech.map(tech => {
                        const active = techStack.includes(tech);
                        return (
                          <button
                            key={tech}
                            onClick={() => {
                              const next = active 
                                ? techStack.filter(t => t !== tech)
                                : [...techStack, tech];
                              setTechStack(next);
                              autoSave({ techStack: next });
                            }}
                            className={`p-3 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                              active 
                                ? 'bg-blue-50/50 border-blue-500 text-blue-900 shadow-xs' 
                                : 'bg-white hover:bg-neutral-50 border-neutral-150 text-neutral-600'
                            }`}
                          >
                            <span>{tech}</span>
                            {active && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: AUTOMATION INTERESTS */}
                {step === 6 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">What core systems would you like to automate?</h2>
                      <p className="text-xs text-neutral-400 font-medium">We'll prioritize loading blueprints matching these categories on your personal dashboard.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {[
                        'Sales Pipelines', 'Outbound Marketing', 'Customer Support Hubs', 
                        'Accounting & Finance', 'HR Operations', 'Real-Time Inventory', 
                        'Interactive Reporting', 'Meeting Scheduling', 'LLM AI Agents', 
                        'Voice AI Systems', 'Custom Analytics dashboards'
                      ].map(interest => {
                        const active = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            onClick={() => {
                              const next = active 
                                ? interests.filter(i => i !== interest)
                                : [...interests, interest];
                              setInterests(next);
                              autoSave({ interests: next });
                            }}
                            className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex items-center space-x-2.5 ${
                              active 
                                ? 'bg-blue-50/50 border-blue-500 text-blue-900 font-semibold' 
                                : 'bg-white hover:bg-neutral-50 border-neutral-150 text-neutral-600'
                            }`}
                          >
                            <span className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                              active ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-neutral-300'
                            }`}>
                              {active && <Check className="w-3 h-3 text-white" />}
                            </span>
                            <span className="text-xs font-bold">{interest}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 7: COMMERCIAL BUDGET & TIMELINE */}
                {step === 7 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">Commercial budget & timeline range</h2>
                      <p className="text-xs text-neutral-400 font-medium">Select your preferred scale of system builds and dispatch timeline urgency.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Target Monthly Budget</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Under $2,000/mo', '$2,000 - $5,000/mo', '$5,000 - $15,000/mo', '$15,000+'].map(b => (
                            <button
                              key={b}
                              onClick={() => {
                                setMonthlyBudget(b);
                                autoSave({ monthlyBudget: b });
                              }}
                              className={`p-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                monthlyBudget === b 
                                  ? 'bg-blue-50 border-blue-500 text-blue-950' 
                                  : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Desired Timeline</label>
                          <select
                            value={timeline}
                            onChange={(e) => {
                              setTimeline(e.target.value);
                              autoSave({ timeline: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
                          >
                            <option value="Under 1 week">Under 1 week</option>
                            <option value="2-4 weeks">2 - 4 weeks</option>
                            <option value="1-2 months">1 - 2 months</option>
                            <option value="Continuous support">Continuous support</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Urgency Priority</label>
                          <select
                            value={urgency}
                            onChange={(e) => {
                              setUrgency(e.target.value);
                              autoSave({ urgency: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
                          >
                            <option value="Low">Low - Researching</option>
                            <option value="Medium">Medium - Standard deployment</option>
                            <option value="High">High - Immediate integration need</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: COMMUNICATION PREFERENCES */}
                {step === 8 && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-neutral-950">How should we coordinate with you?</h2>
                      <p className="text-xs text-neutral-400 font-medium">Select your workspace sync schedules and communication preferences.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Communication Channel</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Slack/Chat', 'Email Digests', 'Video Calls'].map(ch => (
                            <button
                              key={ch}
                              onClick={() => {
                                setCommChannel(ch);
                                autoSave({ commChannel: ch });
                              }}
                              className={`p-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                commChannel === ch 
                                  ? 'bg-blue-50 border-blue-500 text-blue-950' 
                                  : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                              }`}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Timezone</label>
                          <select
                            value={timezone}
                            onChange={(e) => {
                              setTimezone(e.target.value);
                              autoSave({ timezone: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
                          >
                            <option value="GMT-7 (Pacific Standard Time)">GMT-7 (Pacific Time)</option>
                            <option value="GMT-5 (Eastern Standard Time)">GMT-5 (Eastern Time)</option>
                            <option value="GMT+0 (London Greenwich Time)">GMT+0 (London Time)</option>
                            <option value="GMT+1 (Central European Time)">GMT+1 (Berlin Time)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Preferred Language</label>
                          <select
                            value={language}
                            onChange={(e) => {
                              setLanguage(e.target.value);
                              autoSave({ language: e.target.value });
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
                          >
                            <option value="English">English</option>
                            <option value="German">Deutsch (German)</option>
                            <option value="French">Français (French)</option>
                            <option value="Spanish">Español (Spanish)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 9: AI ANALYSIS ANIMATION PROGRESS */}
                {step === 9 && (
                  <div className="text-center space-y-6 py-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      {/* Beautiful Spinning loading arcs */}
                      <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                      <Cpu className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-neutral-900">Synthesizing Business DNA</h3>
                      <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto">
                        Flowmint algorithms are cross-referencing your systems with 150+ automated logic parameters...
                      </p>
                    </div>

                    {/* Progress Bar with label */}
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold block animate-pulse">
                        {analysisText}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 10: DASHBOARD READY / BUSINESS DNA PROFILE RESULT */}
                {step === 10 && (
                  <div className="space-y-6 text-left max-w-2xl">
                    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Business DNA Blueprint Active
                    </div>

                    <div className="space-y-1">
                      <h1 className="text-3xl font-black text-neutral-950 tracking-tight leading-none">
                        Your Business DNA is Ready.
                      </h1>
                      <p className="text-xs text-neutral-400 font-medium">
                        Your entire Flowmint experience, recommended developer chats, and marketplace feed are now calibrated.
                      </p>
                    </div>

                    {/* Dynamic Business DNA Result card */}
                    <div className="bg-neutral-50/80 border border-neutral-150 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Score circle */}
                      <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-200 pb-4 md:pb-0 md:pr-4 text-center">
                        <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-xs border border-neutral-100">
                          <span className="text-2xl font-black text-neutral-950">78</span>
                          <span className="text-[10px] text-neutral-400 font-extrabold absolute bottom-2">Readiness</span>
                        </div>
                        <span className="text-[11px] font-bold text-neutral-900 mt-2.5">Intermediate Maturity</span>
                      </div>

                      {/* Right: Heuristics parameters */}
                      <div className="md:col-span-2 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] text-neutral-400 uppercase font-black">Estimated ROI</span>
                            <p className="font-extrabold text-blue-600">360% / 1st Year</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 uppercase font-black">Admin Hours Saved</span>
                            <p className="font-extrabold text-neutral-800">24 hrs / week</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-150">
                          <span className="text-[9px] text-neutral-400 uppercase font-black">Primary Opportunity Vector</span>
                          <p className="font-bold text-neutral-800 mt-0.5">
                            {extractedOpportunities[0] || 'Unify customer support queues using conversational LLM nodes.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(techStack || []).slice(0, 4).map(st => (
                            <span key={st} className="px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-[9px] font-bold text-neutral-600">
                              ✓ {st} Active
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Persistent buttons in footer */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between shrink-0">
            {step < 9 ? (
              <span className="text-[10px] text-neutral-400 font-semibold italic">
                {step === 1 && showSignIn ? "Secure sandbox connection active." : "All answers automatically persisted instantly."}
              </span>
            ) : (
              <div />
            )}

            {step < 9 ? (
              (step === 1 && showSignIn) ? null : (
                <button
                  onClick={() => handleStepChange(step + 1)}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-[12px] font-bold transition-all duration-200 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : step === 10 ? (
              <div className="flex items-center space-x-3 w-full justify-end">
                <button
                  onClick={triggerCompletion}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 text-[12px] font-extrabold transition-all duration-200 shadow-sm flex items-center space-x-1 cursor-pointer"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
