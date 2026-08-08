'use client';

import React from 'react';

interface FormInputProps {
  label?: string;
  value: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  name,
  onChange,
  type = "text",
  placeholder,
  icon,
  onIconClick,
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  inputClassName = "w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300",
  containerClassName = "relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]",
  required,
  disabled,
  readOnly
}) => {
  const lockedClass = disabled || readOnly ? ' bg-gray-100 cursor-not-allowed text-gray-500' : '';
  return (
    <div className="mb-4">
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <div className={containerClassName + lockedClass}>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={inputClassName}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
        />
        {icon && (
          <span
            className="absolute inset-y-0 right-8 flex items-center cursor-pointer"
            onClick={onIconClick}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormInput; 