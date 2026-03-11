"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Mail, Lock, Loader2, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, setAccessToken } from "@/lib/api";
import type { AuthTokens } from "@/types";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues:
      process.env.NODE_ENV === "development"
        ? { email: "admin@gcfinder.com", password: "admin123" }
        : undefined,
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await api<AuthTokens>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.data) {
        toast.error("Resposta inválida do servidor");
        return;
      }

      setAccessToken(response.data.access_token);

      // Salva o refresh token como cookie para o middleware validar a sessão
      const maxAge = response.data.expires_in * 10;
      document.cookie = `refresh_token=${response.data.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax`;

      window.location.href = "/admin";
    } catch {
      toast.error("Email ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-lg">
        {/* Ícone do logo */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex size-20 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-10 text-primary" strokeWidth={2.2} />
            <Heart
              className="absolute top-3.5 size-4 text-warm"
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
        </div>

        {/* Título */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to GC Finder
            <br />
            Lagoinha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-center text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-center text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botão Sign in */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => toast.info("Entre em contato com o administrador")}
          >
            Forgot password?
          </button>
          <span className="text-muted-foreground">
            Need an account?{" "}
            <button
              type="button"
              className="font-semibold text-foreground hover:underline"
              onClick={() =>
                toast.info("O cadastro é controlado pelo administrador")
              }
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
