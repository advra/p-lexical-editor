import { forwardRef } from "react";
import cn from "classnames";

type Variant = "default" | "outline" | "ghost" | "none";
type Size = "sm" | "md" | "lg" | "none";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer";

const variantStyles: Record<Variant, string> = {
  none: "",
  default: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-sky-500",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-sky-500",
};

const sizeStyles: Record<Size, string> = {
  none: "",
  sm: "h-8 px-3 text-sm",
  md: "h-8 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "none", size = "none", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
