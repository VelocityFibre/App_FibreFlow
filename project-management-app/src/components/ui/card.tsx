import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={`rounded-lg border border-[#003049]/20 bg-white shadow-sm ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={`text-lg font-semibold leading-none tracking-tight text-[#003049] ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        className={`text-sm text-[#003049]/70 ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={`p-6 pt-0 ${className || ""}`} ref={ref} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={`flex items-center p-6 pt-0 ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = "CardFooter"
