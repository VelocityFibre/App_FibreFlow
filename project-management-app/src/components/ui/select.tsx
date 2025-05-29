import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
    };

    return (
      <select
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = "Select"

export const SelectTrigger = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`relative ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export const SelectValue = ({ children, placeholder, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }) => {
  return (
    <span className={`block truncate ${className || ""}`} {...props}>
      {children || placeholder}
    </span>
  )
}

export const SelectContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`mt-1 ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

export const SelectItem = ({ children, value, className, ...props }: React.HTMLAttributes<HTMLOptionElement> & { value: string }) => {
  return (
    <option className={`${className || ""}`} value={value} {...props}>
      {children}
    </option>
  )
}
