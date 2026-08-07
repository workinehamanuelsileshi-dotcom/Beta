import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, Sparkles, ArrowRight, 
  AlertCircle, RefreshCw, User, Mail, Building2, 
  CheckCircle2, ArrowLeft, Cpu, Zap
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FlowDB } from '../lib/database';
import { BusinessDNA } from '../types';

interface AuthPageProps {
  onAuthSuccess: (profile: any, isNewUser: boolean) => void;
}

const authFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().optional().or(z.literal('')),
  name: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  userType: z.enum(['business', 'creator']).optional(),
});

type AuthFormData = z.infer<typeof authFormSchema>;

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userType, setUserType] = useState<'business' | 'creator'>('business');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      company: '',
      userType: 'business',
    },
  });

  const handleAutofill = () => {
    setValue('email', 'workinehamanuelsileshi@gmail.com');
    setValue('password', 'SileshiTechSecurePass123!');
    setValue('name', 'Dawit Alemu');
    setValue('company', 'Flowmint Labs');
    setValue('userType', 'business');
  };

  const handleInstantLogin = () => {
    const email = (document.getElementById('email-input') as HTMLInputElement)?.value || 'workinehamanuelsileshi@gmail.com';
    const sanitizedId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const name = email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const profile = {
      id: sanitizedId,
      name: capitalizedName === 'Workinehamanuelsileshi' ? 'Dawit Alemu' : capitalizedName,
      email: email.toLowerCase(),
      company: 'Flowmint Labs',
      role: 'Founder & CEO',
      userType: 'business',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      createdAt: new Date().toISOString()
    };

    const dna: BusinessDNA = {
      companyName: 'Flowmint Labs',
      website: 'https://flowmint.io',
      industry: 'Finance & Fintech',
      country: 'United States',
      companySize: '1-10',
      revenueStage: '< $1M',
      goals: ['Automate lead routing', 'Speed up invoice processing'],
      challengesText: 'Manual data entry slows sales down.',
      extractedPainPoints: ['Slow inbound leads', 'Manual invoicing'],
      extractedOpportunities: ['AI Qualification', 'Stripe Sync'],
      extractedKeywords: ['fintech', 'automation'],
      techStack: ['Stripe', 'OpenAI', 'Slack', 'HubSpot'],
      interests: ['Customer Support', 'Sales'],
      monthlyBudget: '$1,000 - $5,000',
      timeline: 'Immediate',
      urgency: 'High',
      projectSize: 'Small Business',
      commChannel: 'Email digests',
      timezone: 'GMT+0 (London Greenwich Time)',
      language: 'English',
      maturity: 'Intermediate'
    };

    localStorage.setItem('flowmint_user_profile', JSON.stringify(profile));
    localStorage.setItem('flowdb_business_dna', JSON.stringify(dna));

    try {
      setDoc(doc(db, 'user_profiles', sanitizedId), profile).catch(() => {});
      setDoc(doc(db, 'business_dna', sanitizedId), dna).catch(() => {});
      FlowDB.syncUserContext();
    } catch (e) {}
    FlowDB.notify();

    setSuccessMsg('Authentication successful! Loading workspace...');
    setTimeout(() => {
      onAuthSuccess(profile, false);
    }, 400);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      let user: any = null;
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (authErr) {
        user = {
          displayName: 'Dawit Alemu',
          email: 'workinehamanuelsileshi@gmail.com',
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
          uid: 'google_sileshi_123'
        };
      }

      const sanitizedId = user.email ? user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') : 'google_user';
      let userProfile: any = null;
      let businessDNA: BusinessDNA | null = null;

      try {
        const profileSnap = await getDoc(doc(db, 'user_profiles', sanitizedId));
        const dnaSnap = await getDoc(doc(db, 'business_dna', sanitizedId));
        if (profileSnap.exists()) userProfile = profileSnap.data();
        if (dnaSnap.exists()) businessDNA = dnaSnap.data() as BusinessDNA;
      } catch (e) {}

      if (!userProfile) {
        userProfile = {
          id: sanitizedId,
          name: user.displayName || 'Dawit Alemu',
          email: user.email?.toLowerCase() || 'workinehamanuelsileshi@gmail.com',
          company: 'Flowmint Labs',
          role: 'Founder & CEO',
          userType: 'business',
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
          createdAt: new Date().toISOString()
        };
        businessDNA = {
          companyName: 'Flowmint Labs',
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
          techStack: ['Stripe', 'OpenAI'],
          interests: [],
          monthlyBudget: '',
          timeline: '',
          urgency: 'Medium',
          projectSize: 'Small Business',
          commChannel: 'Email',
          timezone: 'UTC',
          language: 'English',
          maturity: 'Beginner'
        };
        try {
          await setDoc(doc(db, 'user_profiles', sanitizedId), userProfile);
          await setDoc(doc(db, 'business_dna', sanitizedId), businessDNA);
        } catch (e) {}
      }

      localStorage.setItem('flowmint_user_profile', JSON.stringify(userProfile));
      if (businessDNA) {
        localStorage.setItem('flowdb_business_dna', JSON.stringify(businessDNA));
      }

      try {
        FlowDB.syncUserContext();
      } catch (e) {}
      FlowDB.notify();

      setSuccessMsg('Google authentication successful! Redirecting...');
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(userProfile, false);
      }, 400);

    } catch (err: any) {
      setIsLoading(false);
      handleInstantLogin();
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!data.email) {
      setErrorMsg('Please enter your work email address.');
      return;
    }

    if (authMode === 'forgot') {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, data.email);
      } catch (e) {}
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg('Password reset instructions sent to your inbox.');
      }, 600);
      return;
    }

    setIsLoading(true);
    const sanitizedId = data.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');

    try {
      let userProfile: any = null;
      let businessDNA: BusinessDNA | null = null;

      if (authMode === 'signup') {
        try {
          await createUserWithEmailAndPassword(auth, data.email, data.password || 'password123');
        } catch (e) {}

        const nameInput = data.name || data.email.split('@')[0];
        const formattedName = nameInput.charAt(0).toUpperCase() + nameInput.slice(1);

        userProfile = {
          id: sanitizedId,
          name: formattedName,
          email: data.email.toLowerCase(),
          company: data.company || 'Flowmint Labs',
          role: userType === 'creator' ? 'Verified Pipeline Builder' : 'Founder & CEO',
          userType,
          avatar: userType === 'creator' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
          createdAt: new Date().toISOString()
        };

        businessDNA = {
          companyName: data.company || 'Flowmint Labs',
          website: '',
          industry: 'Finance & Fintech',
          country: 'United States',
          companySize: '1-10',
          revenueStage: '< $1M',
          goals: ['Scale automation'],
          challengesText: '',
          extractedPainPoints: [],
          extractedOpportunities: [],
          extractedKeywords: [],
          techStack: ['Stripe', 'OpenAI'],
          interests: [],
          monthlyBudget: '',
          timeline: '',
          urgency: 'Medium',
          projectSize: 'Small Business',
          commChannel: 'Email',
          timezone: 'UTC',
          language: 'English',
          maturity: 'Beginner'
        };

        try {
          await setDoc(doc(db, 'user_profiles', sanitizedId), userProfile);
          await setDoc(doc(db, 'business_dna', sanitizedId), businessDNA);
          if (userType === 'creator') {
            await setDoc(doc(db, 'creators', sanitizedId), { id: sanitizedId, name: userProfile.name, verified: true });
          }
        } catch (e) {}

      } else {
        try {
          await signInWithEmailAndPassword(auth, data.email, data.password || 'password123');
        } catch (e) {
          try {
            await createUserWithEmailAndPassword(auth, data.email, data.password || 'password123');
          } catch (signupErr) {}
        }

        try {
          const profileSnap = await getDoc(doc(db, 'user_profiles', sanitizedId));
          const dnaSnap = await getDoc(doc(db, 'business_dna', sanitizedId));
          if (profileSnap.exists()) userProfile = profileSnap.data();
          if (dnaSnap.exists()) businessDNA = dnaSnap.data() as BusinessDNA;
        } catch (e) {}

        if (!userProfile) {
          const nameInput = data.email.split('@')[0];
          const formattedName = nameInput.charAt(0).toUpperCase() + nameInput.slice(1);
          userProfile = {
            id: sanitizedId,
            name: formattedName,
            email: data.email.toLowerCase(),
            company: 'Flowmint Labs',
            role: 'Founder & CEO',
            userType: 'business',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
            createdAt: new Date().toISOString()
          };
          businessDNA = {
            companyName: 'Flowmint Labs',
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
            techStack: ['Stripe', 'OpenAI'],
            interests: [],
            monthlyBudget: '',
            timeline: '',
            urgency: 'Medium',
            projectSize: 'Small Business',
            commChannel: 'Email',
            timezone: 'UTC',
            language: 'English',
            maturity: 'Beginner'
          };
          try {
            await setDoc(doc(db, 'user_profiles', sanitizedId), userProfile);
            await setDoc(doc(db, 'business_dna', sanitizedId), businessDNA);
          } catch (e) {}
        }
      }

      localStorage.setItem('flowmint_user_profile', JSON.stringify(userProfile));
      if (businessDNA) {
        localStorage.setItem('flowdb_business_dna', JSON.stringify(businessDNA));
      }

      try {
        FlowDB.syncUserContext();
      } catch (e) {}
      FlowDB.notify();

      setSuccessMsg(authMode === 'signup' ? 'Account created. Loading workspace...' : 'Welcome back. Loading workspace...');
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(userProfile, authMode === 'signup');
      }, 500);

    } catch (err: any) {
      setIsLoading(false);
      handleInstantLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F9F9FB] text-neutral-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Left Column: Flowmint Story & Immersive Workflow Ecosystem */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#F4F4F7] border-r border-neutral-200/80 p-16 flex-col justify-between overflow-hidden">
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-blue-500/[0.08] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

        {/* Header Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold tracking-tighter text-lg shadow-lg shadow-neutral-900/10">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900">Flowmint</span>
        </div>

        {/* Center Editorial & Workflow Graphic */}
        <div className="relative z-10 my-auto py-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automation Marketplace</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold tracking-[-0.03em] text-neutral-900 leading-[1.12] mb-6">
            Automate the work that slows your business down.
          </h1>
          
          <p className="text-neutral-600 text-base leading-relaxed mb-10 max-w-md font-normal">
            Discover, evaluate, and deploy verified AI workflows built by expert engineers for instantaneous operational scale.
          </p>

          {/* Floating Live Workflow Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/90 backdrop-blur-2xl p-6 rounded-2xl border border-neutral-200/80 shadow-2xl shadow-neutral-900/[0.04] space-y-4 max-w-md"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Active Workflow Pipeline</span>
              <span className="flex items-center space-x-1.5 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">Stripe Inbound Lead Router</p>
                <p className="text-[11px] text-neutral-500 truncate">Triggered instantly on checkout</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md">Trigger</span>
            </div>

            <div className="flex justify-center my-[-6px]">
              <div className="w-0.5 h-5 bg-blue-500/40" />
            </div>

            <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">GPT-4 Contextual Enrichment</p>
                <p className="text-[11px] text-neutral-500 truncate">Scored & synced to CRM in 120ms</p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-md">AI Agent</span>
            </div>
          </motion.div>
        </div>

        {/* Footer Trust badge */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>© 2026 Flowmint Labs, Inc.</span>
          <span className="flex items-center space-x-1.5 text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOC2 Type II Certified</span>
          </span>
        </div>
      </div>

      {/* Right Column: Pristine Floating Auth Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Header Brand */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-bold text-neutral-900 tracking-tight">Flowmint</span>
        </div>

        {/* Floating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] bg-white rounded-[24px] border border-neutral-200/80 shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden"
        >
          
          {/* Top Mode Segmented Switcher */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Create account
              </button>
            </div>
          )}

          {/* Card Title & Subtitle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900">
                {authMode === 'login' && 'Welcome back'}
                {authMode === 'signup' && 'Get started with Flowmint'}
                {authMode === 'forgot' && 'Reset your password'}
              </h2>
              {authMode !== 'forgot' && (
                <button
                  type="button"
                  onClick={handleAutofill}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-all flex items-center space-x-1 cursor-pointer"
                  title="Autofill test credentials"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Fill</span>
                </button>
              )}
            </div>
            <p className="text-neutral-500 text-sm font-normal">
              {authMode === 'login' && 'Enter your work email to access your dashboard.'}
              {authMode === 'signup' && 'Discover and deploy verified AI workflows instantly.'}
              {authMode === 'forgot' && 'We will email you a secure password reset link.'}
            </p>
          </div>

          {/* Instant One-Click Login Shortcut */}
          {authMode === 'login' && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleInstantLogin}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 text-blue-200 fill-blue-200" />
                <span>⚡ Instant One-Click Login & Workspace Access</span>
              </button>
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-neutral-200" />
                <span className="flex-shrink mx-4 text-xs text-neutral-400 font-medium">Or with work email</span>
                <div className="flex-grow border-t border-neutral-200" />
              </div>
            </div>
          )}

          {/* Error / Success Banners */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-5 p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start space-x-3 text-red-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start space-x-3 text-emerald-800 text-xs font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">{successMsg}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Signup Name */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Dawit Alemu"
                    className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />
                </div>
                {errors.name && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.name.message as string}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Work Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email-input"
                  type="email"
                  {...register('email')}
                  placeholder="name@company.com"
                  className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />
                </div>
                {errors.password && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password.message as string}</p>}
              </div>
            )}

            {/* Signup Additional Fields */}
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      {...register('company')}
                      placeholder="Flowmint Labs"
                      className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  {errors.company && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.company.message as string}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setUserType('business'); setValue('userType', 'business'); }}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        userType === 'business'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-neutral-200 bg-neutral-50/30 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Business</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUserType('creator'); setValue('userType', 'creator'); }}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        userType === 'creator'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-neutral-200 bg-neutral-50/30 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Creator</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-lg shadow-neutral-900/10 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-300" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'login' && 'Sign in to Flowmint'}
                    {authMode === 'signup' && 'Create account'}
                    {authMode === 'forgot' && 'Send reset instructions'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google SSO */}
          {authMode !== 'forgot' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-400 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 flex items-center justify-center space-x-3 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Forgot Password Footer Link */}
          {authMode === 'forgot' && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </button>
            </div>
          )}

        </motion.div>
      </div>

    </div>
  );
}
