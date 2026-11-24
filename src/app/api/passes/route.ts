import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";
import { sendParentConsentRequest } from "@/lib/parent-notification";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "student") {
    const passes = await passService.getPassesByStudent(user.id);
    return NextResponse.json({ passes });
  }

  if (user.role === "admin") {
    const assignedHostels = user.adminProfile?.assignedHostels;
    const allPasses = await passService.getAllPasses();
    const passes = allPasses.filter((p) => {
      if (!assignedHostels || assignedHostels.length === 0) return true;
      return assignedHostels.includes(p.hostel);
    });
    return NextResponse.json({ passes });
  }

  // Guard role
  const passes = await passService.getApprovedPasses();
  return NextResponse.json({ passes });
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authService.getUserFromSession(sessionToken);
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Only students can apply for gate passes" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { passType, destination, reason, departureTime, expectedReturnTime } = body;

    if (!passType || !destination || !reason || !departureTime || !expectedReturnTime) {
      return NextResponse.json({ error: "All pass fields are required" }, { status: 400 });
    }

    // Chronological date validation
    const depTime = new Date(departureTime).getTime();
    const retTime = new Date(expectedReturnTime).getTime();

    if (isNaN(depTime) || isNaN(retTime)) {
      return NextResponse.json(
        { error: "Departure and expected return times must be valid ISO date strings" },
        { status: 400 }
      );
    }

    if (retTime <= depTime) {
      return NextResponse.json(
        { error: "Expected return time must be strictly after scheduled departure time" },
        { status: 400 }
      );
    }

    if (retTime - depTime > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "A single gate pass cannot exceed 30 consecutive days in duration" },
        { status: 400 }
      );
    }

    const newPass = await passService.createPass({
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.studentProfile?.rollNumber || "N/A",
      hostel: user.studentProfile?.hostel || "NCH-A",
      roomNumber: user.studentProfile?.roomNumber || "N/A",
      passType,
      destination,
      reason,
      departureTime,
      expectedReturnTime,
    });

    // Automatically trigger parent consent dispatch for overnight or emergency leaves
    if (newPass.passType !== "Day") {
      sendParentConsentRequest(newPass).catch((err) =>
        console.error("Failed to dispatch parent consent notification:", err)
      );
    }

    return NextResponse.json({ success: true, pass: newPass }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create pass" }, { status: 500 });
  }
}
