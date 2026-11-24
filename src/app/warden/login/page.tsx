import { redirect } from "next/navigation";

export default function WardenLoginRedirect() {
  redirect("/admin/login");
}
