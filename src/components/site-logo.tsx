import Link from "next/link";

function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M24 4L28 12L36 10L32 18L40 24L32 30L36 38L28 36L24 44L20 36L12 38L16 30L8 24L16 18L12 10L20 12L24 4Z"
        fill="url(#goldGrad)"
        opacity="0.35"
      />
      <path d="M24 6L26 11H31L27 14L29 19L24 16L19 19L21 14L17 11H22L24 6Z" fill="url(#goldGrad)" />
      <path
        d="M14 22H34V24C34 30.6274 29.6274 35 24 35C18.3726 35 14 30.6274 14 24V22Z"
        stroke="url(#goldGrad)"
        strokeWidth="2"
        fill="none"
      />
      <path d="M18 22V26C18 28.5 20.5 31 24 31C27.5 31 30 28.5 30 26V22" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
      <defs>
        <linearGradient id="goldGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c547" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#c5a059" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SiteLogo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
      <LogoMark className={compact ? "h-8 w-8 shrink-0" : "h-9 w-9 shrink-0 md:h-10 md:w-10"} />
      <span
        className={`font-[family-name:var(--font-playfair)] font-semibold uppercase tracking-[0.12em] text-fhj-gold ${
          compact ? "text-xs leading-tight" : "text-[11px] leading-snug md:text-xs"
        }`}
      >
        Fondation
        <br />
        Hassen Jiagoo
      </span>
    </Link>
  );
}
