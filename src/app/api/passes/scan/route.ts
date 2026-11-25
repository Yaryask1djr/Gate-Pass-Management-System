import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { passService } from "@/lib/pass-service";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("passguard_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard = await authService.getUserFromSession(sessionToken);
  if (!guard || guard.role !== "guard") {
    return NextResponse.json(
      { error: "Only authorized checkpoint guards can process scan logs" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    let { passId, qrPayload, action } = body as {
      passId?: string;
      qrPayload?: string;
      action?: "OUT" | "IN";
    };

    // Parse passId from qrPayload or passId if QR JSON string was scanned
    const rawInput = (passId || qrPayload || "").trim();
    if (rawInput.startsWith("{")) {
      try {
        const parsed = JSON.parse(rawInput);
        if (parsed.passId) {
          passId = parsed.passId;
        }
      } catch {
        // Raw string might be the passId itself
        passId = rawInput;
      }
    } else if (!passId && qrPayload) {
      passId = qrPayload.trim();
    }

    if (!passId) {
      return NextResponse.json(
        { error: "Pass ID or valid QR payload is required" },
        { status: 400 }
      );
    }

    const pass = await passService.getPassById(passId);
    if (!pass) {
      return NextResponse.json(
        { error: `Pass ${passId} does not exist in registry` },
        { status: 404 }
      );
    }

    // Status validation
    if (pass.status === "Pending" || pass.status === "ParentApproved") {
      return NextResponse.json(
        {
          error: "Pass has not yet been approved by the Hostel Warden",
          pass,
          code: "NOT_APPROVED",
        },
        { status: 400 }
      );
    }

    if (pass.status === "Rejected") {
      return NextResponse.json(
        {
          error: "Pass was REJECTED by supervisory authority",
          pass,
          code: "REJECTED",
        },
        { status: 400 }
      );
    }

    if (pass.status === "Completed") {
      return NextResponse.json(
        {
          error: "Pass has already been completed and closed",
          pass,
          code: "ALREADY_COMPLETED",
        },
        { status: 400 }
      );
    }

    // Auto-determine action: if Approved -> exit OUT; if CheckedOut -> return IN
    const determinedAction: "OUT" | "IN" =
      action || (pass.status === "Approved" ? "OUT" : "IN");

    const gate = guard.guardProfile?.assignedGate || "Main Campus Gate 1";
    const { pass: updatedPass, log } = await passService.recordCheckpointScan(
      pass.id,
      guard.id,
      guard.name,
      gate,
      determinedAction
    );

    return NextResponse.json({
      success: true,
      action: determinedAction,
      pass: updatedPass,
      log,
      message:
        determinedAction === "OUT"
          ? `Cleared for Campus Exit at ${gate}`
          : `Checked In and Returned to Campus at ${gate}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process scan" },
      { status: 500 }
    );
  }
}
