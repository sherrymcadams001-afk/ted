"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  // Unauthenticated — show sign-in prompt
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-gold md:text-5xl">
          Account
        </h1>
        <p className="max-w-xs text-sm text-ivory/40">
          Sign in to manage your celebrations, chat with concierge, and track orders.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button className="gap-2">
              <LogIn size={16} />
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
