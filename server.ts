import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Local Fallback responses when Gemini is unavailable
const getLocalFallbackResult = (query: string, dna: any) => {
  const q = query.toLowerCase();
  
  let matchCategory = "Operations";
  let nodes = [
    { id: "n1", label: "Trigger Recipient", purpose: "Identify new input event", tool: dna.techStack?.[0] || "Airtable", outcome: "Passes payload to next step", timeEstimate: "Instant" },
    { id: "n2", label: "AI Classification", purpose: "Understand text context & intent", tool: "OpenAI/Gemini", outcome: "Labels data dynamically", timeEstimate: "< 1.5s" },
    { id: "n3", label: "Slack Sync Notification", purpose: "Inform the operations team", tool: "Slack", outcome: "Posts detailed insight and actions", timeEstimate: "Instant" }
  ];
  let name = "Bespoke Automation Setup";
  let description = "Automatically pipeline and process custom operations.";
  let roi = "310% / 1st Year";
  let savings = "18 hours saved/week";
  let budget = "$1,500 total";
  let time = "6 days";

  if (q.includes("support") || q.includes("ticket") || q.includes("customer") || q.includes("zendesk")) {
    matchCategory = "Customer Support";
    name = "Smart Customer Sentiment Router";
    description = "Analyze tickets instantly, query internal database, and draft response.";
    roi = "360% ROI";
    savings = "24 hours saved/week";
    budget = "$1,750 total";
    time = "5 days";
    nodes = [
      { id: "n1", label: "Ticket Ingestion", purpose: "New support ticket received", tool: "Zendesk", outcome: "Starts the pipeline", timeEstimate: "Instant" },
      { id: "n2", label: "Gemini Analysis", purpose: "Assess urgency, topic, and buyer sentiment", tool: "OpenAI", outcome: "Tags ticket and sets priority", timeEstimate: "< 1.2s" },
      { id: "n3", label: "Knowledge Search", purpose: "Look up document directories", tool: "Airtable", outcome: "Extracts reference material", timeEstimate: "< 800ms" },
      { id: "n4", label: "Draft Generation", purpose: "Construct professional reply", tool: "OpenAI", outcome: "Prepares response draft", timeEstimate: "< 1.8s" },
      { id: "n5", label: "Agent Approvals", purpose: "Approve draft inside Slack", tool: "Slack", outcome: "Dispatches finalized email", timeEstimate: "User dependent" }
    ];
  } else if (q.includes("sales") || q.includes("lead") || q.includes("crm") || q.includes("hubspot")) {
    matchCategory = "Sales";
    name = "Autonomous Prospect Enrichment Pipeline";
    description = "Enrich new CRM leads and synthesize individual cold proposals.";
    roi = "420% ROI";
    savings = "32 hours saved/week";
    budget = "$2,200 total";
    time = "8 days";
    nodes = [
      { id: "n1", label: "Lead In HubSpot", purpose: "Inbound registration captured", tool: "HubSpot", outcome: "Triggers CRM webhook", timeEstimate: "Instant" },
      { id: "n2", label: "Data Enrichment", purpose: "Search LinkedIn and company profiles", tool: "Apollo API", outcome: "Fills in firmographic metrics", timeEstimate: "< 2s" },
      { id: "n3", label: "Personalized Draft", purpose: "Synthesize personalized icebreakers", tool: "OpenAI/Gemini", outcome: "Outputs custom-tailored intro email", timeEstimate: "< 1.5s" },
      { id: "n4", label: "Slack Gatekeeper", purpose: "Alert sales rep to review proposed pitch", tool: "Slack", outcome: "1-click sends or rejects draft", timeEstimate: "Instant" }
    ];
  } else if (q.includes("finance") || q.includes("stripe") || q.includes("invoice") || q.includes("bookkeeping")) {
    matchCategory = "Finance";
    name = "Autonomous Continuous Ledger Reconciliation";
    description = "Sync Stripe payments with open invoices and bookkeeping entries.";
    roi = "540% ROI";
    savings = "20 hours saved/week";
    budget = "$2,500 total";
    time = "7 days";
    nodes = [
      { id: "n1", label: "Stripe Webhook", purpose: "New charge or refund detected", tool: "Stripe", outcome: "Grabs transaction details", timeEstimate: "Instant" },
      { id: "n2", label: "QuickBooks Match", purpose: "Identify corresponding ledger entries", tool: "QuickBooks", outcome: "Matches invoice numbers", timeEstimate: "< 1.8s" },
      { id: "n3", label: "Ledger Update", purpose: "Register income and calculate fees", tool: "QuickBooks", outcome: "Completes continuous sync", timeEstimate: "< 1s" },
      { id: "n4", label: "Slack Ledger Alert", purpose: "Log completed entries to accounts room", tool: "Slack", outcome: "Keeps finance team notified", timeEstimate: "Instant" }
    ];
  }

  return {
    explanation: `Based on your search for "${query}" and your company's focus on ${dna.industry || 'operations'}, we recommend a high-impact custom workflow. This architecture leverages ${dna.techStack?.join(', ') || 'Slack & HubSpot'} to automate routine steps, saving valuable developer and specialist hours.`,
    recommendedWorkflow: {
      name,
      description,
      nodes,
      estimatedROI: roi,
      estimatedSavings: savings,
      customBudget: budget,
      implementationTime: time
    }
  };
};

// API Search Route
app.post("/api/analyze-company", async (req, res) => {
  const data = req.body;
  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key found. Using high-fidelity local fallback for company analysis.");
    const fallbackDNA: any = {
      ...data,
      subIndustry: data.selectedIndustry === 'Finance & Fintech' ? 'FinTech Gateway' : 'SaaS Infrastructure',
      automationScore: 78,
      aiReadiness: 82,
      digitalMaturity: data.companySize === '1-10' ? 'Beginner' : data.companySize === '250+' ? 'Advanced' : 'Intermediate',
      estimatedROI: '360%',
      recommendedCollections: ['AI Automation Hub', 'Support Dispatcher Framework'],
      businessPersonality: data.goals?.includes('Increase Sales') ? 'Aggressive Growth Focus' : 'Hyper-Efficiency Operationalist',
      maturity: data.companySize === '1-10' ? 'Beginner' : data.companySize === '250+' ? 'Advanced' : 'Intermediate',
      extractedPainPoints: ['Manual client account updates', 'High support volume', 'Stripe-Salesforce syncing'],
      extractedOpportunities: ['Conversational customer service AI agent', 'Automated Stripe-to-Salesforce account pipelines'],
      extractedKeywords: ['fintech', 'automation', 'CRM sync', 'support agent']
    };
    return res.json(fallbackDNA);
  }

  try {
    const promptText = `
      You are the Flowmint Solutions Architect. Take these raw business calibration metrics and synthesize a highly personalized, high-fidelity Business DNA profile.

      Inputs:
      - Company Name: ${data.companyName}
      - Website: ${data.website}
      - Industry: ${data.selectedIndustry}
      - Country: ${data.country}
      - Company Size: ${data.companySize}
      - Annual Revenue: ${data.annualRevenue}
      - Selected Goals: ${data.goals?.join(', ')}
      - Technical / Process Bottlenecks & Challenges: "${data.challengesText}"
      - Current Tech Stack: ${data.techStack?.join(', ')}
      - Interests / Focus Areas: ${data.interests?.join(', ')}
      - Budget: ${data.monthlyBudget}
      - Timeline: ${data.timeline}
      - Urgency: ${data.urgency}
      
      Output a complete JSON object adhering strictly to the required schema:
      - subIndustry: Highly specific niche description (2-4 words)
      - automationScore: A number from 30 to 95 representing how automated they currently are (keep it realistic)
      - aiReadiness: A number from 30 to 95 representing readiness for AI deployment
      - digitalMaturity: 'Beginner', 'Intermediate', or 'Advanced'
      - estimatedROI: Precise custom ROI metric string, e.g. '340% ROI in Year 1'
      - recommendedCollections: Array of 2-3 custom automation collection names suited for them
      - businessPersonality: A custom personality archetype name, e.g. 'Pragmatic Modernizer' or 'High-Velocity Scaling Pioneer'
      - maturity: 'Beginner', 'Intermediate', or 'Advanced'
      - extractedPainPoints: Array of 2-3 pain points parsed from challengesText
      - extractedOpportunities: Array of 2-3 specific AI opportunity proposals
      - extractedKeywords: Array of 3-4 short search keywords
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subIndustry: { type: Type.STRING },
            automationScore: { type: Type.INTEGER },
            aiReadiness: { type: Type.INTEGER },
            digitalMaturity: { type: Type.STRING },
            estimatedROI: { type: Type.STRING },
            recommendedCollections: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            businessPersonality: { type: Type.STRING },
            maturity: { type: Type.STRING },
            extractedPainPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            extractedOpportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            extractedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "subIndustry", "automationScore", "aiReadiness", "digitalMaturity", 
            "estimatedROI", "recommendedCollections", "businessPersonality", "maturity",
            "extractedPainPoints", "extractedOpportunities", "extractedKeywords"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      ...data,
      ...parsed
    });
  } catch (err) {
    console.error("Failed to analyze company with Gemini:", err);
    // Safe return
    return res.json({
      ...data,
      subIndustry: 'Custom Services',
      automationScore: 65,
      aiReadiness: 70,
      digitalMaturity: 'Intermediate',
      estimatedROI: '320%',
      recommendedCollections: ['AI Operations Suite'],
      businessPersonality: 'Systematic Improver',
      maturity: 'Intermediate',
      extractedPainPoints: data.goals || ['Manual customer support syncing', 'Lead transfer latency'],
      extractedOpportunities: ['Conversational customer service AI agent', 'Automated CRM systems integration'],
      extractedKeywords: ['operations', 'automation', 'integration']
    });
  }
});

app.post("/api/creator-chat", async (req, res) => {
  const { creator, automation, chatHistory, message } = req.body;
  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key found. Using fallback creator chatbot response.");
    let reply = `Thanks for writing! I am ${creator.name}, specializing in ${creator.specialty}. I've reviewed your request about the "${automation.name}" pipeline. We can customize and deploy this for you in no time. Let's schedule a brief call!`;
    return res.json({ reply });
  }

  try {
    const historyPrompt = chatHistory?.map((c: any) => `${c.sender === 'user' ? 'User' : 'Creator'}: ${c.text}`).join('\n') || '';
    
    const promptText = `
      You are ${creator.name}, a verified elite automation creator with the specialty of "${creator.specialty}".
      You built the custom automation solution called "${automation.name}", which is described as: "${automation.problemSolved}".
      Its budget is ${automation.price} and estimated implementation time is ${automation.implementationTime}.
      
      Conversation History:
      ${historyPrompt}
      
      User's latest message: "${message}"
      
      Respond directly, warmly, and professionally to the user. Speak in the first person as ${creator.name}. Be extremely specific and helpful about how you can customize this pipeline for their business stack (which might include databases, CRM systems, or messaging platforms).
      Provide a concise response (max 3 sentences) and end with a clear, helpful call-to-action (like asking about their technical stack, database platforms, or proposing a scoping conversation).
      Do not include any greeting headers or labels, just output the response text directly.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
    });

    return res.json({ reply: response.text?.trim() || "I'd love to help you build and scale this pipeline. Let's discuss your exact integrations and timelines on a quick call!" });
  } catch (err) {
    console.error("Failed to execute creator chat with Gemini:", err);
    return res.json({ reply: "I'd love to help you build and scale this pipeline. Let's discuss your exact integrations and timelines on a quick call!" });
  }
});

// API Search Route
app.post("/api/search", async (req, res) => {
  const { query, dna } = req.body;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const userDna = dna || {
    industry: "SaaS & Tech",
    companySize: "10-50",
    goals: ["Save time"],
    techStack: ["HubSpot", "Slack"],
    maturity: "Intermediate"
  };

  const client = getGeminiClient();

  if (!client) {
    // API key missing or default, run local search simulator
    console.log("No Gemini API key found or default configured. Using high-fidelity local fallback.");
    const fallback = getLocalFallbackResult(query, userDna);
    return res.json(fallback);
  }

  try {
    const promptText = `
      You are the Flowmint Solutions Architect. Your goal is to guide businesses in designing, estimating, and selecting custom AI automations that solve their real-world operational problems.
      
      User Search Query: "${query}"
      
      User's Business DNA Context:
      - Industry: ${userDna.industry}
      - Company Size: ${userDna.companySize}
      - Primary Goals: ${userDna.goals?.join(", ")}
      - Existing Tech Stack: ${userDna.techStack?.join(", ")}
      - Automation Maturity: ${userDna.maturity}
      
      Based on this query and their Business DNA, provide a response containing:
      1. A short, highly-specific explanation (2-3 sentences max) explaining how an automated solution would solve their exact problem. Do not use generic words. Custom-tailor it to their tech stack if possible.
      2. A custom, beautifully designed multi-step (4 to 6 steps) recommended workflow diagram layout. For each step, provide a clear label, specific purpose, tool used, outcome, and execution speed estimate.
      3. Precise, realistic business impact projections:
         - estimatedROI (e.g., '380% / Year' or similar)
         - estimatedSavings (e.g., '22 hours saved/week' or similar)
         - customBudget (e.g., '$1,800 total' or similar)
         - implementationTime (e.g., '6 days' or similar)
         
      Respond STRICTLY in JSON format matching the schema provided.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A short, contextual 2-3 sentence description explaining the proposed automation and its business impact."
            },
            recommendedWorkflow: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "A premium, clear name for the custom automation solution." },
                description: { type: Type.STRING, description: "One-line description of the main value proposition." },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING, description: "The action label of the step, e.g., 'Inbound Lead Synced'" },
                      purpose: { type: Type.STRING, description: "Detailed purpose of the node" },
                      tool: { type: Type.STRING, description: "The specific platform used in this step" },
                      outcome: { type: Type.STRING, description: "Direct business outcome of this step" },
                      timeEstimate: { type: Type.STRING, description: "Execution time, e.g., '< 1.5s', 'Instant'" }
                    },
                    required: ["id", "label", "purpose", "tool", "outcome", "timeEstimate"]
                  }
                },
                estimatedROI: { type: Type.STRING },
                estimatedSavings: { type: Type.STRING },
                customBudget: { type: Type.STRING },
                implementationTime: { type: Type.STRING }
              },
              required: ["name", "description", "nodes", "estimatedROI", "estimatedSavings", "customBudget", "implementationTime"]
            }
          },
          required: ["explanation", "recommendedWorkflow"]
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API call failed, falling back to local simulation:", error);
    const fallback = getLocalFallbackResult(query, userDna);
    return res.json(fallback);
  }
});

// Start Express + Vite Integration
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
