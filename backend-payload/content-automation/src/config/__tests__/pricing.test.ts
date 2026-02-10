/**
 * Tests for pricing calculation functions.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateLLMCost,
  calculateImageCost,
  calculateEmbeddingCost,
  getModelPricing,
  findCheapestLLM,
  findCheapestImage,
  LLM_PRICING,
  IMAGE_PRICING,
  EMBEDDING_PRICING,
} from '../pricing';

describe('getModelPricing', () => {
  it('should find pricing for known LLM model', () => {
    const pricing = getModelPricing('anthropic', 'claude-sonnet-4-20250514');
    expect(pricing).toBeDefined();
    expect(pricing!.inputPer1M).toBe(3.0);
    expect(pricing!.outputPer1M).toBe(15.0);
  });

  it('should find pricing for known image model', () => {
    const pricing = getModelPricing('openai-dalle', 'dall-e-3');
    expect(pricing).toBeDefined();
    expect(pricing!.perImage).toBe(0.04);
  });

  it('should find pricing for known embedding model', () => {
    const pricing = getModelPricing('openai', 'text-embedding-3-small');
    expect(pricing).toBeDefined();
    expect(pricing!.inputPer1M).toBe(0.02);
  });

  it('should return undefined for unknown model', () => {
    const pricing = getModelPricing('unknown', 'unknown-model');
    expect(pricing).toBeUndefined();
  });
});

describe('calculateLLMCost', () => {
  it('should calculate cost for Anthropic Claude Sonnet', () => {
    const cost = calculateLLMCost('anthropic', 'claude-sonnet-4-20250514', 1000, 500);
    // (1000 / 1M) * 3.0 + (500 / 1M) * 15.0
    // = 0.003 + 0.0075 = 0.0105
    expect(cost).toBeCloseTo(0.0105, 4);
  });

  it('should calculate cost for DeepSeek (cheap)', () => {
    const cost = calculateLLMCost('deepseek', 'deepseek-chat', 10000, 5000);
    // (10000 / 1M) * 0.14 + (5000 / 1M) * 0.28
    // = 0.0014 + 0.0014 = 0.0028
    expect(cost).toBeCloseTo(0.0028, 4);
  });

  it('should calculate cost for OpenAI GPT-4o', () => {
    const cost = calculateLLMCost('openai', 'gpt-4o', 1000000, 500000);
    // (1M / 1M) * 2.5 + (500K / 1M) * 10.0
    // = 2.5 + 5.0 = 7.5
    expect(cost).toBeCloseTo(7.5, 2);
  });

  it('should return zero for zero tokens', () => {
    const cost = calculateLLMCost('anthropic', 'claude-sonnet-4-20250514', 0, 0);
    expect(cost).toBe(0);
  });

  it('should use default estimate for unknown model', () => {
    const cost = calculateLLMCost('unknown', 'unknown-model', 1000, 1000);
    // Default: (1000 + 1000) * 0.000002 = 0.004
    expect(cost).toBeCloseTo(0.004, 6);
  });
});

describe('calculateImageCost', () => {
  it('should calculate cost for DALL-E 3', () => {
    const cost = calculateImageCost('openai-dalle', 'dall-e-3', 1);
    expect(cost).toBe(0.04);
  });

  it('should calculate cost for DALL-E 3 HD', () => {
    const cost = calculateImageCost('openai-dalle', 'dall-e-3-hd', 1);
    expect(cost).toBe(0.08);
  });

  it('should calculate cost for multiple images', () => {
    const cost = calculateImageCost('replicate', 'black-forest-labs/flux-pro', 3);
    expect(cost).toBeCloseTo(0.165, 3); // 3 * 0.055
  });

  it('should use default estimate for unknown model', () => {
    const cost = calculateImageCost('unknown', 'unknown-model', 2);
    // Default: 2 * 0.05 = 0.10
    expect(cost).toBeCloseTo(0.10, 2);
  });

  it('should default to 1 image', () => {
    const cost = calculateImageCost('openai-dalle', 'dall-e-3');
    expect(cost).toBe(0.04);
  });
});

describe('calculateEmbeddingCost', () => {
  it('should calculate cost for OpenAI small embeddings', () => {
    const cost = calculateEmbeddingCost('openai', 'text-embedding-3-small', 1000000);
    // (1M / 1M) * 0.02 = 0.02
    expect(cost).toBeCloseTo(0.02, 4);
  });

  it('should calculate cost for Voyage', () => {
    const cost = calculateEmbeddingCost('voyage', 'voyage-3', 500000);
    // (500K / 1M) * 0.06 = 0.03
    expect(cost).toBeCloseTo(0.03, 4);
  });

  it('should use default for unknown model', () => {
    const cost = calculateEmbeddingCost('unknown', 'unknown', 1000000);
    // Default: (1M / 1M) * 0.05 = 0.05
    expect(cost).toBeCloseTo(0.05, 4);
  });
});

describe('findCheapestLLM', () => {
  it('should find cheapest LLM overall', () => {
    const cheapest = findCheapestLLM();
    expect(cheapest).toBeDefined();
    // Google Gemini Flash or DeepSeek should be cheapest
    const totalCost = cheapest!.inputPer1M + cheapest!.outputPer1M;
    expect(totalCost).toBeLessThan(1.0);
  });

  it('should filter by minimum context window', () => {
    const result = findCheapestLLM({ minContextWindow: 200000 });
    expect(result).toBeDefined();
    expect(result!.contextWindow).toBeGreaterThanOrEqual(200000);
  });

  it('should filter by provider', () => {
    const result = findCheapestLLM({ providers: ['anthropic'] });
    expect(result).toBeDefined();
    expect(result!.provider).toBe('anthropic');
  });

  it('should return undefined when no candidates match', () => {
    const result = findCheapestLLM({ minContextWindow: 999999999 });
    expect(result).toBeUndefined();
  });
});

describe('findCheapestImage', () => {
  it('should find cheapest image model overall', () => {
    const cheapest = findCheapestImage();
    expect(cheapest).toBeDefined();
    expect(cheapest!.perImage).toBeLessThanOrEqual(0.05);
  });

  it('should filter by provider', () => {
    const result = findCheapestImage(['openai-dalle']);
    expect(result).toBeDefined();
    expect(result!.provider).toBe('openai-dalle');
  });
});

describe('pricing data integrity', () => {
  it('should have all LLM models with positive input pricing', () => {
    for (const model of LLM_PRICING) {
      expect(model.inputPer1M).toBeGreaterThanOrEqual(0);
      expect(model.outputPer1M).toBeGreaterThanOrEqual(0);
      expect(model.provider).toBeTruthy();
      expect(model.model).toBeTruthy();
    }
  });

  it('should have all image models with perImage pricing', () => {
    for (const model of IMAGE_PRICING) {
      expect(model.perImage).toBeGreaterThan(0);
      expect(model.provider).toBeTruthy();
      expect(model.model).toBeTruthy();
    }
  });

  it('should have all embedding models with input pricing', () => {
    for (const model of EMBEDDING_PRICING) {
      expect(model.inputPer1M).toBeGreaterThan(0);
      expect(model.provider).toBeTruthy();
      expect(model.model).toBeTruthy();
    }
  });
});
