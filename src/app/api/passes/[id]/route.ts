import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pass = await passService.getPassById(id);
  if (!pass) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }

  return NextResponse.json({ pass });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Only wardens and campus administrators can update pass statuses" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updated = await passService.updatePassStatus(
      id,
      status,
      remarks,
      user.name
    );

    return NextResponse.json({ success: true, pass: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update pass" },
      { status: 400 }
    );
  }
}
