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
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer";

const variantStyles: Record<Variant, string> = {
  none: "",
  default: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-sky-500",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-sky-500",
};

const sizeStyles: Record<Size, string> = {
  none: "",
  sm: "px-3 py-1.5 text-sm min-h-[32px] leading-none",
  md: "px-4 py-2 text-sm min-h-[36px] leading-none",
  lg: "px-6 py-3 text-base min-h-[44px] leading-none",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "none", size = "md", children, ...props }, ref) => {
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
