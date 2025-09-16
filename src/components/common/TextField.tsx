import React, { forwardRef } from "react";
import cn from "classnames";

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode | boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md";
  compact?: boolean; // compact variant with subtle borders
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  // Note pulling out dangerouslySetInnerHTML and children so they dont pass into ..rest
  const {
    label,
    description,
    error,
    id,
    className,
    inputClassName,
    size,
    compact = false,
    iconLeft,
    iconRight,
    disabled,
    dangerouslySetInnerHTML,
    children,
    ...rest
  } = props;

  // Resolve size without narrowing to a single literal type
  const resolvedSize: "sm" | "md" = size ?? "md";
  const hasError = Boolean(error);
  const inputId = id ?? `textfield-${Math.random().toString(36).slice(2, 9)}`;
  const describedBy = hasError ? `${inputId}-error` : description ? `${inputId}-desc` : undefined;

  // Base input styles modeled after shadcn subtle/compact look
  const base = cn(
    // layout & base tokens
    "block w-full rounded-md transition-colors placeholder:text-slate-400",
    // subtle border vs thicker border
    compact
      ? "border bg-transparent border-slate-200"
      : "border bg-white border-slate-200",
    // focus
    "focus:outline-none focus:ring-1 focus:ring-sky-500",
    // error
    hasError
      ? "border-red-400 text-red-900 focus:ring-red-500"
      : "",
    // disabled
    disabled ? "opacity-60 cursor-not-allowed" : "cursor-text",
    inputClassName
  );

  // size classes
  const sizeClasses = resolvedSize === "sm" ? "px-2 py-1 text-sm" : "px-3 py-2 text-sm";

  // icon padding adjustments
  const paddingWithIcons = cn({
    "pl-9": iconLeft && !iconRight,
    "pr-9": iconRight && !iconLeft,
    "pl-9 pr-9": iconLeft && iconRight,
  });

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className={cn("relative flex items-center")}>
        {iconLeft && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            {iconLeft}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(base, sizeClasses, paddingWithIcons)}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />

        {iconRight && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
            {iconRight}
          </div>
        )}
      </div>

      {description && !hasError && (
        <p id={`${inputId}-desc`} className="mt-1 text-xs text-slate-500 ">
          {description}
        </p>
      )}

      {hasError && (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-red-600  flex items-center gap-2">
          {typeof error === "boolean" ? "Invalid input" : error}
        </p>
      )}
    </div>
  );
});

TextField.displayName = "TextField";

export default TextField;
