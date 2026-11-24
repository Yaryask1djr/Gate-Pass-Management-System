import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { UserRole } from "@/types";
import { checkRateLimit } from "@/lib/security";

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

    // Rate Limiting: 10 attempts per minute per IP to prevent brute-force attacks
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimitKey = `login_${ip}_${email.toLowerCase()}`;
    const rateCheck = checkRateLimit(rateLimitKey, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${Math.ceil(
            rateCheck.resetMs / 1000
          )} seconds before trying again.`,
        },
        { status: 429 }
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
