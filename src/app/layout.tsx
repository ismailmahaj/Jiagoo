import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Fondation Hassen Jiagoo",
    template: "%s | Fondation Hassen Jiagoo",
  },
  description:
    "Fondation humanitaire pour l’île Maurice : bourses et accompagnement des étudiantes. Faites un don sécurisé.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-dm-sans)]">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
