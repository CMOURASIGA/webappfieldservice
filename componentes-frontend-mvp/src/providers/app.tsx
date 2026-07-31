"use client";
import { SessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}
export function AppProvider({ children }: Props) {
  const bypassAuth = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
  if (bypassAuth) {
    const mockSession: any = {
      expires: new Date(Date.now() + 2 * 86400).toISOString(),
      user: { name: "Test User", email: "test@example.com" },
      company: { role: "admin", name: "Test Entity", id: 1 }
    };
    return <SessionProvider session={mockSession}>{children}</SessionProvider>;
  }
  return <SessionProvider>{children}</SessionProvider>;
}
