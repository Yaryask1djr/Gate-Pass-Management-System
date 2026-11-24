import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;

  if (sessionToken) {
    authService.invalidateSession(sessionToken);
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("passguard_session");
  return response;
}
