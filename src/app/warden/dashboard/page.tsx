import { redirect } from "next/navigation";

export default function WardenDashboardRedirect() {
  redirect("/admin/dashboard");
}
