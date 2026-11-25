import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts from this network. Please retry in ${Math.ceil(
            rateCheck.resetMs / 1000
          )} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, staffSecret, studentProfile, adminProfile, guardProfile } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    // Privilege Escalation Guard: Prevent unauthorized self-registration of administrative roles
    if (role === "admin" || role === "guard") {
      const expectedSecret = process.env.STAFF_REGISTRATION_KEY || "CAMPUS-STAFF-2025";
      const providedSecret = staffSecret || request.headers.get("x-staff-secret");
      if (!providedSecret || providedSecret.trim() !== expectedSecret) {
        return NextResponse.json(
          {
            error: "Forbidden: Valid staff authorization code required to onboard supervisory or security accounts.",
          },
          { status: 403 }
        );
      }
    }

    const newUser = await authService.createUser({
      name,
      email,
      role,
      passwordHash: password,
      studentProfile,
      adminProfile,
      guardProfile,
    });

    const sessionToken = authService.createSession(newUser.id);
    const { passwordHash, ...safeUser } = newUser as any;

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: safeUser,
    });

    response.cookies.set("passguard_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create account" },
      { status: 400 }
    );
  }
}
