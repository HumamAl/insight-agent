import type { LucideIcon } from "lucide-react";

// ─── Sidebar Navigation ────────────────────────────────────────────────────

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// ─── Challenge / Proposal Types ────────────────────────────────────────────

export type VisualizationType =
  | "flow"
  | "before-after"
  | "metrics"
  | "architecture"
  | "risk-matrix"
  | "timeline"
  | "dual-kpi"
  | "tech-stack"
  | "decision-flow";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visualizationType: VisualizationType;
  outcome?: string;
}

export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  approach: { title: string; description: string }[];
  skillCategories: { name: string; skills: string[] }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  relevance?: string;
  outcome?: string;
  liveUrl?: string;
}

export interface DemoScreen {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

export type ConversionVariant = "sidebar" | "inline" | "floating" | "banner";

// ─── LLM / RAG Domain Types ────────────────────────────────────────────────

/** Status of a single query execution through a pipeline */
export type QueryStatus =
  | "Completed"
  | "Failed"
  | "Hallucination Detected"
  | "Low Confidence"
  | "Rate Limited"
  | "Running";

/** Active / archived state of a pipeline */
export type PipelineStatus = "active" | "archived" | "degraded" | "draft";

/** Connector type for a data source */
export type DataSourceType =
  | "snowflake"
  | "s3"
  | "pdf"
  | "api"
  | "postgres"
  | "bigquery"
  | "sharepoint";

/** Health status of a connected data source */
export type DataSourceStatus =
  | "Connected"
  | "Syncing"
  | "Disconnected"
  | "Degraded"
  | "Embedding Stale";

/** Indexing pipeline state */
export type IndexingStatus =
  | "indexed"
  | "indexing"
  | "pending"
  | "failed"
  | "stale";

/** Supported foundation models available to pipelines */
export type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3.5-sonnet"
  | "claude-3-haiku";

// ─── Query ─────────────────────────────────────────────────────────────────

/**
 * A single natural-language query sent through a RAG pipeline.
 * Captures latency, token usage, cost, and RAG quality metrics.
 */
export interface Query {
  id: string;               // e.g. "qry_8k2mp"
  text: string;             // the natural-language question
  pipelineId: string;       // references Pipeline.id
  agentName: string;        // display name of the pipeline agent
  status: QueryStatus;
  latencyMs: number;        // end-to-end wall-clock ms
  inputTokens: number;
  outputTokens: number;
  costUsd: number;          // total LLM cost in USD
  /** 0–100: measures whether the answer is grounded in retrieved context */
  groundednessScore: number;
  /** 0–100: measures how well the answer addresses the question */
  answerRelevance: number;
  /** 0–100: measures context chunk quality vs. the query */
  contextRelevance: number;
  chunksRetrieved: number;
  userId: string;           // references the user who submitted the query
  createdAt: string;        // ISO timestamp
  errorMessage?: string;    // present when status = "Failed" | "Hallucination Detected"
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

/**
 * A configured RAG pipeline combining a data source set, a retrieval strategy,
 * and a foundation model.
 */
export interface Pipeline {
  id: string;               // e.g. "pip_x3n7q"
  name: string;             // slug: "sales-insights-agent"
  displayName: string;      // human-readable: "Sales Insights Agent"
  description: string;
  dataSourceIds: string[];  // references DataSource.id[]
  modelId: ModelId;
  /** Top-K chunks to retrieve per query */
  topK: number;
  /** Token size of each chunk */
  chunkSize: number;
  status: PipelineStatus;
  totalQueries: number;
  avgLatencyMs: number;
  avgGroundedness: number;  // 0–100
  successRate: number;      // 0–100 percentage
  createdAt: string;
  lastActiveAt: string;
}

// ─── Data Source ───────────────────────────────────────────────────────────

/** A connected external data connector that feeds the vector index */
export interface DataSource {
  id: string;               // e.g. "ds_f4p8w"
  name: string;             // e.g. "prod-snowflake-warehouse"
  displayName: string;      // e.g. "Production Snowflake Warehouse"
  type: DataSourceType;
  status: DataSourceStatus;
  sizeGb: number;
  chunkCount: number;
  /** Hours since last embedding run; <24 = fresh, >72 = stale */
  embeddingFreshnessHours: number;
  lastSyncAt: string;
  indexingStatus: IndexingStatus;
  /** Optional: owner team or description tag */
  owner?: string;
}

// ─── Trace ─────────────────────────────────────────────────────────────────

/** A single timed span within a query's execution trace */
export interface TraceSpan {
  name:
    | "embed-query"
    | "vector-search"
    | "rerank"
    | "generate-response"
    | "validate-groundedness";
  startMs: number;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

/** Full execution trace for a query, composed of ordered spans */
export interface Trace {
  id: string;               // e.g. "trc_9w1xz"
  queryId: string;          // references Query.id
  totalDurationMs: number;
  spans: TraceSpan[];
}

// ─── Insight ───────────────────────────────────────────────────────────────

/** A saved/pinned query result bookmarked for future reference */
export interface Insight {
  id: string;               // e.g. "ins_7c3rt"
  queryId: string;          // references Query.id
  title: string;
  summary: string;
  sourceCitations: string[];  // chunk source labels or document names
  groundednessScore: number;
  pinnedBy: string;           // user display name
  createdAt: string;
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

/** KPI cards on the main dashboard */
export interface DashboardStats {
  totalQueries: number;
  queriesChange: number;          // % WoW
  avgGroundedness: number;        // 0–100
  groundednessChange: number;
  avgLatencyMs: number;
  latencyChange: number;          // ms WoW (negative = improvement)
  hallucinationRate: number;      // percentage of queries flagged
  hallucinationRateChange: number; // negative = improvement
  totalCostUsd: number;           // rolling 30-day cost
  costChange: number;             // % WoW
  activePipelines: number;
}

// ─── Chart Data ─────────────────────────────────────────────────────────────

export interface QueryVolumeDataPoint {
  month: string;
  queries: number;
  failed: number;
  hallucinationDetected: number;
}

export interface GroundednessDataPoint {
  month: string;
  avgGroundedness: number;
  p10Groundedness: number;   // 10th percentile — worst decile
}

export interface LatencyDistributionPoint {
  bucket: string;   // e.g. "<1s", "1–2s", "2–4s", "4–6s", ">6s"
  count: number;
}

export interface CostByPipelinePoint {
  pipeline: string;
  costUsd: number;
  queryCount: number;
}

export interface GroundednessByModelPoint {
  model: ModelId;
  avgGroundedness: number;
  queryCount: number;
  avgCostUsd: number;
}
