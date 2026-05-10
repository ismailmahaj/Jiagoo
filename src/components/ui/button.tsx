import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-fhj-gold text-fhj-navy font-medium shadow-sm hover:bg-fhj-gold-light transition-colors",
  secondary:
    "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors",
  ghost: "text-fhj-navy hover:text-fhj-gold transition-colors border border-fhj-navy/15 hover:border-fhj-gold/40",
};

export function Button({
  className = "",
  variant = "primary",
  href,
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; href?: string; className?: string }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
