import { NextRequest, NextResponse } from "next/server";
import { passService } from "@/lib/pass-service";

export async function GET(request: NextRequest) {
  const logs = await passService.getCheckpointLogs();
  return NextResponse.json({ logs });
}
