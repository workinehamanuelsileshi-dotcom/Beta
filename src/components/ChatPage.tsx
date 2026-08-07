import React, { useState, useRef, useEffect } from 'react';
import { FlowDB } from '../lib/database';
import { 
  Send, FileText, CheckCircle2, DollarSign, Calendar, MapPin, Phone, Video, 
  Paperclip, Mic, Sparkles, Check, Play, Square, Pause, Plus, Info, Clock, ExternalLink 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'creator';
  text: string;
  time: string;
  isVoice?: boolean;
  isProposal?: boolean;
  proposalDetails?: {
    title: string;
    price: string;
    timeframe: string;
    milestones: string[];
  };
}

interface ChatPageProps {
  initialCreatorName?: string;
}

export default function ChatPage({ initialCreatorName }: ChatPageProps) {
  const [activeChatName, setActiveChatName] = useState(initialCreatorName || 'FlowGenius');
  const [inputText, setInputText] = useState('');
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  // Soundwave mock playback
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const userProfile = FlowDB.getItem<any>('USER_PROFILE', null);
    const userName = userProfile?.name || 'there';
    setMessages([
      { id: '1', sender: 'creator', text: `Hi ${userName}! I reviewed your Business DNA. It looks like you are looking to sync billing data and automate invoice processing. Is that correct?`, time: '10:24 AM' },
      { id: '2', sender: 'user', text: 'Yes, exactly! We currently waste about 18 hours per week manually matching PDF invoices and inputting them into HubSpot & Stripe.', time: '10:26 AM' },
      { id: '3', sender: 'creator', text: 'Perfect. I can deploy our Custom Invoice Parser automation. It extracts text with LLM logic, does custom matching, and runs Stripe transactions.', time: '10:27 AM' },
      { id: '4', sender: 'creator', text: 'Listen to my audio explanation here regarding multi-currency conversions:', time: '10:28 AM' },
      { id: '5', sender: 'creator', text: 'Voice Memo (0:45)', time: '10:28 AM', isVoice: true },
      { id: '6', sender: 'creator', text: 'Here is a custom pipeline configuration proposal for your review:', time: '10:30 AM', isProposal: true, proposalDetails: {
        title: 'Smart Billing & HubSpot CRM Integration Hub',
        price: '$1,850',
        timeframe: '5 Days',
        milestones: [
          'OCR PDF parser node setup',
          'HubSpot dynamic custom property mapping',
          'Stripe webhooks and transaction sync',
          'Testing & post-deployment oversight (7 days)'
        ]
      }}
    ]);
  }, []);

  // Keep scroll pinned
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Video call counter
  useEffect(() => {
    let timer: any;
    if (isVideoCallOpen) {
      timer = setInterval(() => {
        setVideoDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVideoDuration(0);
    }
    return () => clearInterval(timer);
  }, [isVideoCallOpen]);

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Trigger mock creator auto reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'creator',
        text: `Got it! I am updating the milestone board and syncing this to your Project Canvas. Let me know if you approve the proposal!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleVoiceRecord = () => {
    const voiceMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: 'Voice Memo (0:12)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true
    };
    setMessages(prev => [...prev, voiceMsg]);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex h-[620px] shadow-sm text-left relative animate-fadeIn">
      
      {/* LEFT CHATS PANEL (iMessage sidebar) */}
      <div className="w-80 border-r border-neutral-200/90 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-4 border-b border-neutral-50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-950 font-sans">Messages</h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">3 Active</span>
          </div>
          <input 
            type="text" 
            placeholder="Search threads..."
            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs outline-none text-neutral-800 placeholder-neutral-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {[
            { name: 'FlowGenius', desc: 'proposal details and pipeline...', active: activeChatName === 'FlowGenius', unread: false, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80' },
            { name: 'AutomateX', desc: 'OCR pipeline is complete.', active: activeChatName === 'AutomateX', unread: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80' },
            { name: 'SalesBot', desc: 'Can we test Gmail node credentials?', active: activeChatName === 'SalesBot', unread: false, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=80' }
          ].map((chat) => (
            <div
              key={chat.name}
              onClick={() => setActiveChatName(chat.name)}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                chat.active 
                  ? 'bg-neutral-950 text-white' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800'
              }`}
            >
              <img src={chat.avatar} alt={chat.name} className="w-9 h-9 rounded-full object-cover border border-neutral-250 shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold leading-tight">{chat.name}</h4>
                  {chat.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>}
                </div>
                <p className={`text-[10px] truncate mt-0.5 font-medium ${chat.active ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  {chat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-neutral-50 bg-neutral-50/50 text-[10px] text-neutral-400 font-bold text-center">
          Secure end-to-end sandbox chat
        </div>
      </div>

      {/* CENTER CHAT FEED (iMessage bubble feed) */}
      <div className="flex-1 flex flex-col justify-between bg-neutral-50/20 relative">
        
        {/* Chat top info bar with interactive calling buttons */}
        <div className="px-6 py-3.5 bg-white border-b border-neutral-200/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-extrabold text-blue-600 text-xs shadow-inner">
              {activeChatName[0]}
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-950 font-sans leading-none">{activeChatName}</h4>
              <p className="text-[9px] text-neutral-400 font-semibold mt-0.5">● Certified Developer</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsVideoCallOpen(true)}
              className="p-1.5 hover:bg-neutral-50 rounded-xl text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Start high-fidelity mockup call"
            >
              <Video className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => handleSendMessage("Let's jump on a quick phone review!")}
              className="p-1.5 hover:bg-neutral-50 rounded-xl text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <Phone className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Message Bubble Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            
            // Render specialized proposals inline
            if (msg.isProposal && msg.proposalDetails) {
              const det = msg.proposalDetails;
              return (
                <div key={msg.id} className="max-w-md bg-white border border-neutral-250 shadow-sm p-5 rounded-3xl space-y-4 text-left mx-auto my-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Official Proposal</span>
                    <span className="text-xs font-bold text-neutral-950">{det.price}</span>
                  </div>
                  <div>
                    <h5 className="text-[12px] font-extrabold text-neutral-950 leading-snug">{det.title}</h5>
                    <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Estimated timeframe: {det.timeframe}</p>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Milestones</p>
                    {det.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-neutral-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <button 
                      onClick={() => handleSendMessage(`I approve of the ${det.price} invoice integration proposal! Let's build.`)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-[0.96]"
                    >
                      Approve Proposal
                    </button>
                    <button className="px-3 py-2 border border-neutral-200 text-neutral-500 text-[11px] font-bold rounded-xl hover:bg-neutral-50">
                      Decline
                    </button>
                  </div>
                </div>
              );
            }

            // Render audio messages
            if (msg.isVoice) {
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[260px] p-3 rounded-2xl space-y-1.5 shadow-sm text-left flex items-center space-x-3 ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-200 text-neutral-800'
                  }`}>
                    <button 
                      onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                    <div>
                      <span className="text-[10px] font-bold">Voice Memo (0:45)</span>
                      <div className="flex items-center space-x-0.5 mt-1">
                        {[1,2,3,4,3,2,4,5,3,4,2,3,4,5,2,4,3].map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${h * (isPlayingVoice ? 3.5 : 2)}px` }} 
                            className={`w-0.5 rounded-full ${
                              isUser ? 'bg-white' : 'bg-blue-500'
                            } transition-all duration-150`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3.5 rounded-2xl shadow-sm text-left ${
                  isUser 
                    ? 'bg-neutral-950 text-white rounded-br-none' 
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none'
                }`}>
                  <p className="text-[12px] leading-relaxed font-medium">{msg.text}</p>
                  <span className="text-[9px] text-neutral-400 font-bold block mt-1.5 text-right">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Chat Input Bar */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center space-x-3">
          <button 
            onClick={() => handleSendMessage("Let's attach the billing log spreadsheet")}
            className="p-2 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 rounded-xl cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={handleVoiceRecord}
            className="p-2 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 rounded-xl cursor-pointer"
            title="Record audio snippet"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>

          <input 
            type="text"
            placeholder="Type message or paste system requirements..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 text-xs outline-none text-neutral-800 placeholder-neutral-400 focus:ring-2 focus:ring-blue-50 focus:border-blue-500"
          />

          <button 
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-sm cursor-pointer transition-transform duration-100 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL (Deliverables, Milestones, checklist) */}
      <div className="w-80 border-l border-neutral-200 p-5 space-y-5 shrink-0 overflow-y-auto text-left hidden lg:block">
        <div>
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Active Project Canvas</h4>
          <h3 className="text-sm font-extrabold text-neutral-950 mt-1 font-sans">CRM-Stripe Sync</h3>
        </div>

        {/* Pricing Agreement breakdown */}
        <div className="p-4 bg-blue-50/40 border border-blue-100/70 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
            <span>Project Cost</span>
            <span className="text-blue-600 font-extrabold">$1,850 USD</span>
          </div>
          <p className="text-[10px] text-blue-500 font-medium">Split: 50% Upfront, 50% post-delivery verification.</p>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Requirements</h4>
          <div className="space-y-2">
            {[
              { text: 'Parse invoice PDF headers with OpenAI API', checked: true },
              { text: 'Verify customer emails on HubSpot CRM', checked: true },
              { text: 'Initialize corresponding checkout on Stripe', checked: false },
              { text: 'Automated notification loop on Slack', checked: false }
            ].map((req, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] font-medium text-neutral-600">
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  req.checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-300'
                }`}>
                  {req.checked && <Check className="w-2.5 h-2.5" />}
                </span>
                <span>{req.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Files Tab list */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Shared Deliverables</h4>
          <div className="space-y-2">
            {[
              { name: 'billing_raw_schema.csv', size: '14 KB', sender: 'You' },
              { name: 'stripe_sync_diagram.pdf', size: '1.2 MB', sender: 'FlowGenius' }
            ].map((file, idx) => (
              <div key={idx} className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 rounded-xl flex items-center justify-between text-[11px] cursor-pointer group">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-none">{file.name}</p>
                    <p className="text-[9px] text-neutral-400 font-medium mt-1">{file.size} • by {file.sender}</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* VIDEO CALL MODAL / OVERLAY */}
      {isVideoCallOpen && (
        <div className="absolute inset-0 bg-neutral-950/95 z-50 flex flex-col justify-between p-6 animate-fadeIn">
          
          {/* Top header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <p className="text-xs font-bold font-mono tracking-wider">SECURE AI CALL • {formatDuration(videoDuration)}</p>
            </div>
            <button 
              onClick={() => setIsVideoCallOpen(false)}
              className="text-neutral-400 hover:text-white font-bold text-xs bg-white/10 px-3.5 py-1.5 rounded-full cursor-pointer"
            >
              Minimize
            </button>
          </div>

          {/* Large video feeds representation */}
          <div className="flex-1 flex items-center justify-center relative">
            
            {/* Creator stream representation */}
            <div className="w-full max-w-sm h-64 bg-neutral-800 rounded-3xl overflow-hidden border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" 
                alt="FlowGenius" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
              />
              <p className="text-white text-xs font-bold mt-4">FlowGenius (Architect)</p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">Audio connection active</p>
            </div>

            {/* User thumbnail stream representation */}
            <div className="absolute right-4 bottom-4 w-28 h-36 bg-neutral-900 border border-white/20 rounded-2xl overflow-hidden shadow-lg hidden sm:flex flex-col items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" 
                alt="You" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="text-white text-[9px] font-bold mt-2">You</p>
            </div>
          </div>

          {/* Footer call controls */}
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => setIsVideoCallOpen(false)}
              className="w-12 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
              title="Hang up"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
