/**
 * Tests for collection hooks (slug generation, sanitizeEnumFields).
 * Hook functions tested in isolation without Payload CMS running.
 */
import { describe, it, expect } from 'vitest';

// ---- Tyres slug hook ----

// Inline the hook logic (same as Tyres beforeChange)
function tyresSlugHook(data: Record<string, unknown>): Record<string, unknown> {
  if (data?.name && !data?.slug) {
    data.slug = (data.name as string)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  return data;
}

// Inline the hook logic (same as Articles beforeChange)
function articlesSlugHook(data: Record<string, unknown>): Record<string, unknown> {
  if (data?.title && !data?.slug) {
    data.slug = (data.title as string)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  return data;
}

// Inline sanitizeEnumFields (same as Media beforeChange)
function sanitizeEnumFields(data: Record<string, unknown>): Record<string, unknown> {
  const enumFields = ['generationType', 'generationSeason', 'generationSize'];
  for (const field of enumFields) {
    if (data[field] === '') {
      data[field] = undefined;
    }
  }
  return data;
}

describe('Tyres slug hook', () => {
  it('should generate slug from name when slug is missing', () => {
    const data = { name: 'Turanza T005' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBe('turanza-t005');
  });

  it('should not overwrite existing slug', () => {
    const data = { name: 'Turanza T005', slug: 'custom-slug' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBe('custom-slug');
  });

  it('should handle spaces and special characters', () => {
    const data = { name: 'Blizzak WS90 (New!)' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBe('blizzak-ws90-new');
  });

  it('should handle multiple spaces', () => {
    const data = { name: 'Potenza   Sport' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBe('potenza-sport');
  });

  it('should strip Cyrillic characters', () => {
    const data = { name: 'Blizzak Зима' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBe('blizzak-');
  });

  it('should return data unchanged when name is missing', () => {
    const data = { brand: 'bridgestone' };
    const result = tyresSlugHook(data);
    expect(result.slug).toBeUndefined();
  });
});

describe('Articles slug hook', () => {
  it('should generate slug from title when slug is missing', () => {
    const data = { title: 'How to Choose Winter Tyres' };
    const result = articlesSlugHook(data);
    expect(result.slug).toBe('how-to-choose-winter-tyres');
  });

  it('should not overwrite existing slug', () => {
    const data = { title: 'Some Article', slug: 'my-slug' };
    const result = articlesSlugHook(data);
    expect(result.slug).toBe('my-slug');
  });

  it('should strip Cyrillic from slug', () => {
    const data = { title: 'Як вибрати шини' };
    const result = articlesSlugHook(data);
    // Cyrillic stripped, only dashes remain
    expect(result.slug).toBe('--');
  });

  it('should handle empty title', () => {
    const data = { title: '' };
    const result = articlesSlugHook(data);
    // Empty string is falsy, so slug should not be set
    expect(result.slug).toBeUndefined();
  });
});

describe('Media sanitizeEnumFields hook', () => {
  it('should convert empty string enum fields to undefined', () => {
    const data = { generationType: '', generationSeason: '', generationSize: '' };
    const result = sanitizeEnumFields(data);
    expect(result.generationType).toBeUndefined();
    expect(result.generationSeason).toBeUndefined();
    expect(result.generationSize).toBeUndefined();
  });

  it('should keep non-empty enum values', () => {
    const data = { generationType: 'hero', generationSeason: 'summer', generationSize: '1024x1024' };
    const result = sanitizeEnumFields(data);
    expect(result.generationType).toBe('hero');
    expect(result.generationSeason).toBe('summer');
    expect(result.generationSize).toBe('1024x1024');
  });

  it('should not affect other fields', () => {
    const data = { alt: 'test image', generationType: '', filename: 'test.png' };
    const result = sanitizeEnumFields(data);
    expect(result.alt).toBe('test image');
    expect(result.filename).toBe('test.png');
    expect(result.generationType).toBeUndefined();
  });

  it('should handle missing fields gracefully', () => {
    const data = { alt: 'test' };
    const result = sanitizeEnumFields(data);
    expect(result.alt).toBe('test');
    // Missing fields should stay missing (not become undefined explicitly)
    expect('generationType' in result).toBe(false);
  });
});
