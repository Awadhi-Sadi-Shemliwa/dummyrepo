import React from 'react';

const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  error,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${widthClass}`}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-brand-sand/80 mb-2">
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-3
            w-full
            rounded-2xl
            border
            ${error ? 'border-brand-red' : 'border-white/20'}
            bg-white/10
            text-white
            placeholder-brand-sand/50
            focus:outline-none
            focus:ring-2
            focus:ring-brand-gold/50
            focus:border-brand-gold/60
            transition-colors
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-brand-red">{error}</p>
      )}
    </div>
  );
};

export default Input;
