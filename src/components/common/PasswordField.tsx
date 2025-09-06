import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, getPasswordRequirements, type PasswordValidationResult } from '@/lib/passwordValidation';

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  showLabel?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  showValidation = true,
  showLabel = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationResult, setValidationResult] = useState<PasswordValidationResult | null>(null);

  const handlePasswordChange = (newValue: string) => {
    onChange(newValue);
    if (showValidation && newValue.length > 0) {
      setValidationResult(validatePassword(newValue));
    } else {
      setValidationResult(null);
    }
  };

  const requirements = getPasswordRequirements();

  const getValidationIcon = (isValid: boolean) => {
    if (isValid) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    return <X className="w-4 h-4 text-red-500" />;
  };

  const getValidationColor = (isValid: boolean) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={disabled}
          className={`w-full ${className} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Password Requirements */}
      {showValidation && value.length > 0 && validationResult && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
            <div className="space-y-1">
              {requirements.map((requirement) => {
                const isValid = validationResult.validations[requirement.key as keyof typeof validationResult.validations];
                return (
                  <div key={requirement.key} className="flex items-center gap-2 text-sm">
                    {getValidationIcon(isValid)}
                    <span className={getValidationColor(isValid)}>
                      {requirement.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Overall Password Strength */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= validationResult.score
                            ? validationResult.isValid
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    validationResult.isValid
                      ? 'text-green-600'
                      : validationResult.score >= 3
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {validationResult.isValid
                      ? 'Strong'
                      : validationResult.score >= 3
                      ? 'Medium'
                      : 'Weak'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
