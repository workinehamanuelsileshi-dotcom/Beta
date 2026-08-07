import React, { useState, useEffect } from 'react';
import { FlowDB } from '../lib/database';
import { Automation, Creator } from '../types';
import { INDUSTRIES, CATEGORIES, TECH_STACKS } from '../data';
import { 
  Database, 
  Trash2, 
  Plus, 
  RefreshCw, 
  FileJson, 
  Check, 
  X, 
  Sparkles, 
  Play, 
  Sliders, 
  Layers, 
  Clock, 
  DollarSign,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface DatabaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DatabaseManager({ isOpen, onClose }: DatabaseManagerProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'add' | 'raw'>('status');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [rawTable, setRawTable] = useState<'automations' | 'creators' | 'dna'>('automations');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for creating custom automations
  const [newAuto, setNewAuto] = useState({
    name: '',
    problemSolved: '',
    valueProp: '',
    roi: '350% ROI',
    hoursSaved: 20,
    monthlyCostReduction: 3000,
    industry: 'SaaS & Tech',
    category: 'Sales',
    platforms: [] as string[],
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    implementationTime: '7 days',
    price: '$1,500',
    creatorId: 'c1',
    workflowNodesCount: 3
  });

  // Dynamic workflow node inputs
  const [nodeLabels, setNodeLabels] = useState<string[]>(['Retrieve lead details', 'Synthesize personal pitch', 'Slack message notification']);
  const [nodePurposes, setNodePurposes] = useState<string[]>(['Find contact information and social updates', 'Leverage LLM for customized selling proposal', 'Wait for human approval and logs action']);

  useEffect(() => {
    const handleSync = () => {
      setAutomations(FlowDB.getAutomations());
      setCreators(FlowDB.getCreators());
    };
    handleSync();
    window.addEventListener('flowdb-sync', handleSync);
    return () => window.removeEventListener('flowdb-sync', handleSync);
  }, []);

  if (!isOpen) return null;

  const handleReset = () => {
    if (confirm('Are you sure you want to restore the database to its factory settings? All custom rows will be deleted.')) {
      FlowDB.resetToFactory();
      setSuccessMsg('Database seeded back to factory defaults successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this automation from the database?')) {
      FlowDB.deleteAutomation(id);
      setSuccessMsg('Record deleted from database successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleSelectPlatform = (plat: string) => {
    setNewAuto(prev => ({
      ...prev,
      platforms: prev.platforms.includes(plat)
        ? prev.platforms.filter(p => p !== plat)
        : [...prev.platforms, plat]
    }));
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuto.name.trim()) return;

    // Construct workflow nodes array based on inputs
    const nodes = Array.from({ length: newAuto.workflowNodesCount }).map((_, idx) => ({
      id: `node_${Date.now()}_${idx}`,
      label: nodeLabels[idx] || `Step ${idx + 1}`,
      purpose: nodePurposes[idx] || 'System pipeline operation step',
      tool: newAuto.platforms[idx] || newAuto.platforms[0] || 'System Core',
      outcome: 'Successfully processed and recorded.',
      timeEstimate: 'Instant'
    }));

    FlowDB.addAutomation({
      name: newAuto.name,
      problemSolved: newAuto.problemSolved || 'Manual operational bottlenecks.',
      valueProp: newAuto.valueProp || 'Auto-coordinates data steps cleanly.',
      roi: newAuto.roi,
      hoursSaved: Number(newAuto.hoursSaved),
      monthlyCostReduction: Number(newAuto.monthlyCostReduction),
      industry: newAuto.industry,
      category: newAuto.category,
      platforms: newAuto.platforms.length > 0 ? newAuto.platforms : ['Airtable', 'Slack'],
      difficulty: newAuto.difficulty,
      implementationTime: newAuto.implementationTime,
      price: newAuto.price,
      creatorId: newAuto.creatorId,
      workflow: nodes
    });

    setSuccessMsg('Successfully written to database collection!');
    // Reset form fields
    setNewAuto({
      name: '',
      problemSolved: '',
      valueProp: '',
      roi: '350% ROI',
      hoursSaved: 20,
      monthlyCostReduction: 3000,
      industry: 'SaaS & Tech',
      category: 'Sales',
      platforms: [],
      difficulty: 'Intermediate',
      implementationTime: '7 days',
      price: '$1,500',
      creatorId: 'c1',
      workflowNodesCount: 3
    });
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('status');
    }, 2000);
  };

  const getRawJSONData = () => {
    if (rawTable === 'automations') return JSON.stringify(automations, null, 2);
    if (rawTable === 'creators') return JSON.stringify(creators, null, 2);
    return JSON.stringify(FlowDB.getBusinessDNA(), null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/45 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-neutral-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-md font-bold text-neutral-900 font-sans">Active Solution Database (FlowDB)</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold tracking-wider uppercase border border-emerald-100 animate-pulse">Connected</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">Fully reactive document-store holding persistent automations, creators, and configurations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-[background-color,color,transform] active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="px-6 py-2 border-b border-neutral-100 flex items-center justify-between bg-white text-[12px] font-bold">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'status' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'}`}
            >
              Collections Status
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${activeTab === 'add' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert New Automation</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${activeTab === 'raw' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'}`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Raw JSON Explorer</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-100/50"
            title="Reset DB and Seed Initial Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-[12px] text-emerald-800 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Content Frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/20">
          
          {/* TAB 1: STATUS & DATA VIEWER */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-150/70 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Automations Collection</span>
                    <h4 className="text-xl font-black text-neutral-900 mt-1">{automations.length} rows</h4>
                  </div>
                  <Database className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
                <div className="bg-white border border-neutral-150/70 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Verified Creators</span>
                    <h4 className="text-xl font-black text-neutral-900 mt-1">{creators.length} rows</h4>
                  </div>
                  <Cpu className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
                <div className="bg-white border border-neutral-150/70 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Storage Protocol</span>
                    <h4 className="text-sm font-bold text-neutral-800 mt-2">Active LocalDB</h4>
                  </div>
                  <Check className="w-8 h-8 text-emerald-500 opacity-25" />
                </div>
              </div>

              {/* Table Records List */}
              <div className="bg-white border border-neutral-150/80 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/20">
                  <h4 className="text-[13px] font-bold text-neutral-800">Current Database Documents</h4>
                  <span className="text-[10px] text-neutral-400 font-medium">Click on any title to preview workflow on dashboard</span>
                </div>

                <div className="divide-y divide-neutral-100 max-h-[350px] overflow-y-auto">
                  {automations.map((aut, index) => {
                    const isCustom = aut.id.startsWith('aut_custom_');
                    return (
                      <div key={aut.id} className="p-3.5 hover:bg-neutral-50/75 transition-colors flex items-center justify-between text-[12px]">
                        <div className="flex items-center space-x-3 text-left">
                          <span className="w-5 text-center text-neutral-300 font-bold font-mono">#{index + 1}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-neutral-800 leading-tight">{aut.name}</span>
                              {isCustom && (
                                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase border border-blue-100">Bespoke</span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug font-medium line-clamp-1">{aut.problemSolved}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0 pl-4">
                          <div className="text-right">
                            <span className="font-bold text-neutral-800">{aut.price}</span>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight mt-0.5">{aut.roi}</p>
                          </div>
                          
                          <button
                            onClick={() => handleDelete(aut.id)}
                            className="p-1.5 bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete document from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSERT DOCUMENT FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateAutomation} className="bg-white border border-neutral-150/80 p-6 rounded-2xl space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Automation Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Zendesk Ticket Auto-Reply Engine"
                    value={newAuto.name}
                    onChange={(e) => setNewAuto({...newAuto, name: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Estimated Value Proposition</label>
                  <input
                    type="text"
                    placeholder="e.g. Resolves 75% of incoming ticket volumes"
                    value={newAuto.valueProp}
                    onChange={(e) => setNewAuto({...newAuto, valueProp: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Target Industry</label>
                  <select
                    value={newAuto.industry}
                    onChange={(e) => setNewAuto({...newAuto, industry: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Functional Category</label>
                  <select
                    value={newAuto.category}
                    onChange={(e) => setNewAuto({...newAuto, category: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Complexity Level</label>
                  <select
                    value={newAuto.difficulty}
                    onChange={(e) => setNewAuto({...newAuto, difficulty: e.target.value as any})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Price Quote</label>
                  <input
                    type="text"
                    value={newAuto.price}
                    onChange={(e) => setNewAuto({...newAuto, price: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ROI Estimate</label>
                  <input
                    type="text"
                    value={newAuto.roi}
                    onChange={(e) => setNewAuto({...newAuto, roi: e.target.value})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Hours Saved / wk</label>
                  <input
                    type="number"
                    value={newAuto.hoursSaved}
                    onChange={(e) => setNewAuto({...newAuto, hoursSaved: Number(e.target.value)})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Cost Reduction / mo</label>
                  <input
                    type="number"
                    value={newAuto.monthlyCostReduction}
                    onChange={(e) => setNewAuto({...newAuto, monthlyCostReduction: Number(e.target.value)})}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[12px] text-neutral-800 outline-none"
                  />
                </div>
              </div>

              {/* Platform Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Systems Integrations (Platforms)</label>
                <div className="flex flex-wrap gap-1.5 p-3.5 border border-neutral-100 rounded-2xl">
                  {TECH_STACKS.map(tech => {
                    const selected = newAuto.platforms.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleSelectPlatform(tech)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                          selected 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{tech}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic workflow steps */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Workflow Sequence Steps</label>
                  <div className="flex space-x-1">
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewAuto({...newAuto, workflowNodesCount: n})}
                        className={`w-6 h-6 rounded text-[10px] font-bold border transition-colors cursor-pointer ${newAuto.workflowNodesCount === n ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: newAuto.workflowNodesCount }).map((_, idx) => (
                    <div key={idx} className="p-3.5 border border-neutral-100 rounded-2xl bg-neutral-50/50 text-left space-y-2">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Step #{idx + 1} Action</span>
                      
                      <input
                        type="text"
                        placeholder={`Label, e.g. Sync record to board`}
                        value={nodeLabels[idx] || ''}
                        onChange={(e) => {
                          const next = [...nodeLabels];
                          next[idx] = e.target.value;
                          setNodeLabels(next);
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 text-[11px] text-neutral-800 outline-none focus:border-blue-500"
                      />

                      <input
                        type="text"
                        placeholder={`Description, e.g. Automatically stores raw data payloads`}
                        value={nodePurposes[idx] || ''}
                        onChange={(e) => {
                          const next = [...nodePurposes];
                          next[idx] = e.target.value;
                          setNodePurposes(next);
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 text-[11px] text-neutral-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-medium">Any insertion instantly syncs the custom query feed.</span>
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl px-6 py-3.5 text-[12px] font-bold active:scale-[0.96] transition-transform duration-150 cursor-pointer flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Insert to Document DB</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: RAW JSON EXPLORER */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 bg-white border border-neutral-150/70 p-2.5 rounded-2xl">
                {(['automations', 'creators', 'dna'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setRawTable(tab)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${rawTable === tab ? 'bg-neutral-150 text-neutral-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'}`}
                  >
                    Collection: {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[400px] text-left">
                  {getRawJSONData()}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
