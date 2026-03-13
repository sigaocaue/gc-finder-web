"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  MapPin,
  Heart,
  Users,
  UserCog,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin/gcs", label: "GCs", icon: MapPin },
  { href: "/admin/lideres", label: "Líderes", icon: Users },
  { href: "/admin/users", label: "Usuários", icon: UserCog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão mobile para abrir o menu */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo e botão fechar */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative flex size-8 items-center justify-center rounded-full bg-muted">
              <MapPin className="size-4 text-primary" />
              <Heart
                className="absolute top-0.5 size-2 text-warm"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <span className="text-sm font-bold text-foreground">GC Finder</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé */}
        <div className="border-t p-3">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={logout}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
