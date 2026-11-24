import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
