import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Enforce warden authentication for manual administrative consent override
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Only authorized hostel wardens can record manual parent consent overrides" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { consent } = body as { consent: "Approved" | "Declined" };

    if (!consent || (consent !== "Approved" && consent !== "Declined")) {
      return NextResponse.json(
        { error: "Consent must be strictly 'Approved' or 'Declined'" },
        { status: 400 }
      );
    }

    const pass = await passService.getPassById(id);
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const updatedPass = await passService.updateParentConsent(
      id,
      consent,
      "Manual",
      `Manually marked as ${consent} by Warden ${user.name}`
    );

    return NextResponse.json({ success: true, pass: updatedPass });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to record parent consent" },
      { status: 500 }
    );
  }
}
