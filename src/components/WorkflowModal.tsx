import React, { useState } from 'react';
import { Automation, Creator } from '../types';
import { FlowDB } from '../lib/database';
import { X, Send, Check, Bookmark, Heart, Share2, ShieldCheck, Clock, Coins, Sparkles, MessageSquare, Loader } from 'lucide-react';

interface WorkflowModalProps {
  automation: Automation;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onToggleLike: (id: string) => void;
  isBookmarked: boolean;
  isLiked: boolean;
  onStartChat?: (creatorName: string) => void;
  onViewCreator?: () => void;
}

export default function WorkflowModal({
  automation,
  isOpen,
  onClose,
  onToggleBookmark,
  onToggleLike,
  isBookmarked,
  isLiked,
  onStartChat,
  onViewCreator
}: WorkflowModalProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(automation.workflow[0]?.id || null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'creator'; text: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);
  const [secured, setSecured] = useState(false);

  if (!isOpen) return null;

  const dbCreator = FlowDB.getCreatorById(automation.creatorId);
  const creatorDisplay = automation.creatorId ? automation.creatorId.split('@')[0] : 'Expert Creator';
  const creator: Creator = dbCreator || {
    id: automation.creatorId || 'expert',
    name: creatorDisplay,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(creatorDisplay)}`,
    rating: 5.0,
    reviewsCount: 1,
    verified: true,
    specialty: `${automation.category || 'Expert'} Solutions`,
    completedProjects: 12
  };

  const activeNode = automation.workflow.find(n => n.id === activeNodeId) || automation.workflow[0];

  const handleSecureBlueprint = () => {
    if (isSecuring || secured) return;
    setIsSecuring(true);
    setTimeout(() => {
      setIsSecuring(false);
      setSecured(true);
      setChatHistory(prev => [
        ...prev,
        { sender: 'creator', text: `🔒 Solution Blueprint Secured! I've automatically queued a premium customization request for this "${automation.name}" pipeline in our queue. Let's design the exact endpoints together.` }
      ]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    const currentHistory = [...chatHistory, { sender: 'user', text: userText }];
    setChatHistory(currentHistory);
    setChatMessage('');
    setIsSending(true);

    fetch('/api/creator-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creator,
        automation,
        chatHistory: currentHistory,
        message: userText
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Chat service offline");
      return res.json();
    })
    .then(data => {
      setChatHistory(prev => [...prev, { sender: 'creator', text: data.reply }]);
      setIsSending(false);
    })
    .catch(err => {
      console.error("Creator chat error:", err);
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: 'creator', text: `Thanks for reaching out! I am currently analyzing your environment. I can help customize this "${automation.name}" pipeline specifically for your workspace stack. Let's schedule a scoping call soon.` }]);
        setIsSending(false);
      }, 1000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans" id="workflow-modal-root">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
        {/* Modal Container */}
        <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-neutral-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
          
          {/* Left Panel: Workflow & Diagram (Interactive Grid/Flow) */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-r border-neutral-150 bg-white">
            <div>
              {/* Header Details */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase font-mono">
                    {automation.industry} • {automation.category}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-1 font-sans">
                    {automation.name}
                  </h2>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex items-center space-x-1.5">
                  <button 
                    onClick={() => onToggleBookmark(automation.id)}
                    className={`p-2.5 rounded-full border transition-[background-color,border-color,color,transform] duration-200 cursor-pointer active:scale-[0.94] ${
                      isBookmarked 
                        ? 'bg-blue-50 border-blue-100 text-blue-600' 
                        : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => onToggleLike(automation.id)}
                    className={`p-2.5 rounded-full border transition-[background-color,border-color,color,transform] duration-200 cursor-pointer active:scale-[0.94] ${
                      isLiked 
                        ? 'bg-red-50 border-red-100 text-red-500' 
                        : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Value Propositions */}
              <p className="text-[13px] text-neutral-500 mt-3 max-w-2xl leading-relaxed">
                {automation.problemSolved}
              </p>
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase leading-none">Primary Solution</p>
                    <p className="text-[12px] text-neutral-700 font-medium mt-0.5">{automation.valueProp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-3 sm:pt-0 sm:pl-6">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-bold uppercase font-sans">ESTIMATED ROI</span>
                    <p className="text-md font-bold text-blue-600 font-mono">{automation.roi}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 font-bold uppercase font-sans">EST. BUDGET</span>
                    <p className="text-md font-bold text-neutral-900 font-mono">{automation.price}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Nodes Interactive Flowchart */}
              <div className="mt-8">
                <h4 className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-4 text-left font-sans">
                  Interactive Pipeline Architecture
                </h4>
                
                {/* Horizontal diagram or vertical cascade */}
                <div className="flex flex-col space-y-3 relative">
                  {automation.workflow.map((node, idx) => {
                    const isActive = node.id === activeNodeId;
                    return (
                      <div 
                        key={node.id}
                        onClick={() => setActiveNodeId(node.id)}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                          isActive 
                            ? 'bg-white border-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.03)] z-10' 
                            : 'bg-neutral-50/50 border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          {/* Node bubble */}
                          <div className={`w-8 h-8 rounded-full font-bold text-[12px] flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-neutral-900 text-white animate-pulse' 
                              : 'bg-white text-neutral-400 border border-neutral-200 group-hover:border-neutral-400 group-hover:text-neutral-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className={`text-[13px] font-bold tracking-tight transition-all font-sans ${isActive ? 'text-neutral-950' : 'text-neutral-600'}`}>
                              {node.label}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-medium leading-none mt-0.5">{node.tool}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-semibold text-neutral-400 font-mono">{node.timeEstimate}</span>
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-500 scale-125' : 'bg-neutral-200 group-hover:bg-neutral-400'}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Static Node Metadata Detail Explainer (Hover output) */}
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-sans">Active Step Target</span>
                  <p className="text-[12px] font-semibold text-neutral-800 mt-0.5 font-sans truncate">{activeNode.label}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-sans">Core System Used</span>
                  <p className="text-[12px] font-semibold text-neutral-800 mt-0.5 font-sans">{activeNode.tool}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-sans">Immediate Outcome</span>
                  <p className="text-[12px] font-semibold text-blue-600 mt-0.5 font-sans">{activeNode.outcome}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-sans">Execution Time</span>
                  <p className="text-[12px] font-bold text-neutral-900 mt-0.5 font-mono">{activeNode.timeEstimate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Creator Customization Chat (Stripe and Linear inspired) */}
          <div className="w-full md:w-80 bg-neutral-50 p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-full">
            <div className="flex flex-col h-full justify-between space-y-6">
              
              {/* Creator details card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Automation Specialist</span>
                  <button 
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-[background-color,color,transform] duration-150 active:scale-[0.94] cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div 
                  onClick={() => onViewCreator?.()}
                  className="flex items-start space-x-3 text-left cursor-pointer group/creator bg-white hover:bg-neutral-100 p-2.5 rounded-2xl border border-neutral-150 transition-all"
                  title={`View ${creator.name}'s Profile`}
                >
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-11 h-11 rounded-full object-cover border border-neutral-200 outline outline-1 outline-black/10 outline-offset-[-1px] group-hover/creator:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <h4 className="text-[13px] font-bold text-neutral-900 font-sans group-hover/creator:text-blue-600 transition-colors">{creator.name}</h4>
                      {creator.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">{creator.specialty}</p>
                    <p className="text-[10px] text-neutral-500 font-medium mt-1">★ {creator.rating} ({creator.reviewsCount} reviews)</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                  <div className="bg-white border border-neutral-150 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">IMPLEMENTATION</span>
                    <p className="text-[12px] font-bold text-neutral-800 font-mono mt-0.5">{automation.implementationTime}</p>
                  </div>
                  <div className="bg-white border border-neutral-150 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">COMPLETED PROJ.</span>
                    <p className="text-[12px] font-bold text-neutral-800 font-mono mt-0.5">{creator.completedProjects}</p>
                  </div>
                </div>
              </div>

              {/* Conversation Area */}
              <div className="flex-1 border border-neutral-200 bg-white rounded-2xl p-4 flex flex-col justify-between overflow-hidden min-h-[160px]">
                <div className="overflow-y-auto space-y-3 flex-1 pr-1 scrollbar-thin text-left">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="w-5 h-5 text-neutral-300 mb-1" />
                      <p className="text-[11px] font-bold text-neutral-700">Need Custom Adjustments?</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Introduce your stack requirements to start customization.</p>
                    </div>
                  ) : (
                    chatHistory.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`max-w-[85%] rounded-2xl p-3 text-[12px] leading-relaxed transition-all duration-300 ${
                          chat.sender === 'user' 
                            ? 'bg-neutral-900 text-white ml-auto rounded-tr-none' 
                            : 'bg-neutral-50 text-neutral-800 border border-neutral-150 rounded-tl-none'
                        }`}
                      >
                        {chat.text}
                      </div>
                    ))
                  )}
                  {isSending && (
                    <div className="max-w-[85%] rounded-2xl p-3 text-[12px] bg-neutral-50 text-neutral-400 border border-neutral-150 rounded-tl-none animate-pulse">
                      typing...
                    </div>
                  )}
                </div>

                {/* Live suggestion chips inside Chat */}
                {chatHistory.length === 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {[
                      'Can we integrate HubSpot?',
                      'What is the token cost?',
                      'Can we deploy this in 5 days?'
                    ].map(chip => (
                      <button
                        key={chip}
                        onClick={() => setChatMessage(chip)}
                        className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 rounded-full px-2 py-1 transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center space-x-1.5 mt-3 pt-3 border-t border-neutral-100">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about custom deployment..."
                    className="flex-1 bg-neutral-50 border border-neutral-150 rounded-xl px-3 py-2 text-[11px] text-neutral-800 focus:outline-none focus:border-neutral-400"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all duration-200"
                    disabled={isSending}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleSecureBlueprint}
                  disabled={isSecuring || secured}
                  className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl text-[13px] font-semibold transition-[background-color,transform,box-shadow] duration-200 active:scale-[0.96] cursor-pointer shadow-md ${
                    secured 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-none' 
                      : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white'
                  }`}
                >
                  {isSecuring ? (
                    <>
                      <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                      <span>Securing Blueprint...</span>
                    </>
                  ) : secured ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Blueprint Secured 🔒</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span>Secure Solution Blueprint</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-2 tracking-normal leading-normal">
                  Guaranteed compliance. Verified code. Escrow support.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
