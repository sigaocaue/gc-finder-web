"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, StatsCountsResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Church, Crown, UserCog, CalendarDays } from "lucide-react";

export default function AdminPage() {
  const { data: statsCountsResponse, isLoading } = useQuery({
    queryKey: ["admin-stats-counts"],
    queryFn: () =>
      api<ApiResponse<StatsCountsResponse>>("/stats/counts", {
        authenticated: true,
      }),
  });

  const statsCounts = statsCountsResponse?.data;

  const summaryCards = [
    {
      title: "GCs",
      value: statsCounts?.gcs ?? 0,
      icon: Church,
      color: "text-orange-500",
    },
    {
      title: "Líderes de GCs",
      value: statsCounts?.leaders ?? 0,
      icon: Crown,
      color: "text-green-500",
    },
    {
      title: "Usuários administrativos",
      value: statsCounts?.users ?? 0,
      icon: UserCog,
      color: "text-blue-500",
    },
    {
      title: "Reuniões",
      value: statsCounts?.meetings ?? 0,
      icon: CalendarDays,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do sistema
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{card.value}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
