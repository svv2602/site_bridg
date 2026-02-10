/**
 * Tests for password complexity validation.
 * Pure function tested in isolation without Payload CMS running.
 */
import { describe, it, expect } from 'vitest';
import { validatePasswordComplexity } from '../../lib/password-validation';

describe('validatePasswordComplexity', () => {
  // --- Valid passwords ---

  it('should accept a password meeting all requirements', () => {
    const result = validatePasswordComplexity('Str0ng!Pass');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept a password with exactly 8 characters', () => {
    const result = validatePasswordComplexity('Ab1!xxxx');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept a password with various special characters', () => {
    const specials = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', '|', ';', ':', "'", ',', '.', '<', '>', '?', '/'];
    for (const ch of specials) {
      const password = `Abcdef1${ch}`;
      const result = validatePasswordComplexity(password);
      expect(result.valid).toBe(true);
    }
  });

  // --- Too short ---

  it('should reject a password shorter than 8 characters', () => {
    const result = validatePasswordComplexity('Ab1!xyz');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 8 символів');
  });

  it('should reject an empty password', () => {
    const result = validatePasswordComplexity('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 8 символів');
  });

  // --- Missing uppercase ---

  it('should reject a password without uppercase letters', () => {
    const result = validatePasswordComplexity('abcdefg1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 велику літеру');
  });

  // --- Missing lowercase ---

  it('should reject a password without lowercase letters', () => {
    const result = validatePasswordComplexity('ABCDEFG1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 малу літеру');
  });

  // --- Missing digit ---

  it('should reject a password without digits', () => {
    const result = validatePasswordComplexity('Abcdefgh!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 цифру');
  });

  // --- Missing special character ---

  it('should reject a password without special characters', () => {
    const result = validatePasswordComplexity('Abcdefg1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Пароль повинен містити щонайменше 1 спеціальний символ (!@#$%^&*()_+-=[]{}|;:',.<>?/)");
  });

  // --- Multiple violations ---

  it('should report all violations at once', () => {
    const result = validatePasswordComplexity('abc');
    expect(result.valid).toBe(false);
    // Too short, no uppercase, no digit, no special char
    expect(result.errors).toHaveLength(4);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 8 символів');
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 велику літеру');
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 цифру');
    expect(result.errors).toContain("Пароль повинен містити щонайменше 1 спеціальний символ (!@#$%^&*()_+-=[]{}|;:',.<>?/)");
  });

  it('should report all five violations for an empty password', () => {
    const result = validatePasswordComplexity('');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(5);
  });

  // --- Edge cases ---

  it('should not count digits as special characters', () => {
    const result = validatePasswordComplexity('Abcdefg12');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain("Пароль повинен містити щонайменше 1 спеціальний символ (!@#$%^&*()_+-=[]{}|;:',.<>?/)");
  });

  it('should not count spaces as special characters', () => {
    const result = validatePasswordComplexity('Ab cdefg1');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('should handle unicode/Cyrillic characters in password', () => {
    // Cyrillic letters should not count as uppercase/lowercase Latin
    const result = validatePasswordComplexity('Абвгдеж1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 велику літеру');
    expect(result.errors).toContain('Пароль повинен містити щонайменше 1 малу літеру');
  });

  it('should accept a long complex password', () => {
    const result = validatePasswordComplexity('ThisIs@Very$tr0ng&Long!Password2026');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
