import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'kakao' | 'google';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-lime text-bg-primary hover:bg-lime-hover focus:ring-lime border-2 border-lime shadow-[4px_4px_0_0_rgba(200,255,0,0.3)]',
      secondary: 'bg-magenta text-white hover:bg-magenta-hover focus:ring-magenta border-2 border-magenta shadow-[4px_4px_0_0_rgba(255,0,128,0.3)]',
      outline: 'bg-transparent text-text-primary border-2 border-border-strong hover:border-lime hover:text-lime',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
      kakao: 'bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] border-2 border-[#FEE500] shadow-[4px_4px_0_0_rgba(254,229,0,0.3)]',
      google: 'bg-white text-[#1F1F1F] hover:bg-gray-100 border-2 border-white shadow-[4px_4px_0_0_rgba(255,255,255,0.3)]',
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
