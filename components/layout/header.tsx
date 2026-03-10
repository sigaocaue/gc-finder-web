import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Church } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base leading-tight text-foreground">
              GC Finder
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Lagoinha Jundiaí
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
