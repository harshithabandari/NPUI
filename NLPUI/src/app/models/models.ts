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
  system_fingerprint: string;
  usage: Usage;
}

export interface Choice {
  index: number;
  text: string;
  logprobs?: any; // Use the relevant type if available
  finishReason: string; // Note the lowercase 'f' as per API response
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
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
