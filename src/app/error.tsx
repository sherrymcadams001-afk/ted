"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10">
          <span className="font-serif text-2xl text-burgundy-300">!</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-ivory">
          Something went wrong
        </h1>
        <p className="max-w-xs text-sm text-ivory/40">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw size={14} />
          Try Again
        </Button>
      </div>
    </div>
  );
}
