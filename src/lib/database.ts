import { Automation, Creator, BusinessDNA } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';

const STORAGE_KEYS = {
  AUTOMATIONS: 'flowdb_automations',
  CREATORS: 'flowdb_creators',
  BUSINESS_DNA: 'flowdb_business_dna',
  BOOKMARKS: 'flowmint_bookmarks',
  LIKES: 'flowmint_likes',
  USER_PROFILE: 'flowmint_user_profile',
  COMPANY_PROFILE: 'flowmint_company_profile',
  GOALS: 'flowmint_goals',
  CHALLENGES: 'flowmint_challenges',
  AUTOMATION_INTERESTS: 'flowmint_automation_interests',
  SOFTWARE_STACK: 'flowmint_software_stack',
  MESSAGES: 'flowmint_messages',
  CREATOR_CHATS: 'flowmint_creator_chats',
  PROJECTS: 'flowmint_projects',
  ORDERS: 'flowmint_orders',
  NOTIFICATIONS: 'flowmint_notifications',
  ACTIVITY_HISTORY: 'flowmint_activity_history',
  SEARCH_HISTORY: 'flowmint_search_history',
  VIEWED_AUTOMATIONS: 'flowmint_viewed_automations',
  RECOMMENDATIONS: 'flowmint_recommendations',
  FAVORITE_CATEGORIES: 'flowmint_favorite_categories',
  FAVORITE_CREATORS: 'flowmint_favorite_creators',
  REVIEWS: 'flowmint_reviews',
  SETTINGS: 'flowmint_settings',
  SUBSCRIPTION: 'flowmint_subscription',
  BILLING: 'flowmint_billing',
  CONNECTED_ACCOUNTS: 'flowmint_connected_accounts',
  ONBOARDING_STATE: 'flowmint_onboarding_state'
};

export class FlowDB {
  private static listeners: Set<() => void> = new Set();
  private static automationsCache: Automation[] = [];
  private static creatorsCache: Creator[] = [];
  private static businessDnaCache: BusinessDNA | null = null;
  private static isListening: boolean = false;
  private static dnaUnsubscribe: (() => void) | null = null;

  private static getUserId(): string {
    try {
      const profileStr = localStorage.getItem('flowmint_user_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile && typeof profile === 'object' && typeof profile.email === 'string') {
          return profile.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        }
      }
    } catch (e) {}
    return 'workinehamanuelsileshi_gmail_com';
  }

  static syncUserContext() {
    if (this.dnaUnsubscribe) {
      this.dnaUnsubscribe();
      this.dnaUnsubscribe = null;
    }

    const userId = this.getUserId();
    this.dnaUnsubscribe = onSnapshot(doc(db, 'business_dna', userId), (docSnap) => {
      if (docSnap.exists()) {
        const dna = docSnap.data() as BusinessDNA;
        this.businessDnaCache = dna;
        localStorage.setItem(STORAGE_KEYS.BUSINESS_DNA, JSON.stringify(dna));
        this.notify();
      }
    }, (error) => {
      console.warn("Firestore business DNA listener error: ", error);
    });
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  static notify() {
    this.listeners.forEach(listener => listener());
    window.dispatchEvent(new CustomEvent('flowdb-sync'));
  }

  // Auto-initialize tables and set up real-time Firebase listeners
  static initialize() {
    if (this.isListening) return;
    this.isListening = true;

    // Local Storage Initial Fallback Seeding (Clean zero mock state)
    const existingAutos = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
    if (!existingAutos || existingAutos.includes('Real Estate Multi-Platform')) {
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify([]));
    }
    const existingCreators = localStorage.getItem(STORAGE_KEYS.CREATORS);
    if (!existingCreators || existingCreators.includes('FlowGenius')) {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_DNA)) {
      const defaultDNA: BusinessDNA = {
        companyName: 'Flowmint Labs',
        website: 'flowmint.io',
        industry: 'SaaS & Tech',
        subIndustry: 'AI Automation Solutions',
        companySize: '10-50',
        country: 'United States',
        primaryGoal: 'Save Time & Reduce Costs',
        revenueStage: '$1M - $5M',
        growthStage: 'Scaling',
        automationScore: 68,
        aiReadiness: 72,
        digitalMaturity: 'Intermediate',
        techStack: ['HubSpot', 'Slack', 'OpenAI', 'Airtable'],
        painPoints: ['Manual customer support syncing', 'Lead transfer latency'],
        preferredCategories: ['AI Agents', 'Operations'],
        estimatedROI: '320%',
        recommendedCollections: ['AI Acceleration Suite', 'Finance ledger automations'],
        preferredBudget: '$2,000/mo',
        preferredCreatorType: 'Expert Agency',
        preferredTimeline: '2-4 weeks',
        businessPersonality: 'Efficient & Technology-Driven',
        goals: ['Reduce customer response times', 'Enrich outbound lead pipeline', 'Sync billing data to books'],
        maturity: 'Intermediate'
      };
      localStorage.setItem(STORAGE_KEYS.BUSINESS_DNA, JSON.stringify(defaultDNA));
    }

    // Set up real-time Firestore listeners to synchronize DB and notify React app instantly
    onSnapshot(collection(db, 'automations'), (snapshot) => {
      const list: Automation[] = [];
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const aut = docSnap.data() as Automation;
          list.push(aut);
        });
      }

      // If empty, seed default published marketplace automations matching prompt specification
      if (list.length === 0) {
        const defaultPublished: Automation[] = [
          {
            id: 'aut_1',
            name: 'AI Lead Qualifier & Scoring Agent',
            problemSolved: 'Automatically qualify inbound leads via AI and sync scores to HubSpot and Slack.',
            valueProp: 'Instant AI qualification and CRM enrichment',
            roi: '340% ROI',
            hoursSaved: 42,
            monthlyCostReduction: 3800,
            industry: 'SaaS & Tech',
            category: 'Sales',
            platforms: ['HubSpot', 'Slack', 'OpenAI'],
            difficulty: 'Intermediate',
            implementationTime: '15 mins',
            price: '$149',
            creatorId: 'Northbeam Studio',
            workflow: [
              { id: '1', label: 'Webhook Ingest', purpose: 'Receive leads', tool: 'Webhook', outcome: 'Data parsed', timeEstimate: '1s' },
              { id: '2', label: 'AI Score Agent', purpose: 'Evaluate lead intent', tool: 'OpenAI', outcome: 'Score assigned', timeEstimate: '2s' },
              { id: '3', label: 'CRM Sync', purpose: 'Update HubSpot', tool: 'HubSpot', outcome: 'Lead updated', timeEstimate: '1s' },
              { id: '4', label: 'Slack Alert', purpose: 'Notify reps', tool: 'Slack', outcome: 'Team pinged', timeEstimate: '<1s' }
            ],
            likesCount: 312,
            status: 'published'
          },
          {
            id: 'aut_2',
            name: 'AI Ticket Triage & Smart Routing',
            problemSolved: 'Instantly categorize incoming customer tickets and assign to the right support engineer.',
            valueProp: 'Smart ticket triage and routing',
            roi: '290% ROI',
            hoursSaved: 38,
            monthlyCostReduction: 4200,
            industry: 'SaaS & Tech',
            category: 'Customer Support',
            platforms: ['Zendesk', 'OpenAI', 'Slack'],
            difficulty: 'Intermediate',
            implementationTime: '20 mins',
            price: '$249',
            creatorId: 'Fielded',
            workflow: [
              { id: '1', label: 'Zendesk Ingest', purpose: 'Capture tickets', tool: 'Zendesk', outcome: 'Ticket read', timeEstimate: '1s' },
              { id: '2', label: 'AI Triage', purpose: 'Classify priority', tool: 'OpenAI', outcome: 'Priority set', timeEstimate: '2s' },
              { id: '3', label: 'Slack Dispatch', purpose: 'Assign engineer', tool: 'Slack', outcome: 'Notified', timeEstimate: '1s' }
            ],
            likesCount: 512,
            status: 'published'
          },
          {
            id: 'aut_3',
            name: 'Invoice Reconciliation Agent',
            problemSolved: 'Match Stripe payouts with QuickBooks invoices automatically without manual accounting entry.',
            valueProp: 'Automate Stripe & QuickBooks matching',
            roi: '410% ROI',
            hoursSaved: 50,
            monthlyCostReduction: 3100,
            industry: 'Finance & Fintech',
            category: 'Finance',
            platforms: ['Stripe', 'QuickBooks', 'Slack'],
            difficulty: 'Advanced',
            implementationTime: '30 mins',
            price: '$199',
            creatorId: 'Ledger Labs',
            workflow: [
              { id: '1', label: 'Stripe Payout', purpose: 'Fetch payouts', tool: 'Stripe', outcome: 'Data loaded', timeEstimate: '1s' },
              { id: '2', label: 'QuickBooks Match', purpose: 'Reconcile ledger', tool: 'QuickBooks', outcome: 'Matched', timeEstimate: '2s' }
            ],
            likesCount: 248,
            status: 'published'
          },
          {
            id: 'aut_4',
            name: 'AI Content Repurposing Engine',
            problemSolved: 'Turn long-form Notion docs into engaging multi-channel social posts.',
            valueProp: 'Turn Notion into social campaigns',
            roi: '280% ROI',
            hoursSaved: 35,
            monthlyCostReduction: 2500,
            industry: 'SaaS & Tech',
            category: 'Marketing',
            platforms: ['Notion', 'OpenAI', 'Twitter'],
            difficulty: 'Beginner',
            implementationTime: '10 mins',
            price: '$179',
            creatorId: 'ContentFlow',
            workflow: [
              { id: '1', label: 'Notion Sync', purpose: 'Read doc', tool: 'Notion', outcome: 'Loaded', timeEstimate: '1s' },
              { id: '2', label: 'AI Rewriter', purpose: 'Draft posts', tool: 'OpenAI', outcome: 'Generated', timeEstimate: '3s' }
            ],
            likesCount: 392,
            status: 'published'
          },
          {
            id: 'aut_5',
            name: 'Onboarding & Offboarding Automator',
            problemSolved: 'Provision new hire accounts, assign Jira tickets, and welcome in Slack automatically.',
            valueProp: 'Streamline HR employee lifecycle',
            roi: '320% ROI',
            hoursSaved: 40,
            monthlyCostReduction: 2900,
            industry: 'SaaS & Tech',
            category: 'HR',
            platforms: ['Google Workspace', 'Jira', 'Slack'],
            difficulty: 'Intermediate',
            implementationTime: '20 mins',
            price: '$159',
            creatorId: 'OpsPilot',
            workflow: [
              { id: '1', label: 'Google Setup', purpose: 'Create account', tool: 'Google Workspace', outcome: 'Active', timeEstimate: '2s' },
              { id: '2', label: 'Jira Tickets', purpose: 'Assign onboarding', tool: 'Jira', outcome: 'Assigned', timeEstimate: '1s' }
            ],
            likesCount: 284,
            status: 'published'
          },
          {
            id: 'aut_6',
            name: 'CRM Data Enrichment Agent',
            problemSolved: 'Enrich incoming company leads with real-time firmographic data and AI scoring.',
            valueProp: 'Real-time firmographic lead enrichment',
            roi: '390% ROI',
            hoursSaved: 45,
            monthlyCostReduction: 4800,
            industry: 'SaaS & Tech',
            category: 'Sales',
            platforms: ['HubSpot', 'OpenAI', 'Airtable'],
            difficulty: 'Intermediate',
            implementationTime: '15 mins',
            price: '$229',
            creatorId: 'DataPilot',
            workflow: [
              { id: '1', label: 'HubSpot Lead', purpose: 'New contact', tool: 'HubSpot', outcome: 'Captured', timeEstimate: '1s' },
              { id: '2', label: 'AI Enrichment', purpose: 'Lookup data', tool: 'OpenAI', outcome: 'Enriched', timeEstimate: '2s' }
            ],
            likesCount: 426,
            status: 'published'
          },
          {
            id: 'aut_7',
            name: 'AI Customer Support Copilot',
            problemSolved: 'Draft context-aware replies for tier-1 support requests with AI verification.',
            valueProp: 'AI-assisted support ticket replies',
            roi: '360% ROI',
            hoursSaved: 48,
            monthlyCostReduction: 5100,
            industry: 'SaaS & Tech',
            category: 'Customer Support',
            platforms: ['Zendesk', 'OpenAI', 'Slack'],
            difficulty: 'Intermediate',
            implementationTime: '20 mins',
            price: '$249',
            creatorId: 'HelpGenie',
            workflow: [
              { id: '1', label: 'Ticket Ingest', purpose: 'Read issue', tool: 'Zendesk', outcome: 'Loaded', timeEstimate: '1s' },
              { id: '2', label: 'AI Draft', purpose: 'Generate reply', tool: 'OpenAI', outcome: 'Drafted', timeEstimate: '2s' }
            ],
            likesCount: 548,
            status: 'published'
          },
          {
            id: 'aut_8',
            name: 'Expense Approval Automator',
            problemSolved: 'Route employee expense reports for manager approval and ledger logging.',
            valueProp: 'Automated multi-tier expense routing',
            roi: '300% ROI',
            hoursSaved: 30,
            monthlyCostReduction: 2200,
            industry: 'Finance & Fintech',
            category: 'Finance',
            platforms: ['Stripe', 'Slack', 'Google Workspace'],
            difficulty: 'Beginner',
            implementationTime: '10 mins',
            price: '$129',
            creatorId: 'FinanceFlow',
            workflow: [
              { id: '1', label: 'Expense Submit', purpose: 'New report', tool: 'Stripe', outcome: 'Received', timeEstimate: '1s' },
              { id: '2', label: 'Manager Slack', purpose: 'Approve', tool: 'Slack', outcome: 'Approved', timeEstimate: '1s' }
            ],
            likesCount: 192,
            status: 'published'
          }
        ];
        list.push(...defaultPublished);
        defaultPublished.forEach(aut => {
          setDoc(doc(db, 'automations', aut.id), aut).catch(() => {});
        });
      }

      // Sort newest first (custom IDs with timestamps float to top)
      list.sort((a, b) => {
        const timeA = a.id.startsWith('aut_custom_') ? parseInt(a.id.replace('aut_custom_', ''), 10) || 0 : 0;
        const timeB = b.id.startsWith('aut_custom_') ? parseInt(b.id.replace('aut_custom_', ''), 10) || 0 : 0;
        return timeB - timeA;
      });
      this.automationsCache = list;
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(list));
      this.notify();
    }, (error) => {
      console.warn("Firestore automations listener error: ", error);
    });

    onSnapshot(collection(db, 'creators'), (snapshot) => {
      const list: Creator[] = [];
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const creator = docSnap.data() as Creator;
          const isMock = [
            'FlowGenius',
            'Northbeam Studio',
            'Ledger Labs',
            'ContentFlow',
            'OpsPilot',
            'DataPilot',
            'HelpGenie',
            'FinanceFlow'
          ].some(name => creator.name?.includes(name));

          if (!isMock) {
            list.push(creator);
          } else {
            deleteDoc(doc(db, 'creators', docSnap.id)).catch(() => {});
          }
        });
      }
      this.creatorsCache = list;
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(list));
      this.notify();
    }, (error) => {
      console.warn("Firestore creators listener error: ", error);
    });

    // Track user's specific Business DNA profile dynamically
    this.syncUserContext();
  }



  // --- GENERAL GET/SET UTILITY FOR EXTENDED LOCAL DATA ---
  static getItem<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : defaultValue;
  }

  static setItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    this.notify();
  }

  // --- AUTOMATIONS CRUD ---
  static getAutomations(): Automation[] {
    this.initialize();
    let list = this.automationsCache;
    if (list.length === 0) {
      const data = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
      list = data ? JSON.parse(data) : [];
    }
    return [...list].sort((a, b) => {
      const timeA = a.id.startsWith('aut_custom_') ? parseInt(a.id.replace('aut_custom_', ''), 10) || 0 : 0;
      const timeB = b.id.startsWith('aut_custom_') ? parseInt(b.id.replace('aut_custom_', ''), 10) || 0 : 0;
      return timeB - timeA;
    });
  }

  static getAutomationById(id: string): Automation | undefined {
    return this.getAutomations().find(aut => aut.id === id);
  }

  static async addAutomation(automation: Omit<Automation, 'id' | 'likesCount'>): Promise<Automation> {
    const newId = `aut_custom_${Date.now()}`;
    const newAutomation: Automation = {
      ...automation,
      id: newId,
      likesCount: 0
    };
    
    // Add to cache immediately for fast UI feedback
    this.automationsCache = [newAutomation, ...this.automationsCache];
    this.notify();

    try {
      await setDoc(doc(db, 'automations', newId), newAutomation);
    } catch (err) {
      console.error("Firestore error adding automation:", err);
    }
    return newAutomation;
  }

  static async updateAutomation(updated: Automation): Promise<void> {
    // Update local cache
    const index = this.automationsCache.findIndex(aut => aut.id === updated.id);
    if (index !== -1) {
      this.automationsCache[index] = updated;
      this.notify();
    }

    try {
      await setDoc(doc(db, 'automations', updated.id), updated);
    } catch (err) {
      console.error("Firestore error updating automation:", err);
    }
  }

  static async deleteAutomation(id: string): Promise<void> {
    this.automationsCache = this.automationsCache.filter(aut => aut.id !== id);
    this.notify();

    try {
      await deleteDoc(doc(db, 'automations', id));
    } catch (err) {
      console.error("Firestore error deleting automation:", err);
    }
  }

  // --- CREATORS CRUD ---
  static getCreators(): Creator[] {
    this.initialize();
    if (this.creatorsCache.length > 0) {
      return this.creatorsCache;
    }
    const data = localStorage.getItem(STORAGE_KEYS.CREATORS);
    return data ? JSON.parse(data) : [];
  }

  static getCreatorById(id: string): Creator | undefined {
    return this.getCreators().find(c => c.id === id);
  }

  // --- BUSINESS DNA CRUD ---
  static getBusinessDNA(): BusinessDNA {
    this.initialize();
    if (this.businessDnaCache) {
      return this.businessDnaCache;
    }
    const data = localStorage.getItem(STORAGE_KEYS.BUSINESS_DNA);
    return data ? JSON.parse(data) : {
      industry: 'SaaS & Tech',
      companySize: '10-50',
      goals: [],
      techStack: [],
      maturity: 'Intermediate'
    };
  }

  static async updateBusinessDNA(dna: BusinessDNA): Promise<void> {
    this.businessDnaCache = dna;
    localStorage.setItem(STORAGE_KEYS.BUSINESS_DNA, JSON.stringify(dna));
    this.notify();

    try {
      await setDoc(doc(db, 'business_dna', this.getUserId()), dna);
    } catch (err) {
      console.error("Firestore error updating business DNA:", err);
    }
  }

  // --- RESET & FACTORY RESTORE ---
  static async resetToFactory() {
    localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.BUSINESS_DNA);
    this.automationsCache = [];
    this.creatorsCache = [];
    this.businessDnaCache = null;
    this.notify();
  }
}
