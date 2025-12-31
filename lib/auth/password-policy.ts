/**
 * Enhanced Password Policy
 * Enforces strong password requirements
 */

export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

/**
 * Check if password meets all security requirements
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length check (10 characters)
  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long');
  } else {
    score += 1;
    if (password.length >= 14) score += 1;
    if (password.length >= 18) score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    score += 1;
  }

  // Common password check (basic)
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'admin123', 'welcome123',
    'password123', 'letmein123', 'monkey123', '1234567890', 'abc123456'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a more unique password');
    score = Math.max(0, score - 2);
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., "aaa", "111")');
    score = Math.max(0, score - 1);
  }

  // Determine strength
  let strength: PasswordStrengthResult['strength'] = 'weak';
  if (score >= 7) strength = 'very-strong';
  else if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
}

/**
 * Legacy function for backward compatibility
 * Checks if password meets minimum requirements (8 characters)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'weak': return 'red';
    case 'medium': return 'orange';
    case 'strong': return 'yellow';
    case 'very-strong': return 'green';
    default: return 'gray';
  }
}

/**
 * Get password strength text for UI (English)
 */
export function getPasswordStrengthTextEn(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'weak': return 'Weak';
    case 'medium': return 'Medium';
    case 'strong': return 'Strong';
    case 'very-strong': return 'Very Strong';
    default: return 'Unknown';
  }
}

/**
 * Get password strength text for UI (Arabic)
 */
export function getPasswordStrengthTextAr(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'weak': return 'ضعيفة';
    case 'medium': return 'متوسطة';
    case 'strong': return 'قوية';
    case 'very-strong': return 'قوية جداً';
    default: return 'غير معروف';
  }
}
