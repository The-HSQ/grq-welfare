export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  validations: PasswordValidation;
  score: number; // 0-5 based on how many requirements are met
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const validations: PasswordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const score = Object.values(validations).filter(Boolean).length;
  const isValid = score === 5; // All requirements must be met

  return {
    isValid,
    validations,
    score,
  };
};

export const getPasswordRequirements = () => [
  { key: 'minLength', label: 'At least 8 characters', icon: 'length' },
  { key: 'hasUppercase', label: 'One uppercase letter', icon: 'uppercase' },
  { key: 'hasLowercase', label: 'One lowercase letter', icon: 'lowercase' },
  { key: 'hasNumber', label: 'One number', icon: 'number' },
  { key: 'hasSpecialChar', label: 'One special character (@$!%*?&)', icon: 'special' },
];
