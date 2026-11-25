import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized: Invalid or expired session" }, { status: 401 });
  }

  // Access Control: Checkpoint logs contain sensitive transit telemetry. Only guards and wardens may access.
  if (user.role !== "admin" && user.role !== "guard") {
    return NextResponse.json(
      { error: "Forbidden: Only checkpoint guards and hostel administrators can inspect gate audit logs" },
      { status: 403 }
    );
  }

  const logs = await passService.getCheckpointLogs();
  return NextResponse.json({ logs });
}
