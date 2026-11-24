import { NextRequest, NextResponse } from "next/server";
import { passService } from "@/lib/pass-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { consent } = body as { consent: "Approved" | "Declined" };

    const pass = await passService.getPassById(id);
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    pass.parentConsent = {
      status: consent,
      verifiedAt: new Date().toISOString(),
      method: "WhatsApp",
    };

    if (consent === "Approved" && pass.status === "Pending") {
      pass.status = "ParentApproved";
    } else if (consent === "Declined") {
      pass.status = "Rejected";
      pass.wardenRemarks = "Declined by Parent/Guardian via WhatsApp";
    }

    return NextResponse.json({ success: true, pass });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to record parent consent" },
      { status: 500 }
    );
  }
}
