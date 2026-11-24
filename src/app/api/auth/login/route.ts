import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    const user = await authService.verifyCredentials(email, password, role);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or unauthorized role for this account." },
        { status: 401 }
      );
    }

    const sessionToken = authService.createSession(user.id);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user,
    });

    // Set secure HTTP-Only cookie
    response.cookies.set("passguard_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
