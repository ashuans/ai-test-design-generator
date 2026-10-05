export type AiProviderName = 'offline' | 'openai';
export interface AiRequest { system: string; prompt: string; temperature?: number; }
export interface AiClient { complete(request: AiRequest): Promise<string>; }
