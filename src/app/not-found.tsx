import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <p className="font-serif text-6xl font-bold text-gold/20">404</p>
        <h1 className="font-serif text-2xl font-bold text-ivory">
          Page Not Found
        </h1>
        <p className="max-w-xs text-sm text-ivory/40">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={14} />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
