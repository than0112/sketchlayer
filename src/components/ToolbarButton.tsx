import type { ButtonHTMLAttributes, ReactNode } from "react";

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

export function ToolbarButton({ label, icon, active, className = "", ...props }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`toolbar-button ${active ? "is-active" : ""} ${className}`.trim()}
      aria-label={label}
      aria-pressed={active}
      title={label}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
