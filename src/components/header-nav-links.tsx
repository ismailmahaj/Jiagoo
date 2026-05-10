"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export function HeaderNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap items-center justify-center gap-4 lg:gap-5 xl:gap-7">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`relative text-xs font-medium tracking-wide text-fhj-gold transition-colors hover:text-fhj-gold-light xl:text-sm ${
                active ? "opacity-100" : "opacity-90"
              }`}
            >
              {item.label}
              {active && (
                <span
                  className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-fhj-gold"
                  aria-hidden
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
