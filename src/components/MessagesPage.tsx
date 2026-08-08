import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, 
  onSnapshot, query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  Send, Search, Plus, Check, Shield, MessageSquare, ArrowLeft, 
  Clock, Phone, Video, ExternalLink, AlertTriangle, CreditCard, Lock, CheckCircle2, X
} from 'lucide-react';

export type ConversationStatus = "scoping" | "offer_sent" | "paid_in_escrow" | "delivered" | "approved" | "disputed";

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: { [uid: string]: string };
  participantAvatars: { [uid: string]: string };
  automationId?: string;
  automationTitle?: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: { [uid: string]: number };
}

export interface OfferDetail {
  price: number;
  scope: string;
  timelineDays: number;
  status: "pending" | "accepted" | "declined";
}

export interface Message {
  id: string;
  senderId: string;
  type: "text" | "offer" | "system";
  text?: string;
  content?: string;
  offer?: OfferDetail;
  flagged?: boolean;
  createdAt: any;
  readAt?: any;
  deletedAt?: any;
  isEdited?: boolean;
}

interface MessagesPageProps {
  initialCreatorName?: string;
  initialAutomationId?: string;
  initialAutomationTitle?: string;
  onOpenAutomation?: (id: string) => void;
}

export default function MessagesPage({ 
  initialCreatorName, 
  initialAutomationId, 
  initialAutomationTitle,
  onOpenAutomation 
}: MessagesPageProps) {
  const currentUserId = auth.currentUser?.uid || 'user_business_demo';
  const currentUserName = auth.currentUser?.displayName || 'Acme Corp';
  const currentUserAvatar = auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unread' | 'active' | 'approved'>('all');
  const [inputText, setInputText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTargetName, setNewChatTargetName] = useState('');

  // Offer modal state for creators
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('1499');
  const [offerScope, setOfferScope] = useState('Custom pipeline integration, error handling, and webhook deployment.');
  const [offerTimeline, setOfferTimeline] = useState('5');

  // Stripe Checkout Payment modal state
  const [checkoutOffer, setCheckoutOffer] = useState<{ id: string; offer: OfferDetail } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dispute reason modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle URL search params for direct conversation deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convParam = params.get('conversation');
    if (convParam) {
      setActiveConversationId(convParam);
    }
  }, []);

  // 1. Realtime Conversations Listener
  useEffect(() => {
    setLoadingConversations(true);
    const q = query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Conversation;
        if (!data.participantIds || data.participantIds.includes(currentUserId) || currentUserId === 'user_business_demo') {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setConversations(list);
      setLoadingConversations(false);

      // If initialCreatorName or initialAutomationId is passed and no active conv, auto-open or create
      if ((initialCreatorName || initialAutomationId) && list.length > 0 && !activeConversationId) {
        const found = list.find(c => 
          (initialAutomationId && c.automationId === initialAutomationId) ||
          Object.values(c.participantNames || {}).some(name => name.toLowerCase().includes((initialCreatorName || '').toLowerCase()))
        );
        if (found) {
          setActiveConversationId(found.id);
        }
      }
    }, (error) => {
      console.error("Error loading conversations:", error);
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUserId, initialCreatorName, initialAutomationId]);

  // 2. Realtime Messages Listener for Active Conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const q = query(
      collection(db, 'conversations', activeConversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((docSnap) => {
        msgList.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      setMessages(msgList);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error loading messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipantId = activeConversation?.participantIds?.find(id => id !== currentUserId) || 'creator_expert';
  const otherParticipantName = activeConversation?.participantNames?.[otherParticipantId] || initialCreatorName || 'Expert Creator';
  const otherParticipantAvatar = activeConversation?.participantAvatars?.[otherParticipantId] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150';

  // Off-platform contact detection regex
  const checkOffPlatformContent = (text: string): boolean => {
    const patterns = [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone number
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // email
      /\b(whatsapp|telegram|signal|skype|call me|text me|direct message|dm me|contact me at)\b/i
    ];
    return patterns.some(regex => regex.test(text));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    if (activeConversation?.status === 'approved') {
      alert("This deal is complete. Chat is locked.");
      return;
    }

    const text = inputText.trim();
    setInputText('');

    const isFlagged = checkOffPlatformContent(text);
    const now = serverTimestamp();
    const msgId = 'msg_' + Date.now();

    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', msgId), {
        id: msgId,
        senderId: currentUserId,
        type: 'text',
        text: text,
        flagged: isFlagged,
        createdAt: now
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        lastMessage: text,
        lastMessageAt: now
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Creator sends an offer
  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;

    const priceNum = parseFloat(offerPrice) || 999;
    const daysNum = parseInt(offerTimeline) || 5;
    const msgId = 'msg_' + Date.now();
    const now = serverTimestamp();

    const offerData: OfferDetail = {
      price: priceNum,
      scope: offerScope,
      timelineDays: daysNum,
      status: 'pending'
    };

    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', msgId), {
        id: msgId,
        senderId: currentUserId,
        type: 'offer',
        text: `Proposed Offer: $${priceNum} for ${daysNum} days delivery.`,
        offer: offerData,
        flagged: false,
        createdAt: now
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        status: 'offer_sent',
        lastMessage: `Offer sent: $${priceNum} (${daysNum}d)`,
        lastMessageAt: now
      });

      setIsOfferModalOpen(false);
    } catch (err) {
      console.error("Error sending offer:", err);
    }
  };

  // Business accepts offer & pays via escrow
  const handleAcceptAndPay = async (msgId: string, offer: OfferDetail) => {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      setIsProcessingPayment(false);
      setCheckoutOffer(null);

      const now = serverTimestamp();
      const sysMsgId = 'sys_' + Date.now();

      try {
        // Update offer status in message
        await updateDoc(doc(db, 'conversations', activeConversationId!, 'messages', msgId), {
          'offer.status': 'accepted'
        });

        // Post system message
        await setDoc(doc(db, 'conversations', activeConversationId!, 'messages', sysMsgId), {
          id: sysMsgId,
          senderId: 'system',
          type: 'system',
          text: `🔒 Payment of $${offer.price} received — held securely in Flowmint Escrow until you approve delivery.`,
          flagged: false,
          createdAt: now
        });

        // Update conversation status
        await updateDoc(doc(db, 'conversations', activeConversationId!), {
          status: 'paid_in_escrow',
          lastMessage: `Payment received in escrow ($${offer.price})`,
          lastMessageAt: now
        });
      } catch (err) {
        console.error("Error processing escrow payment:", err);
      }
    }, 1500);
  };

  // Business declines offer
  const handleDeclineOffer = async (msgId: string) => {
    if (!activeConversationId) return;
    const now = serverTimestamp();
    try {
      await updateDoc(doc(db, 'conversations', activeConversationId, 'messages', msgId), {
        'offer.status': 'declined'
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        status: 'scoping',
        lastMessage: 'Offer declined — returned to scoping',
        lastMessageAt: now
      });
    } catch (err) {
      console.error("Error declining offer:", err);
    }
  };

  // Creator marks as delivered
  const handleMarkDelivered = async () => {
    if (!activeConversationId) return;
    const now = serverTimestamp();
    const sysMsgId = 'sys_' + Date.now();
    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', sysMsgId), {
        id: sysMsgId,
        senderId: 'system',
        type: 'system',
        text: `📦 Creator marked this automation pipeline as Delivered. Please review and approve or report an issue.`,
        flagged: false,
        createdAt: now
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        status: 'delivered',
        lastMessage: 'Automation marked as delivered',
        lastMessageAt: now
      });
    } catch (err) {
      console.error("Error marking delivered:", err);
    }
  };

  // Business approves delivery & releases escrow
  const handleApproveDelivery = async () => {
    if (!activeConversationId) return;
    const now = serverTimestamp();
    const sysMsgId = 'sys_' + Date.now();
    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', sysMsgId), {
        id: sysMsgId,
        senderId: 'system',
        type: 'system',
        text: `✅ Delivery approved! Escrowed funds released to creator. Deal completed successfully.`,
        flagged: false,
        createdAt: now
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        status: 'approved',
        lastMessage: 'Delivery approved & funds released',
        lastMessageAt: now
      });
    } catch (err) {
      console.error("Error approving delivery:", err);
    }
  };

  // Report issue / dispute
  const handleReportIssue = async () => {
    if (!activeConversationId || !disputeReason.trim()) return;
    const now = serverTimestamp();
    const sysMsgId = 'sys_' + Date.now();
    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', sysMsgId), {
        id: sysMsgId,
        senderId: 'system',
        type: 'system',
        text: `⚠️ Deal disputed: ${disputeReason}. Under manual review by Flowmint Trust & Safety.`,
        flagged: true,
        createdAt: now
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        status: 'disputed',
        lastMessage: 'Dispute filed — under review',
        lastMessageAt: now
      });
      setIsDisputeModalOpen(false);
      setDisputeReason('');
    } catch (err) {
      console.error("Error reporting issue:", err);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: ConversationStatus) => {
    switch (status) {
      case 'scoping': return <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-bold">Scoping</span>;
      case 'offer_sent': return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">Offer Sent</span>;
      case 'paid_in_escrow': return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">In Escrow 🔒</span>;
      case 'delivered': return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold">Delivered 📦</span>;
      case 'approved': return <span className="px-2 py-0.5 bg-emerald-50 text-[#0F9D67] border border-emerald-200 rounded-full text-[10px] font-extrabold">Approved ✓</span>;
      case 'disputed': return <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold">Disputed ⚠️</span>;
      default: return null;
    }
  };

  const filteredConversations = conversations.filter(c => {
    const title = c.automationTitle || '';
    const otherName = (Object.values(c.participantNames || {}).find(n => n !== currentUserName) as string) || '';
    const match = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!match) return false;

    if (activeTabFilter === 'unread') return (c.unreadCount?.[currentUserId] || 0) > 0;
    if (activeTabFilter === 'active') return c.status !== 'approved' && c.status !== 'disputed';
    if (activeTabFilter === 'approved') return c.status === 'approved';
    return true;
  });

  return (
    <div className="bg-[#F6F7FA] min-h-[750px] rounded-3xl border border-[#E6E9EF] overflow-hidden flex shadow-sm text-left relative font-sans">
      
      {/* 1. LEFT PANEL: Conversation List (320px) */}
      <div className="w-full md:w-[320px] bg-white border-r border-[#E6E9EF] flex flex-col justify-between shrink-0">
        
        <div className="p-4 border-b border-[#E6E9EF] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0B1220]">Messages</h3>
            <span className="text-xs font-bold text-[#68707E]">{conversations.length} deals</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#68707E]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, automation..."
              className="w-full pl-9 pr-3 py-2 bg-[#F6F7FA] border border-[#E6E9EF] rounded-xl text-xs outline-none text-[#0B1220] placeholder-[#68707E] focus:bg-white focus:border-[#2F5FF6]"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pt-1">
            {(['all', 'active', 'approved', 'unread'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                  activeTabFilter === tab ? 'bg-[#0B1220] text-white' : 'bg-[#F6F7FA] hover:bg-[#E6E9EF] text-[#68707E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loadingConversations ? (
            <div className="p-4 space-y-3 animate-pulse">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-3/4" />
                    <div className="h-2.5 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
              <h4 className="text-xs font-bold text-[#0B1220]">No conversations yet</h4>
              <p className="text-[11px] text-[#68707E]">Once you message a creator from a listing, it will show up here.</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConversationId;
              const otherId = conv.participantIds?.find(id => id !== currentUserId) || '';
              const name = conv.participantNames?.[otherId] || 'Creator';
              const avatar = conv.participantAvatars?.[otherId] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-150 flex items-start space-x-3 ${
                    isActive ? 'bg-[#2F5FF6] text-white shadow-sm' : 'hover:bg-[#F6F7FA] text-[#0B1220]'
                  }`}
                >
                  <img 
                    src={avatar} 
                    alt={name} 
                    className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#0B1220]'}`}>{name}</h4>
                      {getStatusBadge(conv.status)}
                    </div>
                    {conv.automationTitle && (
                      <p className={`text-[10px] font-semibold truncate mt-0.5 ${isActive ? 'text-[#EAF0FF]' : 'text-[#2F5FF6]'}`}>
                        ⚡ {conv.automationTitle}
                      </p>
                    )}
                    <p className={`text-[11px] truncate mt-1 ${isActive ? 'text-blue-100' : 'text-[#68707E]'}`}>
                      {conv.lastMessage || 'Started conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-[#E6E9EF] bg-[#F6F7FA] text-[10px] text-[#68707E] font-bold text-center">
          Flowmint Secure Escrow Chat
        </div>
      </div>

      {/* 2. RIGHT PANEL: Active Thread */}
      <div className="flex-1 flex flex-col bg-white relative">
        {!activeConversationId || !activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF0FF] text-[#2F5FF6] flex items-center justify-center shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-extrabold text-[#0B1220]">Select a conversation to start chatting</h3>
              <p className="text-xs text-[#68707E]">Inspect escrow status, milestones, and deliverables in real time.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-3.5 bg-white border-b border-[#E6E9EF] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <img 
                  src={otherParticipantAvatar} 
                  alt={otherParticipantName} 
                  className="w-10 h-10 rounded-full object-cover border border-[#E6E9EF]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#0B1220]">{otherParticipantName}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] text-[#68707E] font-semibold">Verified Creator · Online</span>
                    {getStatusBadge(activeConversation.status)}
                  </div>
                </div>
              </div>

              {/* Creator actions: Send Offer / Mark Delivered */}
              <div className="flex items-center space-x-2">
                {activeConversation.status === 'scoping' && (
                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="px-3.5 py-2 bg-[#2F5FF6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Send Offer</span>
                  </button>
                )}

                {activeConversation.status === 'paid_in_escrow' && (
                  <button
                    onClick={handleMarkDelivered}
                    className="px-3.5 py-2 bg-[#0F9D67] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Delivered</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linked Automation Banner */}
            {activeConversation.automationTitle && (
              <div className="mx-6 mt-4 p-3 bg-[#F6F7FA] border border-[#E6E9EF] rounded-2xl flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2F5FF6] text-white flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#0B1220]">Re: {activeConversation.automationTitle}</h5>
                    <p className="text-[10px] text-[#68707E]">Flowmint Marketplace Automation Pipeline</p>
                  </div>
                </div>
                {activeConversation.automationId && onOpenAutomation && (
                  <button
                    onClick={() => onOpenAutomation(activeConversation.automationId!)}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-[#E6E9EF] text-[#0B1220] text-[11px] font-bold rounded-xl cursor-pointer flex items-center space-x-1 shadow-xs"
                  >
                    <span>View listing</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F6F7FA]/30">
              {loadingMessages ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map(n => (
                    <div key={n} className="w-48 h-10 bg-neutral-200 rounded-xl" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#68707E]">
                  No messages yet. Send a message to start scoping this automation!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === currentUserId;
                  const isSystem = msg.type === 'system';
                  const isOffer = msg.type === 'offer';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl text-xs font-semibold text-center max-w-md shadow-xs">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  if (isOffer && msg.offer) {
                    const offer = msg.offer;
                    const isPending = offer.status === 'pending';

                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <div className="w-full max-w-md bg-white border-2 border-[#2F5FF6] rounded-3xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between border-b border-[#E6E9EF] pb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-[#EAF0FF] text-[#2F5FF6] flex items-center justify-center font-bold">
                                💼
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-[#0B1220]">Professional Services Offer</h4>
                                <p className="text-[10px] text-[#68707E]">Escrow Protected Milestone</p>
                              </div>
                            </div>
                            <span className="text-lg font-black text-[#0B1220] font-mono">${offer.price}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-bold text-[#68707E] text-[10px] uppercase">Scope of Work</span>
                              <p className="text-[#0B1220] font-medium mt-0.5">{offer.scope}</p>
                            </div>
                            <div className="flex items-center space-x-4 pt-1 text-[#68707E]">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-[#2F5FF6]" />
                                <span>Timeline: <strong>{offer.timelineDays} days</strong></span>
                              </span>
                            </div>
                          </div>

                          {/* Action buttons for Business */}
                          {isPending && activeConversation.status === 'offer_sent' && !isOwn ? (
                            <div className="flex items-center space-x-2 pt-2 border-t border-[#E6E9EF]">
                              <button
                                onClick={() => setCheckoutOffer({ id: msg.id, offer })}
                                className="flex-1 py-2.5 bg-[#2F5FF6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Accept & Pay (${offer.price})</span>
                              </button>
                              <button
                                onClick={() => handleDeclineOffer(msg.id)}
                                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-[#E6E9EF] text-center text-xs font-bold text-[#68707E]">
                              Offer Status: <span className="capitalize text-[#2F5FF6]">{offer.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} space-y-1`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        isOwn 
                          ? 'bg-[#2F5FF6] text-white rounded-br-xs' 
                          : 'bg-white text-[#0B1220] border border-[#E6E9EF] rounded-bl-xs'
                      }`}>
                        <p>{msg.text || msg.content}</p>
                      </div>

                      {/* Off-platform contact detection warning strip */}
                      {msg.flagged && (
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[10px] font-bold max-w-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>For your protection, keep this deal on Flowmint until it's complete.</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Delivery Approval Buttons for Business when delivered */}
            {activeConversation.status === 'delivered' && (
              <div className="p-4 bg-indigo-50/70 border-t border-indigo-100 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-indigo-900">Creator has marked this project as delivered.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleApproveDelivery}
                    className="px-4 py-2 bg-[#0F9D67] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Approve & Release Payment ✓
                  </button>
                  <button
                    onClick={() => setIsDisputeModalOpen(true)}
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Report an Issue
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#E6E9EF] flex items-center space-x-2 shrink-0">
              {activeConversation.status === 'approved' ? (
                <div className="w-full py-3 bg-[#F6F7FA] border border-[#E6E9EF] rounded-2xl text-center text-xs font-bold text-[#68707E]">
                  This deal is complete. Chat is locked.
                </div>
              ) : (
                <>
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write a message... (Press Enter to send)"
                    className="flex-1 px-4 py-3 bg-[#F6F7FA] border border-[#E6E9EF] rounded-2xl text-xs outline-none text-[#0B1220] placeholder-[#68707E] focus:bg-white focus:border-[#2F5FF6]"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 bg-[#2F5FF6] hover:bg-blue-700 disabled:bg-neutral-200 text-white rounded-2xl transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </div>

      {/* 3. SEND OFFER MODAL (Creator) */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6E9EF] text-left animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0B1220]">Send Professional Offer</h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-xl text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B1220]">Total Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[#68707E] font-bold text-xs">$</span>
                  <input 
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#F6F7FA] border border-[#E6E9EF] rounded-xl text-xs font-mono font-bold text-[#0B1220] outline-none focus:border-[#2F5FF6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B1220]">Scope Description</label>
                <textarea 
                  value={offerScope}
                  onChange={(e) => setOfferScope(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#F6F7FA] border border-[#E6E9EF] rounded-xl text-xs text-[#0B1220] outline-none focus:border-[#2F5FF6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B1220]">Timeline (Days)</label>
                <input 
                  type="number"
                  value={offerTimeline}
                  onChange={(e) => setOfferTimeline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F7FA] border border-[#E6E9EF] rounded-xl text-xs text-[#0B1220] outline-none focus:border-[#2F5FF6]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2F5FF6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STRIPE CHECKOUT / ESCROW PAYMENT MODAL */}
      {checkoutOffer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E6E9EF] text-left animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2F5FF6] flex items-center justify-center font-bold">
                  🔒
                </div>
                <h3 className="text-base font-extrabold text-[#0B1220]">Flowmint Escrow Checkout</h3>
              </div>
              <button onClick={() => setCheckoutOffer(null)} className="p-1 hover:bg-neutral-100 rounded-xl text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F6F7FA] rounded-2xl border border-[#E6E9EF] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#68707E]">Milestone Amount</span>
                <span className="font-bold text-[#0B1220] font-mono">${checkoutOffer.offer.price} USD</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#68707E]">Escrow Protection Fee</span>
                <span className="font-bold text-[#0F9D67]">FREE (Included)</span>
              </div>
              <div className="pt-2 border-t border-[#E6E9EF] flex justify-between text-sm font-extrabold">
                <span className="text-[#0B1220]">Total Due Today</span>
                <span className="text-[#2F5FF6] font-mono">${checkoutOffer.offer.price} USD</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#0B1220]">Payment Method (Stripe Test Mode)</label>
              <div className="p-3 border border-[#2F5FF6] bg-blue-50/50 rounded-xl flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-[#2F5FF6]" />
                <div className="text-xs">
                  <p className="font-bold text-[#0B1220]">Visa ending in 4242</p>
                  <p className="text-[#68707E]">Expires 12/28 · Secure 256-bit SSL</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCheckoutOffer(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptAndPay(checkoutOffer.id, checkoutOffer.offer)}
                disabled={isProcessingPayment}
                className="px-6 py-2.5 bg-[#2F5FF6] hover:bg-blue-700 disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center space-x-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ${checkoutOffer.offer.price} into Escrow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DISPUTE MODAL */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6E9EF] text-left animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-red-600">Report an Issue / Dispute</h3>
              <button onClick={() => setIsDisputeModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-xl text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#68707E]">
              If the delivery does not meet the agreed scope, you can open a dispute. Funds will remain secured in escrow while Flowmint support reviews the conversation.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B1220]">Reason for dispute</label>
              <textarea 
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe what is missing or incorrect..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-[#F6F7FA] border border-[#E6E9EF] rounded-xl text-xs text-[#0B1220] outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                disabled={!disputeReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-200 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
