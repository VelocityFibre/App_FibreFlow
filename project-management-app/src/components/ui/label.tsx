import * as React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        className={`text-sm font-medium leading-none text-gray-700 ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    )
  }
)

Label.displayName = "Label"
