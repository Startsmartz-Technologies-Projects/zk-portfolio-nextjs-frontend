import { redirect } from "next/navigation";

// `/admin` → the Dashboard landing (built out in Admin Wave 5).
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
