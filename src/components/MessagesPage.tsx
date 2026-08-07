import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  Send, Search, Plus, Paperclip, Check, CheckCheck, MoreVertical, 
  Trash2, Edit2, ExternalLink, Image as ImageIcon, FileText, X, 
  Sparkles, Shield, User, MessageSquare, ArrowLeft, Clock, Phone, Video
} from 'lucide-react';

interface ParticipantInfo {
  name: string;
  avatar: string;
  role?: string;
  isCreator?: boolean;
}

interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    [uid: string]: ParticipantInfo;
  };
  lastMessage?: string;
  updatedAt?: any;
  unreadCount?: { [uid: string]: number };
  automationId?: string;
  automationName?: string;
  automationPrice?: string;
  projectId?: string;
  contextType?: 'automation' | 'project' | 'general';
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: any;
  readAt?: any;
  deletedAt?: any;
  isEdited?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface MessagesPageProps {
  initialCreatorName?: string;
  onOpenAutomation?: (id: string) => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function MessagesPage({ initialCreatorName, onOpenAutomation }: MessagesPageProps) {
  const currentUserId = auth.currentUser?.uid || 'user_local_demo';
  const currentUserName = auth.currentUser?.displayName || 'You';
  const currentUserAvatar = auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unread' | 'creators' | 'businesses'>('all');
  const [inputText, setInputText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTargetName, setNewChatTargetName] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; url: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [profileModalUser, setProfileModalUser] = useState<ParticipantInfo | null>(null);
  const [isMobileShowChat, setIsMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Realtime Conversations Listener
  useEffect(() => {
    setLoadingConversations(true);
    const q = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Conversation;
        if (!data.participantIds || data.participantIds.includes(currentUserId) || currentUserId === 'user_local_demo') {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setConversations(list);
      setLoadingConversations(false);
      setErrorState(null);

      if (initialCreatorName && list.length > 0 && !activeConversationId) {
        const found = list.find(c => 
          Object.values(c.participants || {}).some(p => p.name.toLowerCase().includes(initialCreatorName.toLowerCase()))
        );
        if (found) {
          setActiveConversationId(found.id);
          setIsMobileShowChat(true);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
      setErrorState("Messages couldn't be loaded.");
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUserId, initialCreatorName]);

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

      msgList.forEach(async (msg) => {
        if (msg.senderId !== currentUserId && (!msg.readAt)) {
          try {
            await updateDoc(doc(db, 'conversations', activeConversationId, 'messages', msg.id), {
              readAt: new Date().toISOString()
            });
          } catch (e) {
            // ignore
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `conversations/${activeConversationId}/messages`);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeConversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipantEntry = activeConversation ? Object.entries(activeConversation.participants || {}).find(([id]) => id !== currentUserId) : null;
  const defaultOtherParticipant: ParticipantInfo = { name: 'Flowmint Member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150', role: 'Verified Creator', isCreator: true };
  const otherParticipant: ParticipantInfo = otherParticipantEntry ? (otherParticipantEntry[1] as ParticipantInfo) : defaultOtherParticipant;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedAttachment) || !activeConversationId) return;

    const contentText = inputText.trim();
    const attachment = selectedAttachment;
    setInputText('');
    setSelectedAttachment(null);

    const tempId = 'msg_' + Date.now();
    const nowIso = new Date().toISOString();

    const newMessagePayload: Message = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: contentText || (attachment ? `Sent attachment: ${attachment.name}` : ''),
      createdAt: nowIso,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name
    };

    setMessages(prev => [...prev, newMessagePayload]);

    try {
      await setDoc(doc(db, 'conversations', activeConversationId, 'messages', tempId), {
        conversationId: activeConversationId,
        senderId: currentUserId,
        senderName: currentUserName,
        content: newMessagePayload.content,
        createdAt: nowIso,
        attachmentUrl: attachment?.url || null,
        attachmentName: attachment?.name || null
      });

      await updateDoc(doc(db, 'conversations', activeConversationId), {
        lastMessage: newMessagePayload.content,
        updatedAt: nowIso
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${activeConversationId}/messages`);
      alert("Message couldn't be sent. Try again.");
    }
  };

  const handleStartNewChat = async (targetName: string, automationName?: string, automationId?: string) => {
    if (!targetName.trim()) return;

    const convId = 'conv_' + Date.now();
    const nowIso = new Date().toISOString();
    const targetId = 'user_' + targetName.toLowerCase().replace(/\s+/g, '_');

    const newConv: Record<string, any> = {
      id: convId,
      participantIds: [currentUserId, targetId],
      participants: {
        [currentUserId]: { name: currentUserName, avatar: currentUserAvatar, role: 'Business', isCreator: false },
        [targetId]: { name: targetName, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150', role: 'Creator', isCreator: true }
      },
      lastMessage: automationName ? `Inquiry regarding ${automationName}` : 'Started new conversation',
      updatedAt: nowIso,
      contextType: automationId ? 'automation' : 'general'
    };
    if (automationId) newConv.automationId = automationId;
    if (automationName) newConv.automationName = automationName;

    try {
      await setDoc(doc(db, 'conversations', convId), newConv);
      const initialMsgId = 'msg_' + Date.now();
      await setDoc(doc(db, 'conversations', convId, 'messages', initialMsgId), {
        conversationId: convId,
        senderId: currentUserId,
        senderName: currentUserName,
        content: automationName ? `Hi ${targetName}, I'm interested in deploying your automation "${automationName}". Let's discuss details.` : `Hi ${targetName}, let's connect!`,
        createdAt: nowIso
      });

      setActiveConversationId(convId);
      setIsNewChatModalOpen(false);
      setNewChatTargetName('');
      setIsMobileShowChat(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${convId}`);
      alert("Could not create conversation.");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!activeConversationId) return;
    try {
      await updateDoc(doc(db, 'conversations', activeConversationId, 'messages', msgId), {
        deletedAt: new Date().toISOString(),
        content: 'Message deleted'
      });
    } catch (error) {
      alert("Could not delete message.");
    }
  };

  const handleSaveEditMessage = async (msgId: string) => {
    if (!activeConversationId || !editText.trim()) return;
    try {
      await updateDoc(doc(db, 'conversations', activeConversationId, 'messages', msgId), {
        content: editText.trim(),
        isEdited: true
      });
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      alert("Could not update message.");
    }
  };

  const filteredConversations = conversations.filter(c => {
    const otherEntry = Object.entries(c.participants || {}).find(([id]) => id !== currentUserId);
    const other = otherEntry ? (otherEntry[1] as ParticipantInfo) : null;
    const otherName = other ? other.name : '';
    const matchSearch = otherName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (c.automationName && c.automationName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (activeTabFilter === 'unread') {
      return (c.unreadCount?.[currentUserId] || 0) > 0;
    }
    if (activeTabFilter === 'creators') {
      return other && other.isCreator;
    }
    if (activeTabFilter === 'businesses') {
      return other && !other.isCreator;
    }
    return true;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex h-[720px] shadow-sm text-left relative animate-fadeIn font-sans">
      
      {/* 1. SIDEBAR: Conversation List */}
      <div className={`w-full md:w-[340px] border-r border-neutral-200/90 flex flex-col justify-between shrink-0 bg-white ${isMobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-neutral-950 font-sans">Messages</h3>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, creators..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50/80 border border-neutral-200/80 rounded-xl text-xs outline-none text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pt-1">
            {(['all', 'unread', 'creators', 'businesses'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                  activeTabFilter === tab 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-neutral-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Your inbox is quiet.</h4>
              <p className="text-[11px] text-neutral-500">When businesses or creators contact you, conversations will appear here.</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-2 px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Start a Conversation
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherEntry = Object.entries(conv.participants || {}).find(([id]) => id !== currentUserId);
              const other = otherEntry ? (otherEntry[1] as ParticipantInfo) : { name: 'Member', avatar: '' };
              const isActive = conv.id === activeConversationId;
              const unread = conv.unreadCount?.[currentUserId] || 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setIsMobileShowChat(true);
                  }}
                  className={`flex items-start space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'hover:bg-neutral-50 text-neutral-900'
                  }`}
                >
                  <img 
                    src={other.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"} 
                    alt={other.name} 
                    className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-neutral-900'}`}>{other.name}</h4>
                      {unread > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 font-medium ${isActive ? 'text-blue-100' : 'text-neutral-500'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.automationName && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${isActive ? 'bg-blue-700 text-blue-100' : 'bg-blue-50 text-blue-700'}`}>
                        ⚡ {conv.automationName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 text-[10px] text-neutral-400 font-bold text-center">
          Flowmint Secure Marketplace Messaging
        </div>
      </div>

      {/* 2. MAIN CHAT PANEL */}
      <div className={`flex-1 flex flex-col bg-neutral-50/20 relative ${isMobileShowChat ? 'flex' : 'hidden md:flex'}`}>
        
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-extrabold text-neutral-950 font-sans">Select a conversation</h3>
              <p className="text-xs text-neutral-500">Choose a conversation from the left sidebar to continue the discussion or inspect automation context.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-3.5 bg-white border-b border-neutral-200/90 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsMobileShowChat(false)}
                  className="p-1 -ml-1 mr-1 hover:bg-neutral-100 rounded-xl md:hidden text-neutral-600 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img 
                  src={otherParticipant.avatar} 
                  alt={otherParticipant.name} 
                  onClick={() => setProfileModalUser(otherParticipant)}
                  className="w-9 h-9 rounded-full object-cover border border-neutral-200 cursor-pointer hover:opacity-90 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 
                    onClick={() => setProfileModalUser(otherParticipant)}
                    className="text-xs font-bold text-neutral-950 font-sans leading-none cursor-pointer hover:underline"
                  >
                    {otherParticipant.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    {otherParticipant.role || 'Creator · Verified'} · Online
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => alert("Starting secure audio/video call...")}
                  className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={() => alert("Dialing...")}
                  className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                  title="Phone Call"
                >
                  <Phone className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {activeConversation?.automationName && (
              <div className="mx-6 mt-4 p-3.5 bg-white border border-blue-100 rounded-2xl shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-950">{activeConversation.automationName}</h5>
                    <p className="text-[10px] text-neutral-500 font-medium">Flowmint Marketplace Automation</p>
                  </div>
                </div>
                {activeConversation.automationId && onOpenAutomation && (
                  <button
                    onClick={() => onOpenAutomation(activeConversation.automationId!)}
                    className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                  >
                    <span>View automation</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className={`flex ${n % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                      <div className="w-48 h-10 bg-neutral-200 rounded-2xl"></div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs font-medium">
                  No messages yet. Send a message to start the collaboration.
                </div>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.senderId === currentUserId;
                  const isDeleted = Boolean(msg.deletedAt);

                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group animate-fadeIn`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm relative ${
                        isOwn 
                          ? 'bg-blue-600 text-white rounded-br-xs' 
                          : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-bl-xs'
                      }`}>
                        {editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-2 py-1 bg-white text-neutral-900 rounded text-xs outline-none"
                            />
                            <div className="flex justify-end space-x-1">
                              <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-[10px]">Cancel</button>
                              <button onClick={() => handleSaveEditMessage(msg.id)} className="px-2 py-0.5 bg-neutral-900 text-white rounded text-[10px]">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={isDeleted ? 'italic text-neutral-400' : ''}>{msg.content}</p>
                            {msg.attachmentName && (
                              <div className="mt-2 p-2 bg-black/10 rounded-xl flex items-center space-x-2 text-[11px]">
                                <FileText className="w-4 h-4" />
                                <span className="underline font-semibold">{msg.attachmentName}</span>
                              </div>
                            )}
                          </>
                        )}

                        {isOwn && !isDeleted && editingMessageId !== msg.id && (
                          <div className="absolute right-2 -bottom-6 hidden group-hover:flex items-center space-x-1 bg-white border border-neutral-200 rounded-lg shadow-sm px-1.5 py-0.5 text-neutral-700 z-10">
                            <button 
                              onClick={() => { setEditingMessageId(msg.id); setEditText(msg.content); }}
                              className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3 text-neutral-500" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-neutral-400 font-semibold">
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.isEdited && <span className="italic">(edited)</span>}
                        {isOwn && (
                          <span>{msg.readAt ? '✓✓ Read' : '✓ Sent'}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200/90 shrink-0 space-y-2">
              {selectedAttachment && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 rounded-xl text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-neutral-800 truncate max-w-xs">{selectedAttachment.name}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedAttachment(null)} className="text-neutral-400 hover:text-neutral-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <label className="p-2.5 hover:bg-neutral-100 text-neutral-500 rounded-xl cursor-pointer transition-colors">
                  <Paperclip className="w-4.5 h-4.5" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setSelectedAttachment({ name: file.name, url: URL.createObjectURL(file) });
                      }
                    }}
                  />
                </label>

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
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-xs outline-none text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-blue-500 transition-all"
                />

                <button 
                  type="submit"
                  disabled={!inputText.trim() && !selectedAttachment}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white rounded-2xl transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* 3. NEW CHAT MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-neutral-200 animate-fadeIn text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-neutral-950">Start New Message</h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-xl text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-700">Creator or Member Name</label>
              <input 
                type="text" 
                value={newChatTargetName}
                onChange={(e) => setNewChatTargetName(e.target.value)}
                placeholder="e.g. Northbeam Studio, Fielded, Ledger Labs..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none text-neutral-900 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStartNewChat(newChatTargetName)}
                disabled={!newChatTargetName.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFILE QUICK VIEW MODAL */}
      {profileModalUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-neutral-200 animate-fadeIn text-center relative">
            <button onClick={() => setProfileModalUser(null)} className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-xl text-neutral-500">
              <X className="w-5 h-5" />
            </button>
            <img 
              src={profileModalUser.avatar} 
              alt={profileModalUser.name} 
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-blue-600 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-neutral-950">{profileModalUser.name}</h4>
              <p className="text-xs font-bold text-blue-600">{profileModalUser.role || 'Verified Creator'}</p>
              <p className="text-[11px] text-neutral-500 px-4 pt-1">Flowmint Verified AI Automation Creator and Software Partner.</p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setProfileModalUser(null)}
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
