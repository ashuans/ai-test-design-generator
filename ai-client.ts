import 'dotenv/config';
import type { AiClient, AiRequest, AiProviderName } from './types.js';

class OfflineAiClient implements AiClient {
  async complete(request: AiRequest): Promise<string> {
    return JSON.stringify({ provider: 'offline', summary: 'Deterministic fallback generated from the supplied requirement.', requirement: request.prompt, assumptions: ['Review selectors and business rules before committing generated code.'] });
  }
}

class OpenAiCompatibleClient implements AiClient {
  async complete(request: AiRequest): Promise<string> {
    const key = process.env.AI_API_KEY;
    if (!key) throw new Error('AI_API_KEY is required when AI_PROVIDER=openai');
    const response = await fetch(`${process.env.AI_BASE_URL ?? 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.AI_MODEL ?? 'gpt-4o-mini', temperature: request.temperature ?? 0.1, messages: [{ role: 'system', content: request.system }, { role: 'user', content: request.prompt }] }),
    });
    if (!response.ok) throw new Error(`AI provider failed with HTTP ${response.status}`);
    const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return body.choices?.[0]?.message?.content ?? '';
  }
}

export function createAiClient(provider = (process.env.AI_PROVIDER ?? 'offline') as AiProviderName): AiClient {
  return provider === 'openai' ? new OpenAiCompatibleClient() : new OfflineAiClient();
}
