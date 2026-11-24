import { redirect } from "next/navigation";

export default function WardenSignupRedirect() {
  redirect("/admin/signup");
}
