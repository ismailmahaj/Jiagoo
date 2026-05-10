import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "ADMIN";
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    firstName?: string;
    lastName?: string;
  }
}
