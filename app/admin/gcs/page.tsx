"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Pencil,
  ToggleLeft,
  ToggleRight,
  MapPin,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

interface GcListResponse {
  id: string;
  name: string;
  isActive: boolean;
  address: {
    city: string;
  };
  meetings: {
    dayOfWeek: string;
  }[];
}

type GcListApiResponse = GcListResponse[] | { data: GcListResponse[] };

export default function AdminGcsPage() {
  const [search, setSearch] = useState("");
  const [toggleTarget, setToggleTarget] = useState<GcListResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: groupsResponse, isLoading } = useQuery<GcListApiResponse>({
    queryKey: ["admin-groups"],
    queryFn: () =>
      api<GcListApiResponse>("/gcs", { authenticated: true }),
  });

  const groups = Array.isArray(groupsResponse)
    ? groupsResponse
    : groupsResponse?.data ?? [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api(`/gcs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
        authenticated: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success("Status atualizado.");
      setToggleTarget(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = groups.filter((g) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      g.name?.toLowerCase().includes(normalizedSearch) ||
      g.address?.city?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-5xl">
          {/* Cabeçalho */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Grupos de Crescimento</h1>
              <p className="text-sm text-muted-foreground">
                {groups.length} grupos cadastrados
              </p>
            </div>
            <Link href="/admin/gcs/novo">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 size-4" /> Novo GC
              </Button>
            </Link>
          </div>

          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Buscar GCs"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((gc) => (
                      <TableRow key={gc.id}>
                        <TableCell className="font-medium">
                          {gc.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {gc.address?.city}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {gc.meetings?.[0]?.dayOfWeek ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge isActive={gc.isActive} />
                        </TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Link href={`/admin/gcs/${gc.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar GC"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToggleTarget(gc)}
                            aria-label={
                              gc.isActive ? "Desativar GC" : "Ativar GC"
                            }
                          >
                            {gc.isActive ? (
                              <ToggleRight className="size-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards mobile */}
              <div className="space-y-3 md:hidden">
                {filtered.map((gc) => (
                  <Card key={gc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{gc.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" /> {gc.address?.city}
                            {gc.meetings?.[0]?.dayOfWeek &&
                              ` · ${gc.meetings[0].dayOfWeek}`}
                          </p>
                        </div>
                        <StatusBadge isActive={gc.isActive} />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/admin/gcs/${gc.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Pencil className="mr-1 size-3" /> Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setToggleTarget(gc)}
                        >
                          {gc.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhum GC encontrado.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de confirmação */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={() => setToggleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isActive ? "Desativar" : "Ativar"} GC
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja{" "}
              {toggleTarget?.isActive ? "desativar" : "ativar"} o GC &quot;
              {toggleTarget?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toggleTarget) {
                  toggleMutation.mutate({
                    id: toggleTarget.id,
                    isActive: toggleTarget.isActive,
                  });
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? "rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "rounded-full bg-muted text-xs text-muted-foreground"
      }
    >
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}
