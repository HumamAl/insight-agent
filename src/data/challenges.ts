import type { Challenge } from "@/lib/types";

export const executiveSummary = {
  commonApproach:
    "Most LLM integrations pipe natural-language questions directly to a model, then hand the raw output to downstream systems — catching schema failures at runtime and hoping the model got it right.",
  differentApproach:
    "I build a structured validation layer between the model and your data systems — so every query is decomposed, routed, grounded, and schema-verified before a single byte reaches your analytics store.",
  accentWord: "grounded",
};

export const challenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Decomposing intricate queries across unstructured big data",
    description:
      "Analysts write complex, multi-intent questions — \"What drove the Q3 revenue spike in APAC, and how does it compare to the same period last year?\" Raw LLMs turn these into a single embedding search, collapsing intent and losing sub-question structure. The result: shallow answers that miss half the question. I decompose queries into typed sub-intents first, route each to the appropriate data source, then synthesize a grounded composite response.",
    visualizationType: "flow",
    outcome:
      "Could reduce analyst query turnaround from hours of manual SQL wrangling to seconds of natural-language input — with citation-grounded answers instead of hallucinated summaries.",
  },
  {
    id: "challenge-2",
    title: "Agent reliability and hallucination control at scale",
    description:
      "Raw LLM output on structured datasets fails silently — the model confidently returns numbers that don't exist in your data. At scale, this erodes trust fast. I layer structured output enforcement, groundedness scoring, and a confidence-gated human review queue: low-confidence answers never reach the dashboard, they route to a review inbox instead.",
    visualizationType: "metrics",
    outcome:
      "Could raise insight accuracy from ~60% raw LLM output to 90%+ with structured output schemas and groundedness validation — reducing hallucination-flagged queries from ~40% to under 5%.",
  },
  {
    id: "challenge-3",
    title: "Transforming raw dataset output into actionable intelligence",
    description:
      "Even when the data retrieval is correct, analysts still spend most of their time formatting query results into readable summaries, pivot tables, and narrative context. This is the last-mile problem: the model retrieved the right chunks but the output is raw JSON, not a decision-ready insight. I auto-generate structured summaries with citations, trend callouts, and anomaly flags — shifting analyst time from formatting to deciding.",
    visualizationType: "before-after",
    outcome:
      "Could shift analyst time from 80% data formatting to 80% decision-making via auto-generated structured summaries with source citations and trend annotations.",
  },
];
