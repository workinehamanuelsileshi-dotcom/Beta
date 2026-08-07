import React, { useState } from 'react';
import { 
  FolderLock, CheckSquare, Plus, DollarSign, Calendar, MessageSquare, 
  Settings, Layers, PlayCircle, Star, ArrowRight, ClipboardList, Clock, ShieldCheck 
} from 'lucide-react';

interface ProjectTask {
  id: string;
  title: string;
  desc: string;
  status: 'todo' | 'inprogress' | 'completed';
  dueDate: string;
  creator: string;
}

export default function ProjectsPage() {
  const [activeBoardTab, setActiveBoardTab] = useState<'board' | 'payments' | 'deliverables'>('board');
  const [tasks, setTasks] = useState<ProjectTask[]>([
    { id: 't1', title: 'Parse HubSpot lead parameters', desc: 'Initialize standard CRM lookup filters for organic inbound contacts.', status: 'completed', dueDate: 'July 24, 2026', creator: 'FlowGenius' },
    { id: 't2', title: 'Deploy Stripe Webhook payload handler', desc: 'Test webhook signatures to receive invoice paid notifications.', status: 'inprogress', dueDate: 'July 28, 2026', creator: 'FlowGenius' },
    { id: 't3', title: 'Verify custom Gmail thread labels', desc: 'Auto-apply thread categories based on keyword extraction scores.', status: 'todo', dueDate: 'August 02, 2026', creator: 'You' },
    { id: 't4', title: 'Setup Google Sheets backup sheet', desc: 'Maintain complete mirroring of transaction payloads securely.', status: 'inprogress', dueDate: 'July 29, 2026', creator: 'AutomateX' }
  ]);

  const [newTodoTitle, setNewTodoTitle] = useState('');

  const handleAddTask = () => {
    if (!newTodoTitle.trim()) return;
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: newTodoTitle,
      desc: 'Custom task specified via manual dashboard operation.',
      status: 'todo',
      dueDate: 'August 10, 2026',
      creator: 'You'
    };
    setTasks([...tasks, newTask]);
    setNewTodoTitle('');
  };

  const handleUpdateStatus = (id: string, newStatus: 'todo' | 'inprogress' | 'completed') => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // Compute stats
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Active Workspace
          </span>
          <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight font-sans">
            Project Dashboard
          </h2>
          <p className="text-[14px] text-neutral-500 font-medium leading-relaxed">
            Monitor real-time task completion, check ongoing milestone deliverables, approve payouts, and test live workflow deployments.
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm shrink-0">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-blue-600" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-neutral-900">
              {progressPercent}%
            </div>
          </div>
          <div>
            <h5 className="text-[12px] font-bold text-neutral-950">Milestone Progress</h5>
            <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{completedCount} of {tasks.length} tasks completed</p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex items-center space-x-1.5 border-b border-neutral-100 pb-1">
        {[
          { id: 'board', label: 'Kanban Tasks' },
          { id: 'payments', label: 'Escrow & Payments' },
          { id: 'deliverables', label: 'Deliverable Hub' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveBoardTab(sub.id as any)}
            className={`px-4 py-2 text-xs font-bold relative transition-colors cursor-pointer ${
              activeBoardTab === sub.id ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <span>{sub.label}</span>
            {activeBoardTab === sub.id && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* RENDER KANBAN TASK BOARD */}
      {activeBoardTab === 'board' && (
        <div className="space-y-6">
          
          {/* Quick task input */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-2xl p-2 max-w-md shadow-sm">
            <input 
              type="text" 
              placeholder="Add quick custom task..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 bg-transparent px-3 text-xs outline-none text-neutral-800 placeholder-neutral-400 font-medium"
            />
            <button 
              onClick={handleAddTask}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-bold rounded-xl cursor-pointer"
            >
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: TODO */}
            <div className="bg-neutral-50/50 border border-neutral-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">To Do</span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full text-[9px] font-bold">
                  {tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <h5 className="text-[12px] font-bold text-neutral-950 leading-snug">{task.title}</h5>
                    <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">{task.desc}</p>
                    <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
                      <span className="text-[9px] text-neutral-400 font-bold">by {task.creator}</span>
                      <button 
                        onClick={() => handleUpdateStatus(task.id, 'inprogress')}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="bg-neutral-50/50 border border-neutral-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">In Progress</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold">
                  {tasks.filter(t => t.status === 'inprogress').length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'inprogress').map(task => (
                  <div key={task.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <h5 className="text-[12px] font-bold text-neutral-950 leading-snug">{task.title}</h5>
                    <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">{task.desc}</p>
                    <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
                      <span className="text-[9px] text-neutral-400 font-bold">by {task.creator}</span>
                      <button 
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Complete ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED */}
            <div className="bg-neutral-50/50 border border-neutral-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">Completed</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold">
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3 opacity-80">
                    <h5 className="text-[12px] font-bold text-neutral-950 line-through leading-snug">{task.title}</h5>
                    <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">{task.desc}</p>
                    <div className="pt-2 border-t border-neutral-50 flex items-center justify-between text-[9px] text-neutral-400 font-bold">
                      <span>by {task.creator}</span>
                      <span className="text-emerald-600">Completed ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER PAYMENTS TAB */}
      {activeBoardTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Escrow Summary</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Secured Escrow Balance</p>
                <p className="text-xl font-bold text-neutral-950 mt-1">$925.00</p>
                <span className="text-[9px] text-neutral-400 font-bold">Locked in smart contract</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Disbursed Funds</p>
                <p className="text-xl font-bold text-neutral-950 mt-1">$925.00</p>
                <span className="text-[9px] text-emerald-600 font-bold">Transferred for Completed Milestone 1</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Total Contract</p>
                <p className="text-xl font-bold text-neutral-950 mt-1">$1,850.00</p>
                <span className="text-[9px] text-neutral-400 font-bold">Stripe Business Invoicing</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Payout History</h5>
              {[
                { milestone: 'Milestone 1: Dynamic CSV data retrieval logic', cost: '$925.00', date: 'July 22, 2026', status: 'Disbursed', tx: 'tx_98A82D19' },
                { milestone: 'Milestone 2: HubSpot mapping & Stripe webhook trigger', cost: '$925.00', date: 'Pending completion', status: 'Locked', tx: 'tx_320D911A' }
              ].map((tx) => (
                <div key={tx.milestone} className="p-3 bg-neutral-50/50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-800">
                  <div className="text-left">
                    <p className="text-neutral-950 text-[12px]">{tx.milestone}</p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">Ref: {tx.tx} • {tx.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-neutral-950 text-[12px]">{tx.cost}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold block mt-1 text-center ${
                      tx.status === 'Disbursed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER DELIVERABLES TAB */}
      {activeBoardTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Shared Pipeline Assets</h4>
            
            <div className="space-y-2">
              {[
                { name: 'stripe_signature_decoder.js', type: 'Node.js Handler', size: '24 KB', date: 'July 25, 2026', verified: true },
                { name: 'hubspot_trigger_payload_schema.json', type: 'JSON Schema', size: '8 KB', date: 'July 21, 2026', verified: true },
                { name: 'invoice_parser_beta_demo.mp4', type: 'Screencast Walkthrough', size: '12.4 MB', date: 'July 24, 2026', verified: false }
              ].map((file) => (
                <div key={file.name} className="p-4 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-between text-xs group cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-none">{file.name}</h5>
                      <p className="text-[10px] text-neutral-400 font-medium mt-1.5">{file.type} • {file.size} • Uploaded {file.date}</p>
                    </div>
                  </div>
                  
                  {file.verified ? (
                    <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Run</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
                      Awaiting Testing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
