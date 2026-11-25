import { NextRequest, NextResponse } from "next/server";
import { passService } from "@/lib/pass-service";

/**
 * Twilio Inbound SMS Webhook Endpoint
 * 
 * Processes incoming parent SMS replies (e.g. "YES GP-9422" or "NO GP-9422")
 * and responds with compliant TwiML messaging XML.
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bodyText = (formData.get("Body") as string || "").trim().toUpperCase();
    const fromNumber = (formData.get("From") as string || "");

    // Regex to extract command (YES/NO/APPROVE/DECLINE) and optional Pass ID (e.g. GP-9422)
    const match = bodyText.match(/^(YES|NO|APPROVE|DECLINE)\s*(GP-\d+)?/i);

    let replyMessage = "PassGuard: Invalid format. Please reply 'YES GP-XXXX' to approve or 'NO GP-XXXX' to decline.";

    if (match) {
      const action = match[1];
      const passId = match[2];

      if (passId) {
        const pass = await passService.getPassById(passId);
        if (pass) {
          const isApproved = action === "YES" || action === "APPROVE";
          const consentStatus = isApproved ? "Approved" : "Declined";

          const updatedPass = await passService.updateParentConsent(
            passId,
            consentStatus,
            "SMS",
            !isApproved ? "Declined by Parent via SMS response" : undefined
          );

          if (isApproved) {
            replyMessage = `PassGuard: Thank you. Your approval for ${updatedPass.studentName}'s pass (${updatedPass.id}) has been recorded.`;
          } else {
            replyMessage = `PassGuard: Notice received. Pass (${updatedPass.id}) has been declined.`;
          }
        } else {
          replyMessage = `PassGuard: Pass ID ${passId} was not found in the campus registry.`;
        }
      }
    }

    // Return standard TwiML XML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyMessage}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err: any) {
    console.error("Twilio SMS webhook error:", err);
    return new NextResponse(
      `<Response><Message>PassGuard: Service error recording consent.</Message></Response>`,
      { status: 500, headers: { "Content-Type": "text/xml" } }
    );
  }
}
