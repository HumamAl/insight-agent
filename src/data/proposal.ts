// Proposal data for the "Work With Me" tab.
// All portfolio outcomes are exact from references/developer-profile.md.
// Stats sourced exclusively from developer-profile.md social proof section.

export const proposalData = {
  hero: {
    name: "Humam",
    valueProp:
      "I build LLM agent pipelines and RAG systems that return grounded answers — with validation layers that catch hallucinations before they reach your database.",
    badge: "Built this demo for your project",
    stats: [
      { value: "24+", label: "Projects Shipped" },
      { value: "< 48hr", label: "Demo Turnaround" },
      { value: "15+", label: "Industries" },
    ],
  },

  portfolioProjects: [
    {
      name: "WMF Agent Dashboard",
      description:
        "AI-powered customer service agent for Windsor Metal Finishing — email classification, RFQ data extraction with confidence scoring, and human-in-the-loop approval workflow.",
      outcome:
        "Replaced a 4-hour manual quote review process with a 20-minute structured extraction and approval flow",
      tech: ["Claude API", "n8n", "Next.js", "TypeScript", "Microsoft Graph"],
      url: "https://wmf-agent-dashboard.vercel.app",
      relevance: "Real Claude API pipeline with structured output — exact tech this role needs",
    },
    {
      name: "MedRecord AI",
      description:
        "AI-powered medical record summarization tool that extracts key clinical data, diagnoses, medications, and treatment timelines from unstructured patient records.",
      outcome:
        "Document processing pipeline that extracts structured clinical data and generates a readable timeline summary",
      tech: ["AI Extraction Pipeline", "Next.js", "TypeScript", "shadcn/ui"],
      url: "https://medrecord-ai-delta.vercel.app",
      relevance: "Unstructured-to-structured extraction pipeline — same pattern as LLM big data work",
    },
    {
      name: "Data Intelligence Platform",
      description:
        "Data analytics and intelligence dashboard with multi-source data aggregation, interactive visualization, and insight generation.",
      outcome:
        "Unified analytics dashboard pulling data from multiple sources with interactive charts and filterable insights",
      tech: ["Next.js", "TypeScript", "Recharts", "shadcn/ui"],
      url: "https://data-intelligence-platform-sandy.vercel.app",
      relevance: "Multi-source aggregation and analytics — mirrors the data layer this role requires",
    },
    {
      name: "Outerbloom — AI Social Coordination",
      description:
        "AI-powered social event coordination platform that intelligently matches people, schedules, and venues using an intelligent matching pipeline.",
      outcome:
        "AI-driven matching pipeline connecting users, schedules, and venues — reducing manual coordination overhead",
      tech: ["Next.js", "TypeScript", "AI Pipeline", "shadcn/ui"],
      url: "https://outerbloom.vercel.app",
      relevance: "Orchestrated AI agent pipeline with multi-step reasoning — close architectural match",
    },
  ],

  approach: [
    {
      step: "01",
      title: "Audit Your Data Landscape",
      description:
        "Map your existing data sources, schema quality, and query patterns. Surface the retrieval gaps before writing a line of agent code.",
      timeline: "Day 1–3",
    },
    {
      step: "02",
      title: "Design Agent Architecture",
      description:
        "Choose retrieval strategy (dense / hybrid / agentic), define tool boundaries, agree on structured output schema. Documented before implementation starts.",
      timeline: "Day 4–6",
    },
    {
      step: "03",
      title: "Build RAG Pipeline with Quality Gates",
      description:
        "Feature by feature: embed, retrieve, rerank, generate, validate groundedness. You see working queries with evaluation scores — not promises.",
      timeline: "Week 2–4",
    },
    {
      step: "04",
      title: "Evaluate, Observe, Refine",
      description:
        "Groundedness scores, latency traces, hallucination flags tracked from day one. Short feedback cycles until quality targets are met.",
      timeline: "Week 4–6",
    },
    {
      step: "05",
      title: "Deploy with Observability",
      description:
        "Production-ready with trace logging, cost dashboards, and alert thresholds. Clean TypeScript, documented architecture — easy to hand off.",
      timeline: "Week 6",
    },
  ],

  skills: [
    {
      category: "LLM & Agents",
      items: ["Claude API", "OpenAI API", "LangChain", "Prompt Engineering", "Structured Output", "Confidence Scoring"],
    },
    {
      category: "RAG & Data",
      items: ["RAG Pipelines", "Vector Databases", "Embedding Models", "Chunking Strategy", "Reranking", "NLP"],
    },
    {
      category: "Data Pipelines",
      items: ["n8n Workflows", "Data Aggregation", "ETL", "REST APIs", "Webhook Handling", "Scheduled Jobs"],
    },
    {
      category: "Frontend & Infra",
      items: ["Next.js", "TypeScript", "React", "Recharts", "Vercel", "GitHub Actions"],
    },
  ],

  cta: {
    headline: "Your data is too valuable for a chatbot wrapper.",
    body: "I build LLM pipelines with evaluation layers — groundedness scores, hallucination detection, trace logging. The kind of system where you actually trust the answers.",
    action: "Reply on Upwork to start",
    availability: "Currently available for new projects",
  },
};
