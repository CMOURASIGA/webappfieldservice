import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth/config";
import { redirect } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default async function ProtectedLayout({
  children,
  allowedRoles,
}: ProtectedLayoutProps) {
  const session = await getServerSession(authOptions);
  const role = session?.company?.role as string;

  if (!session || !allowedRoles.includes(role)) {
    redirect("/");
  }

  return <>{children}</>;
}
