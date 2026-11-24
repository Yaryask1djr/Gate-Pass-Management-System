import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Enforce authentication
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pass = await passService.getPassById(id);
  if (!pass) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }

  // 2. IDOR Protection: Students may strictly view only their own gate passes
  if (user.role === "student" && pass.studentId !== user.id) {
    return NextResponse.json(
      { error: "Forbidden: You are not authorized to view another resident's gate pass" },
      { status: 403 }
    );
  }

  // Wardens may only inspect passes within their assigned hostels
  if (user.role === "admin" && user.adminProfile?.assignedHostels) {
    const assigned = user.adminProfile.assignedHostels;
    if (assigned.length > 0 && !assigned.includes(pass.hostel)) {
      return NextResponse.json(
        { error: "Forbidden: Pass belongs to a hostel outside your administrative jurisdiction" },
        { status: 403 }
      );
    }
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

    const pass = await passService.getPassById(id);
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Ensure warden is assigned to this pass's hostel
    if (user.adminProfile?.assignedHostels && user.adminProfile.assignedHostels.length > 0) {
      if (!user.adminProfile.assignedHostels.includes(pass.hostel)) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify passes outside your assigned hostel wings" },
          { status: 403 }
        );
      }
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
