import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  multiline = false,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            rows={rows}
            className={`
              block w-full rounded-lg border-gray-300 shadow-sm
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            {...(props as any)}
          />
        ) : (
          <input
            className={`
              block w-full rounded-lg border-gray-300 shadow-sm
              focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            {...(props as any)}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;