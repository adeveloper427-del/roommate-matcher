const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * "Strong" here means: 8+ characters, at least one letter, at least one
 * number. Not full complexity rules — enough to stop trivially weak
 * passwords without frustrating users on a mobile keyboard.
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function passwordStrengthMessage(password: string): string | undefined {
  if (password.length === 0) return undefined;
  if (password.length < 8) return 'At least 8 characters';
  if (!/[A-Za-z]/.test(password)) return 'Include at least one letter';
  if (!/\d/.test(password)) return 'Include at least one number';
  return undefined;
}
