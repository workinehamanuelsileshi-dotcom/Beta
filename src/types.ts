export interface BusinessDNA {
  companyName?: string;
  website?: string;
  industry: string;
  subIndustry?: string;
  companySize: string;
  country?: string;
  primaryGoal?: string;
  revenueStage?: string;
  growthStage?: string;
  automationScore?: number;
  aiReadiness?: number;
  digitalMaturity?: string;
  techStack: string[];
  painPoints?: string[];
  preferredCategories?: string[];
  estimatedROI?: string;
  recommendedCollections?: string[];
  preferredBudget?: string;
  preferredCreatorType?: string;
  preferredTimeline?: string;
  businessPersonality?: string;
  goals: string[];
  maturity: 'Beginner' | 'Intermediate' | 'Advanced';
  challengesText?: string;
  extractedPainPoints?: string[];
  extractedOpportunities?: string[];
  extractedKeywords?: string[];
  urgency?: string;
  projectSize?: string;
  commChannel?: string;
  timezone?: string;
  language?: string;
  timeline?: string;
  interests?: string[];
  monthlyBudget?: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  purpose: string;
  tool: string;
  outcome: string;
  timeEstimate: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  specialty: string;
  completedProjects: number;
  handle?: string;
  bio?: string;
  country?: string;
  technologies?: string[];
  totalSales?: number;
  revenueGenerated?: string;
  availability?: 'Available' | 'Busy';
}

export interface Automation {
  id: string;
  name: string;
  title?: string;
  problemSolved: string;
  description?: string;
  valueProp: string;
  roi: string;
  hoursSaved: number;
  monthlyCostReduction: number;
  industry: string;
  category: string;
  platforms: string[];
  integrations?: string[];
  tags?: string[];
  thumbnailUrl?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  implementationTime: string;
  price: string | number;
  creatorId: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  savesCount?: number;
  createdAt?: any;
  matchScore?: number;
  creator?: Creator;
  workflow: WorkflowNode[];
  isBookmarked?: boolean;
  isLiked?: boolean;
  likesCount: number;
  heightClass?: string; // For masonry variation
  status?: 'draft' | 'published';
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  automationsCount: number;
  imageUrl?: string;
  category: string;
}

export interface AISearchResult {
  query: string;
  explanation: string;
  recommendedWorkflow?: {
    name: string;
    description: string;
    nodes: WorkflowNode[];
    estimatedROI: string;
    estimatedSavings: string;
    customBudget: string;
    implementationTime: string;
  };
}
