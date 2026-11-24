import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, studentProfile, adminProfile, guardProfile } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const newUser = authService.createUser({
      name,
      email,
      role,
      passwordHash: password,
      studentProfile,
      adminProfile,
      guardProfile,
    });

    const sessionToken = authService.createSession(newUser.id);
    const { passwordHash, ...safeUser } = newUser;

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
