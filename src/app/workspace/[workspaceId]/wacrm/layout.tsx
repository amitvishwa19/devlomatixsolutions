import { ReactNode } from "react";
import { AuthProvider } from "./_hooks/use-auth";
import { AuthGuard } from "./_components/auth-guard";

export default function WaCrmLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
