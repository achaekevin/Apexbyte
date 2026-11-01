import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={clsx(
              'w-full min-h-[44px] border rounded-lg transition-all duration-300',
              'py-2.5 sm:py-3',
              leftIcon ? 'pl-10 sm:pl-11' : 'pl-3.5 sm:pl-4',
              rightIcon ? 'pr-10 sm:pr-11' : 'pr-3.5 sm:pr-4',
              'text-base leading-normal placeholder:text-sm sm:placeholder:text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'dark:bg-gray-800 dark:text-white',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                : 'border-gray-300 dark:border-gray-600',
              props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1 text-sm text-error-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
