import React, { useState, useEffect } from 'react';
import { FlowDB } from '../lib/database';
import { Automation, Creator } from '../types';
import { INDUSTRIES, CATEGORIES, TECH_STACKS } from '../data';
import { 
  Sparkles, Plus, Edit, Trash2, Check, Eye, Bookmark, TrendingUp, DollarSign, Clock, LayoutGrid, AlertCircle, RefreshCw, UploadCloud, BookOpen, Layers, Zap, ToggleLeft, ToggleRight, FileText
} from 'lucide-react';

interface CreatorDashboardProps {
  userProfile: any;
  onOpenWorkflow: (id: string) => void;
}

export default function CreatorDashboard({ userProfile, onOpenWorkflow }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'automations' | 'create'>('analytics');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAuto, setSelectedAuto] = useState<Automation | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for create/edit
  const [formName, setFormName] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formValueProp, setFormValueProp] = useState('');
  const [formRoi, setFormRoi] = useState('380% / Year');
  const [formHoursSaved, setFormHoursSaved] = useState('22 hours saved/week');
  const [formMonthlyCost, setFormMonthlyCost] = useState('3500');
  const [formIndustry, setFormIndustry] = useState('SaaS & Tech');
  const [formCategory, setFormCategory] = useState('AI Agents');
  const [formPlatforms, setFormPlatforms] = useState<string[]>(['OpenAI', 'Slack']);
  const [formPrice, setFormPrice] = useState('$1,850');
  const [formTime, setFormTime] = useState('5 days');
  const [formDifficulty, setFormDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published');
  
  // Custom Workflow JSON definition
  const [nodeCount, setNodeCount] = useState(3);
  const [nodes, setNodes] = useState<Array<{ label: string, purpose: string, tool: string }>>([
    { label: 'Inbound Webhook Received', purpose: 'Capture pay payload details securely', tool: 'Stripe' },
    { label: 'Synthesize LLM Dispatch', purpose: 'Generate contextual auto-reply drafts', tool: 'OpenAI' },
    { label: 'Push Approved Alert', purpose: 'Notify team inside operations channel', tool: 'Slack' }
  ]);

  // Read live data from FlowDB
  useEffect(() => {
    const handleSync = () => {
      // Filter automations belonging strictly to this creator
      const allAuts = FlowDB.getAutomations();
      const creatorAuts = allAuts.filter(aut => aut.creatorId === userProfile?.email);
      setAutomations(creatorAuts);
    };

    handleSync();
    window.addEventListener('flowdb-sync', handleSync);
    return () => window.removeEventListener('flowdb-sync', handleSync);
  }, [userProfile]);

  const handleAddPlatform = (plat: string) => {
    if (formPlatforms.includes(plat)) {
      setFormPlatforms(formPlatforms.filter(p => p !== plat));
    } else {
      setFormPlatforms([...formPlatforms, plat]);
    }
  };

  const handleNodeChange = (index: number, field: 'label' | 'purpose' | 'tool', value: string) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    setNodes(updated);
  };

  const handleSetNodeCount = (count: number) => {
    setNodeCount(count);
    const updated = [...nodes];
    if (count > nodes.length) {
      for (let i = nodes.length; i < count; i++) {
        updated.push({ label: `Operation Step ${i + 1}`, purpose: 'Automated data pipeline action', tool: formPlatforms[0] || 'System Core' });
      }
    } else {
      updated.splice(count);
    }
    setNodes(updated);
  };

  const handleEditInit = (aut: Automation) => {
    setSelectedAuto(aut);
    setFormName(aut.name);
    setFormProblem(aut.problemSolved);
    setFormValueProp(aut.valueProp || '');
    setFormRoi(aut.roi);
    setFormHoursSaved(`${aut.hoursSaved || 20} hours saved/week`);
    setFormMonthlyCost(String(aut.monthlyCostReduction || 2500));
    setFormIndustry(aut.industry);
    setFormCategory(aut.category);
    setFormPlatforms(aut.platforms);
    setFormPrice(aut.price);
    setFormTime(aut.implementationTime);
    setFormDifficulty(aut.difficulty || 'Intermediate');
    setFormStatus(aut.status || 'published');
    
    // Nodes
    if (aut.workflow && aut.workflow.length > 0) {
      setNodeCount(aut.workflow.length);
      setNodes(aut.workflow.map(n => ({
        label: n.label,
        purpose: n.purpose || '',
        tool: n.tool || 'System'
      })));
    } else {
      setNodeCount(3);
      setNodes([
        { label: 'Inbound Webhook Received', purpose: 'Capture pay payload details securely', tool: 'Stripe' },
        { label: 'Synthesize LLM Dispatch', purpose: 'Generate contextual auto-reply drafts', tool: 'OpenAI' },
        { label: 'Push Approved Alert', purpose: 'Notify team inside operations channel', tool: 'Slack' }
      ]);
    }
    setActiveTab('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this automation pipeline? It will be removed from the marketplace.')) {
      return;
    }
    setIsLoading(true);
    try {
      await FlowDB.deleteAutomation(id);
      setSuccessMsg('Automation deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete automation: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProblem.trim()) {
      setErrorMsg('Please enter a name and the problem solved.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const workflowNodes = nodes.map((node, index) => ({
      id: `node_${Date.now()}_${index}`,
      label: node.label,
      purpose: node.purpose,
      tool: node.tool,
      outcome: 'Process finalized and logged successfully.',
      timeEstimate: '< 1.5s'
    }));

    const hours = parseInt(formHoursSaved.replace(/[^0-9]/g, '')) || 20;

    const automationPayload = {
      name: formName,
      problemSolved: formProblem,
      valueProp: formValueProp || 'Automates critical workflow steps with high precision.',
      roi: formRoi,
      hoursSaved: hours,
      monthlyCostReduction: Number(formMonthlyCost),
      industry: formIndustry,
      category: formCategory,
      platforms: formPlatforms.length > 0 ? formPlatforms : ['OpenAI', 'Slack'],
      difficulty: formDifficulty,
      implementationTime: formTime,
      price: formPrice,
      creatorId: userProfile?.email || '',
      workflow: workflowNodes,
      status: formStatus
    };

    try {
      if (selectedAuto) {
        // Edit flow
        await FlowDB.updateAutomation({
          ...automationPayload,
          id: selectedAuto.id,
          likesCount: selectedAuto.likesCount || 0
        });
        setSuccessMsg(formStatus === 'draft' ? 'Automation saved as draft!' : 'Automation pipeline updated successfully!');
      } else {
        // Add flow
        await FlowDB.addAutomation(automationPayload);
        setSuccessMsg(formStatus === 'draft' ? 'Automation saved as draft successfully!' : 'Automation pipeline published successfully inside the global Flowmint marketplace!');
      }

      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedAuto(null);
        // Reset form
        setFormName('');
        setFormProblem('');
        setFormValueProp('');
        setFormRoi('380% / Year');
        setFormHoursSaved('22 hours saved/week');
        setFormMonthlyCost('3500');
        setFormPlatforms(['OpenAI', 'Slack']);
        setFormPrice('$1,850');
        setFormTime('5 days');
        setActiveTab('automations');
      }, 2000);

    } catch (err: any) {
      setErrorMsg('Database save error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left max-w-5xl mx-auto py-4">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flowmint Creator Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Creator Dashboard</h1>
          <p className="text-xs text-neutral-500 font-medium">
            Manage your AI pipelines, publish custom automations, and track your marketplace visibility stats.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              setSelectedAuto(null);
              // Reset
              setFormName('');
              setFormProblem('');
              setFormValueProp('');
              setActiveTab('create');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-transform cursor-pointer shadow-sm shadow-blue-500/10 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Automation</span>
          </button>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('automations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'automations' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          My Listed Automations ({automations.length})
        </button>
        <button
          onClick={() => {
            setSelectedAuto(null);
            setActiveTab('create');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          {selectedAuto ? 'Edit Automation' : 'Publish Builder'}
        </button>
      </div>

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Total Live Views</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-neutral-950">1,842</span>
                <span className="text-emerald-600 text-[10px] font-extrabold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">+14% wk</span>
              </div>
              <p className="text-[10px] text-neutral-400">Total traffic across your listed pipelines.</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Total Bookmarks</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-neutral-950">218</span>
                <span className="text-emerald-600 text-[10px] font-extrabold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">+8% wk</span>
              </div>
              <p className="text-[10px] text-neutral-400">Times your automations have been saved.</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Active Projects</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-neutral-950">4</span>
                <span className="text-blue-600 text-[10px] font-extrabold flex items-center bg-blue-50 px-1.5 py-0.5 rounded-md">2 Delivery</span>
              </div>
              <p className="text-[10px] text-neutral-400">Customizations currently in development.</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2.5 shadow-sm bg-neutral-900 text-white border-none">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Platform Earnings</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black">$8,450</span>
                <span className="text-blue-400 text-[10px] font-extrabold flex items-center bg-white/10 px-1.5 py-0.5 rounded-md">Settled</span>
              </div>
              <p className="text-[10px] text-neutral-300">Revenue from purchased implementations.</p>
            </div>
          </div>

          {/* Tips and Activity Banner */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-sm font-bold text-neutral-950">Need assistance matching business software stacks?</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                Flowmint filters and reorders marketplace lists automatically. By publishing automations with standard platforms like <span className="font-bold">HubSpot, Stripe, or Salesforce</span>, you instantly appear inside recommended categories for high-fit businesses.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-colors"
            >
              Configure Nodes
            </button>
          </div>

          {/* Quick List of live publications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Performing Pipelines</h3>
            <div className="bg-white border border-neutral-200/90 rounded-3xl divide-y divide-neutral-100 overflow-hidden shadow-sm">
              {automations.slice(0, 3).map((aut) => (
                <div key={aut.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/40 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                      {aut.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="text-xs font-extrabold text-neutral-900 truncate max-w-[280px] md:max-w-md">{aut.name}</h4>
                      <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[280px] md:max-w-md">{aut.problemSolved}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">ROI</span>
                      <span className="text-xs font-bold text-emerald-600">{aut.roi}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Price</span>
                      <span className="text-xs font-black text-neutral-950">{aut.price}</span>
                    </div>
                    <button
                      onClick={() => onOpenWorkflow(aut.id)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg cursor-pointer"
                      title="View Live Workflow"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {automations.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No pipelines published yet. Click "Publish New Automation" to get started!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY LISTED AUTOMATIONS TAB */}
      {activeTab === 'automations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Live Database Publications</h3>
            <span className="text-[10px] text-neutral-500 font-bold">{automations.length} total automations registered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.map((aut) => (
              <div key={aut.id} className="bg-white border border-neutral-200/90 hover:border-neutral-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group">
                {/* Accent Tag */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-full blur-xl pointer-events-none" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                      {aut.category}
                    </span>
                    <span className="text-xs font-black text-neutral-900">{aut.price}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-neutral-950 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">{aut.name}</h4>
                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed line-clamp-2">{aut.problemSolved}</p>
                  </div>

                  {/* Platforms badges */}
                  <div className="flex flex-wrap gap-1">
                    {aut.platforms.map((p, i) => (
                      <span key={i} className="px-1.5 py-0.5 border border-neutral-150 text-[9px] font-bold text-neutral-500 rounded bg-neutral-50">
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 bg-neutral-50 rounded-xl p-2.5 text-center">
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase block">Est. ROI</span>
                      <span className="text-[11px] font-black text-emerald-600">{aut.roi}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase block">Hours Saved</span>
                      <span className="text-[11px] font-black text-blue-600">{aut.hoursSaved || 20} hrs/wk</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenWorkflow(aut.id)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Pipeline</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditInit(aut)}
                      className="p-2 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 rounded-xl transition-all cursor-pointer border border-transparent hover:border-neutral-100"
                      title="Edit Pipeline Configuration"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(aut.id)}
                      className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                      title="Delete Pipeline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {automations.length === 0 && (
              <div className="col-span-full bg-neutral-50 border border-neutral-200 border-dashed rounded-3xl p-12 text-center space-y-3">
                <LayoutGrid className="w-8 h-8 text-neutral-400 mx-auto" />
                <h4 className="text-xs font-bold text-neutral-900">Your marketplace catalog is currently empty</h4>
                <p className="text-[10px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Elite companies discover, evaluate, and purchase automations published by verified builders. List your first pipeline to begin.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl cursor-pointer"
                >
                  Create Custom Automation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CREATE / EDIT AUTOMATION FORM TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-neutral-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-neutral-950">
                {selectedAuto ? `Edit Automation: "${selectedAuto.name}"` : 'Publish a Custom AI Automation'}
              </h3>
              <p className="text-[10px] text-neutral-400">Specify core operational nodes, target software stacks, and projected ROI parameters.</p>
            </div>
            {selectedAuto && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAuto(null);
                  setFormName('');
                  setFormProblem('');
                  setFormValueProp('');
                }}
                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
              >
                Cancel Editing (Create New)
              </button>
            )}
          </div>

          {/* Success / Error notification */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-2 text-emerald-700 text-[11px] font-bold">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-red-600 text-[11px] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Automation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inbound Marketing & Lead Enrichment Hub"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Core Problem Solved</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the operational bottleneck (e.g., Manual copying of client billing data into books)."
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Value Proposition / Output (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Automatically parses, matches, and logs client invoices in 1.5 seconds."
                  value={formValueProp}
                  onChange={(e) => setFormValueProp(e.target.value)}
                  className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Industry Target</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="block w-full px-3.5 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    {INDUSTRIES.map((ind, i) => (
                      <option key={i} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Pipeline Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="block w-full px-3.5 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    {CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Setup Price (One-time)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $1,850"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Implementation Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 days"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Advanced Multi-Select Tech Stack */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Supported Platforms & Stack</label>
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto border border-neutral-150 p-2.5 rounded-xl bg-neutral-50/30 scrollbar-none">
                  {TECH_STACKS.map((plat) => {
                    const active = formPlatforms.includes(plat);
                    return (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => handleAddPlatform(plat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${active ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metrics & Custom Workflow Node configuration */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Estimated ROI (e.g. 350%)</label>
                  <input
                    type="text"
                    required
                    value={formRoi}
                    onChange={(e) => setFormRoi(e.target.value)}
                    className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Hours Saved / Week</label>
                  <input
                    type="text"
                    required
                    value={formHoursSaved}
                    onChange={(e) => setFormHoursSaved(e.target.value)}
                    className="block w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Dynamic node logic */}
              <div className="space-y-3.5 p-4 bg-neutral-50/50 border border-neutral-150 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Workflow Nodes Setup</span>
                    <span className="text-[9px] text-neutral-500 leading-none">Determine multi-step routing configuration</span>
                  </div>
                  <select
                    value={nodeCount}
                    onChange={(e) => handleSetNodeCount(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800"
                  >
                    {[2, 3, 4, 5].map((val) => (
                      <option key={val} value={val}>{val} Steps</option>
                    ))}
                  </select>
                </div>

                {/* Node Inputs list */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {Array.from({ length: nodeCount }).map((_, idx) => (
                    <div key={idx} className="p-3 bg-white border border-neutral-200/85 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-blue-600">Step {idx + 1} Node</span>
                        <input
                          type="text"
                          required
                          placeholder="Node tool e.g. OpenAI"
                          value={nodes[idx]?.tool || ''}
                          onChange={(e) => handleNodeChange(idx, 'tool', e.target.value)}
                          className="w-24 px-1.5 py-0.5 border border-neutral-200 rounded text-[10px] font-bold outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Step action label (e.g. Sync invoice metadata)"
                        value={nodes[idx]?.label || ''}
                        onChange={(e) => handleNodeChange(idx, 'label', e.target.value)}
                        className="w-full px-2 py-1.5 bg-neutral-50/50 border border-neutral-150 rounded-lg text-[11px] font-bold placeholder-neutral-400 outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Detailed purpose (e.g. Runs dynamic lookup)"
                        value={nodes[idx]?.purpose || ''}
                        onChange={(e) => handleNodeChange(idx, 'purpose', e.target.value)}
                        className="w-full px-2 py-1 bg-neutral-50/50 border border-neutral-150 rounded-lg text-[10px] font-medium placeholder-neutral-400 outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedAuto(null);
                setActiveTab('automations');
              }}
              className="px-4 py-2.5 border border-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl text-xs font-bold active:scale-[0.98] transition-transform cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setFormStatus('draft')}
              disabled={isLoading}
              className="px-4 py-2.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold active:scale-[0.98] transition-transform cursor-pointer flex items-center space-x-2 disabled:opacity-60"
            >
              {isLoading && formStatus === 'draft' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
            <button
              type="submit"
              onClick={() => setFormStatus('published')}
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-transform cursor-pointer shadow-sm shadow-blue-500/10 flex items-center space-x-2 disabled:opacity-60"
            >
              {isLoading && formStatus === 'published' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{selectedAuto ? 'Publish Changes' : 'Publish to Marketplace'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
