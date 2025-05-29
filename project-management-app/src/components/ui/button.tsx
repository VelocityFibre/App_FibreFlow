import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
    
    const variants = {
      primary: "bg-[#003049] text-white hover:bg-[#004b74] focus-visible:ring-[#0077b6]",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-[#003049]",
      outline: "border border-[#003049] bg-transparent hover:bg-[#003049]/10 text-[#003049] focus-visible:ring-[#003049]",
      ghost: "bg-transparent hover:bg-[#003049]/10 text-[#003049] focus-visible:ring-[#003049]",
    };
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    
    const variantClass = variants[variant];
    const sizeClass = sizes[size];
    
    return (
      <button
        className={`${baseStyles} ${variantClass} ${sizeClass} ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
