// File: src/app/models/completion.models.ts

/**
 * Request structure for text completion
 */
export interface TextCompletionRequest {
  prompt: string;
  model: string;
}

/**
 * Response structure matching OpenAI format
 */
export interface TextCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  systemFingerprint: string;
  usage: Usage;
}

/**
 * Individual choice in the response
 */
export interface Choice {
  index: number;
  text: string;
  logprobs: any;
  finishReason: string;
}

/**
 * Token usage information
 */
export interface Usage {
  queue_time: number;
  prompt_tokens: number;
  prompt_time: number;
  completion_tokens: number;
  completion_time: number;
  total_tokens: number;
  total_time: number;
}
export interface ChatChoice {
  index: number;
  message: ChatMessage;
  logprobs: any | null;
  finish_reason: string;
}
export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: Usage;
  usage_breakdown: any | null;
  system_fingerprint: string;
  x_groq: XGroq;
  service_tier: string;
}
export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  stream: boolean;
}

/** Individual chat message */
export interface ChatMessage {
  role: string;
  content: string;
}
export interface XGroq {
  id: string;
}
/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

/**
 * Available model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

/**
 * Models list response
 */
export interface ModelsResponse {
  models: ModelInfo[];
}
