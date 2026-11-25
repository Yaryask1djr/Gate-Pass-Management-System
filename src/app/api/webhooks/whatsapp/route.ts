import { NextRequest, NextResponse } from "next/server";
import { passService } from "@/lib/pass-service";
import { verifyConsentHmac } from "@/lib/security";

/**
 * Meta WhatsApp Business Webhook Endpoint
 * 
 * GET: Webhook verification challenge from Meta developers portal OR signed 1-tap parent approval link.
 * POST: Inbound webhook events (parent taps "Approve" / "Decline" interactive button or replies).
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 1. Meta Webhook Verification Handshake
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "passguard_whatsapp_webhook_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  // 2. Direct Signed 1-Tap Browser Consent URL Support (e.g. from parent email/link)
  const passId = searchParams.get("passId");
  const action = searchParams.get("action"); // "approve" | "reject"
  const signatureToken = searchParams.get("token");

  if (passId && action) {
    // Cryptographic signature check prevents URL enumeration and unauthorized approvals
    if (!signatureToken || !verifyConsentHmac(passId, action, signatureToken)) {
      return NextResponse.json(
        { error: "Forbidden: Invalid, tampered, or missing cryptographic consent signature token" },
        { status: 403 }
      );
    }

    const pass = await passService.getPassById(passId);
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const consentStatus = action === "approve" ? "Approved" : "Declined";
    const updatedPass = await passService.updateParentConsent(
      passId,
      consentStatus,
      "WhatsApp",
      action === "reject" ? "Declined by Parent via WhatsApp Link" : undefined
    );

    return NextResponse.json({
      success: true,
      message: `Parent consent recorded: ${consentStatus}`,
      pass: updatedPass,
    });
  }

  return NextResponse.json({ error: "Invalid webhook verification request" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Meta WhatsApp Cloud API Event Payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true, note: "No message in event payload" });
    }

    let passId: string | null = null;
    let isApproved = false;
    let isDeclined = false;

    // A. Check for Interactive Button Reply (e.g. button id: APPROVE_GP-9422)
    if (message.type === "interactive" && message.interactive?.button_reply) {
      const buttonId: string = message.interactive.button_reply.id;
      if (buttonId.startsWith("APPROVE_")) {
        passId = buttonId.replace("APPROVE_", "").trim();
        isApproved = true;
      } else if (buttonId.startsWith("DECLINE_")) {
        passId = buttonId.replace("DECLINE_", "").trim();
        isDeclined = true;
      }
    }

    // B. Check for plain text reply (e.g. "YES GP-9422" or "NO GP-9422")
    if (!passId && message.type === "text" && message.text?.body) {
      const text: string = message.text.body.trim().toUpperCase();
      const match = text.match(/^(YES|NO|APPROVE|DECLINE)\s*(GP-\d+)?/i);
      if (match) {
        const command = match[1];
        passId = match[2] || null;
        isApproved = command === "YES" || command === "APPROVE";
        isDeclined = command === "NO" || command === "DECLINE";
      }
    }

    if (!passId) {
      return NextResponse.json({ received: true, note: "Message did not match gate pass pattern" });
    }

    const pass = await passService.getPassById(passId);
    if (!pass) {
      return NextResponse.json({ error: `Pass ${passId} not found` }, { status: 404 });
    }

    const consentStatus = isApproved ? "Approved" : "Declined";
    const updatedPass = await passService.updateParentConsent(
      passId,
      consentStatus,
      "WhatsApp",
      isDeclined ? "Declined by Parent/Guardian via WhatsApp webhook" : undefined
    );

    return NextResponse.json({
      success: true,
      passId,
      consentRecorded: consentStatus,
      updatedStatus: updatedPass.status,
    });
  } catch (err: any) {
    console.error("WhatsApp webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
