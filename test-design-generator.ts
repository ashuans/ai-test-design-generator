import { z } from 'zod';
import { createAiClient } from './ai-client.js';

export const testDesignSchema = z.object({ feature: z.string(), assumptions: z.array(z.string()), scenarios: z.array(z.object({ id: z.string(), title: z.string(), priority: z.enum(['P0', 'P1', 'P2']), layer: z.enum(['ui', 'api', 'integration', 'accessibility']), given: z.array(z.string()), when: z.array(z.string()), then: z.array(z.string()) })) });
export type TestDesign = z.infer<typeof testDesignSchema>;

export async function generateTestDesign(feature: string): Promise<TestDesign> {
  const raw = await createAiClient().complete({ system: 'You are a senior QA architect. Return only a JSON test design.', prompt: `Create a test design for this feature: ${feature}` });
  try { return testDesignSchema.parse(JSON.parse(raw)); } catch {
    return { feature, assumptions: ['User has a valid account', 'The service is available'], scenarios: [
      { id: 'AT-001', title: `Happy path: ${feature}`, priority: 'P0', layer: 'ui', given: ['A valid user is on the feature entry page'], when: ['The user completes the primary action'], then: ['The expected success state is visible'] },
      { id: 'AT-002', title: `Validation: ${feature}`, priority: 'P1', layer: 'api', given: ['A request contains invalid input'], when: ['The request is submitted'], then: ['A safe validation error is returned'] },
    ] };
  }
}
