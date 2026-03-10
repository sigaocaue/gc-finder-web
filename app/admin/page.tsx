import { redirect } from "next/navigation";

// Redireciona /admin para /admin/gcs
export default function AdminPage() {
  redirect("/admin/gcs");
}
