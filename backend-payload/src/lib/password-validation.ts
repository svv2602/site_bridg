/**
 * Password Complexity Validation
 *
 * Pure validation function for password strength requirements.
 * Used by the Users collection beforeChange hook to enforce
 * password complexity on creation and password changes.
 *
 * Requirements:
 *   - Minimum 8 characters
 *   - At least 1 uppercase letter
 *   - At least 1 lowercase letter
 *   - At least 1 digit
 *   - At least 1 special character
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/]/;

/**
 * Validates password complexity against security requirements.
 * Returns a result object with validity status and a list of
 * specific failure reasons (in Ukrainian).
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Пароль повинен містити щонайменше 8 символів');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль повинен містити щонайменше 1 велику літеру');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль повинен містити щонайменше 1 малу літеру');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Пароль повинен містити щонайменше 1 цифру');
  }

  if (!SPECIAL_CHARS.test(password)) {
    errors.push('Пароль повинен містити щонайменше 1 спеціальний символ (!@#$%^&*()_+-=[]{}|;:\',.<>?/)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
