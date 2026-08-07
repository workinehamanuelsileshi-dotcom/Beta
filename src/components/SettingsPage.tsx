import React, { useState } from 'react';
import { 
  ShieldCheck, HelpCircle, Key, CreditCard, BellRing, Settings, 
  Link, Globe, Layout, Palette, Check, RefreshCw, AlertCircle, Sparkles, Database 
} from 'lucide-react';
import { FlowDB } from '../lib/database';
import { BusinessDNA } from '../types';

export default function SettingsPage() {
  const [activeSettingsSection, setActiveSettingsSection] = useState<'account' | 'dna' | 'integrations' | 'billing'>('account');
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('flowmint_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'User',
          email: parsed.email || '',
          company: parsed.company || 'My Business',
          industry: parsed.industry || 'Financial Technology',
          userType: parsed.userType || 'buyer'
        };
      }
    } catch (e) {}
    return {
      name: 'User',
      email: '',
      company: 'My Business',
      industry: 'Financial Technology',
      userType: 'buyer'
    };
  });

  const [businessDNA, setBusinessDNA] = useState<BusinessDNA>(() => FlowDB.getBusinessDNA());

  // State-driven Interactive connected accounts grid
  const [integrations, setIntegrations] = useState([
    { id: 'hubspot', name: 'HubSpot CRM', status: 'Connected', desc: 'Sync leads, logs, and customer activities', icon: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=50' },
    { id: 'slack', name: 'Slack Workplace', status: 'Connected', desc: 'Post automated logs, updates, and chat links', icon: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=50' },
    { id: 'openai', name: 'OpenAI API Node', status: 'Connected', desc: 'Analyze attachments, classify sentiment', icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=50' },
    { id: 'airtable', name: 'Airtable Databases', status: 'Disconnected', desc: 'Log parsed invoices and custom pipelines', icon: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=50' },
    { id: 'stripe', name: 'Stripe Payments', status: 'Connected', desc: 'Create checkout sessions and track billing', icon: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=50' },
    { id: 'gmail', name: 'Google Gmail Client', status: 'Disconnected', desc: 'Read inbox payloads and send confirmation messages', icon: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=50' }
  ]);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Connected' ? 'Disconnected' : 'Connected' };
      }
      return item;
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('flowmint_user_profile', JSON.stringify({
      ...userProfile,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      role: userProfile.userType === 'creator' ? 'Verified Automation Creator' : 'Founder & CEO'
    }));
    FlowDB.notify();
    alert("Profile configurations saved successfully!");
  };

  const handleSaveDNA = (e: React.FormEvent) => {
    e.preventDefault();
    FlowDB.updateBusinessDNA(businessDNA);
    alert("Business DNA and tech stack preferences updated successfully!");
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          System Dashboard
        </span>
        <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
          Settings, Profile & Business DNA
        </h2>
        <p className="text-[14px] text-neutral-500 font-medium max-w-xl leading-relaxed">
          Manage user profiles, calibrate your business tech stack DNA, authenticate external third-party tools, and monitor billing.
        </p>
      </div>

      {/* Local navigation */}
      <div className="flex items-center space-x-1.5 border-b border-neutral-100 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'account', label: 'User Profile' },
          { id: 'dna', label: 'Business DNA & Stack' },
          { id: 'integrations', label: 'Connected Tools' },
          { id: 'billing', label: 'Billing & Plans' }
        ].map(sect => (
          <button
            key={sect.id}
            onClick={() => setActiveSettingsSection(sect.id as any)}
            className={`px-4 py-2 text-xs font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
              activeSettingsSection === sect.id ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <span>{sect.label}</span>
            {activeSettingsSection === sect.id && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* SECTION 1: USER PROFILE FORM */}
      {activeSettingsSection === 'account' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
          <h4 className="text-sm font-bold text-neutral-950 font-sans">Account Parameters</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={userProfile.email}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Name</label>
              <input 
                type="text" 
                value={userProfile.company}
                onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Industry</label>
              <input 
                type="text" 
                value={userProfile.industry}
                onChange={(e) => setUserProfile({...userProfile, industry: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Account Role / Type</label>
              <select
                value={userProfile.userType}
                onChange={(e) => setUserProfile({...userProfile, userType: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value="buyer">Buyer & Enterprise Team</option>
                <option value="creator">Verified Automation Creator</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-50 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Save Account Preferences
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: BUSINESS DNA & TECH STACK FORM */}
      {activeSettingsSection === 'dna' && (
        <form onSubmit={handleSaveDNA} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-neutral-950 font-sans">Business DNA & Systems Configuration</h4>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Used by Flowmint AI to match and recommend relevant automation workflows.</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
              100% Calibrated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Name</label>
              <input 
                type="text" 
                value={businessDNA.companyName}
                onChange={(e) => setBusinessDNA({...businessDNA, companyName: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Website URL</label>
              <input 
                type="text" 
                value={businessDNA.website}
                onChange={(e) => setBusinessDNA({...businessDNA, website: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Industry Vertical</label>
              <input 
                type="text" 
                value={businessDNA.industry}
                onChange={(e) => setBusinessDNA({...businessDNA, industry: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Size</label>
              <select
                value={businessDNA.companySize}
                onChange={(e) => setBusinessDNA({...businessDNA, companySize: e.target.value})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tech Stack Tools (Comma separated)</label>
              <input 
                type="text" 
                value={(businessDNA.techStack || []).join(', ')}
                onChange={(e) => setBusinessDNA({...businessDNA, techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="HubSpot, Slack, OpenAI, Stripe, Gmail"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Update Business DNA
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: INTERACTIVE CONNECTED INTEGRATIONS GRID */}
      {activeSettingsSection === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-950 font-sans">Active Sandbox Tokens</h4>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Toggle connections instantly to authorize external API reads/writes.</p>
              </div>
              <button 
                onClick={() => alert("All tokens verified as active!")}
                className="px-3 py-1.5 border border-neutral-200 text-neutral-500 hover:text-neutral-950 rounded-xl text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Verify All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {integrations.map((item) => (
                <div key={item.id} className="p-4 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-150 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 text-left">
                    <span className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-extrabold text-neutral-500 text-xs uppercase shrink-0">
                      {item.name[0]}
                    </span>
                    <div>
                      <h5 className="text-[12px] font-bold text-neutral-950">{item.name}</h5>
                      <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleToggleIntegration(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      item.status === 'Connected'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                        : 'bg-white text-neutral-500 border border-neutral-250 hover:bg-neutral-50 hover:text-neutral-800'
                    }`}
                  >
                    {item.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: BILLING & PLANS */}
      {activeSettingsSection === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
          
          {/* Active plan card */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-neutral-950 font-sans">Subscription Level</h4>
            
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                  Pro Pipeline Plan
                </span>
                <h5 className="text-base font-extrabold text-neutral-950 mt-1">Unlimited Automations</h5>
                <p className="text-[11px] text-neutral-500 font-medium">Billed monthly at $89/month. Next statement: August 22, 2026.</p>
              </div>
              <span className="text-lg font-black text-neutral-950">$89<span className="text-xs text-neutral-400 font-bold">/mo</span></span>
            </div>

            {/* Credit card */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Payout Method</p>
              <div className="p-4 bg-neutral-50/50 border border-neutral-100 rounded-xl flex items-center justify-between text-xs font-bold text-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4.5 h-4.5 text-neutral-400" />
                  <span>Visa ending in 8419</span>
                </div>
                <button onClick={() => alert("Card update modal opened")} className="text-blue-600 hover:text-blue-700 cursor-pointer">Edit</button>
              </div>
            </div>
          </div>

          {/* Quick upgrades / Limits sidebar */}
          <div className="bg-neutral-50/50 border border-neutral-200 rounded-3xl p-6 space-y-4 text-left">
            <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Workspace Limits</h4>
            
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700">
                  <span>API Calls</span>
                  <span>42.5K / 100K</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '42.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700">
                  <span>Saved Workflows</span>
                  <span>14 / 20</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-150 space-y-2">
                <div className="flex items-start space-x-1 text-[10px] text-neutral-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Upgrade to Enterprise for unlimited nodes, custom IP isolation, and direct Slack developer support.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

