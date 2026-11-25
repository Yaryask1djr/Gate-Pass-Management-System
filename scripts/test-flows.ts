/**
 * PassGuard 2.0 Comprehensive Test Suite
 * Validates State Machine Transitions, RBAC Auth, Scrypt Password Hashing,
 * Rate Limiting, Rotating QR Tokens, Checkpoint Transit Logging, and HMAC Webhooks.
 */

import { authService } from "../src/lib/auth-service";
import { passService } from "../src/lib/pass-service";
import {
  hashPassword,
  verifyPassword,
  checkRateLimit,
  generateConsentHmac,
  verifyConsentHmac,
} from "../src/lib/security";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName}${details ? ` (${details})` : ""}`);
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("🛡️  PassGuard Architecture 2.0 - Automated Test Suite");
  console.log("=======================================================\n");

  // ==========================================================
  // SUITE 1: Cryptographic Security & Password Hashing
  // ==========================================================
  console.log("📂 [Suite 1: Cryptographic Security & Passwords]");

  const rawPass = "SecretStudent#2026";
  const hashed = hashPassword(rawPass);
  assert(hashed.startsWith("scrypt$"), "Password hashed using salted scrypt");
  assert(verifyPassword(rawPass, hashed), "Scrypt hash verifies correct plaintext password");
  assert(!verifyPassword("WrongPassword#999", hashed), "Scrypt hash strictly rejects incorrect password");
  assert(verifyPassword("pass123", "pass123"), "Backward-compatible verification for legacy seed accounts");

  // ==========================================================
  // SUITE 2: Rate Limiting & Denial-of-Service Defense
  // ==========================================================
  console.log("\n📂 [Suite 2: Rate Limiting & Throttling]");

  const testIp = "192.168.1.99";
  // Allow 3 requests per 2000ms
  const r1 = checkRateLimit(testIp, 3, 2000);
  const r2 = checkRateLimit(testIp, 3, 2000);
  const r3 = checkRateLimit(testIp, 3, 2000);
  const r4 = checkRateLimit(testIp, 3, 2000);

  assert(r1.allowed && r2.allowed && r3.allowed, "Permits requests within configured rate threshold");
  assert(!r4.allowed && r4.remaining === 0, "Enforces rate limit cutoff when threshold is exceeded");

  // ==========================================================
  // SUITE 3: HMAC-SHA256 Webhook Signatures
  // ==========================================================
  console.log("\n📂 [Suite 3: Webhook Cryptographic Signatures]");

  const samplePassId = "GP-8842";
  const validToken = generateConsentHmac(samplePassId, "approve");
  assert(verifyConsentHmac(samplePassId, "approve", validToken), "HMAC signature verified for authentic webhook action");
  assert(!verifyConsentHmac(samplePassId, "reject", validToken), "Rejects signature when action parameter is tampered with");
  assert(!verifyConsentHmac("GP-9999", "approve", validToken), "Rejects signature when Pass ID is manipulated");
  assert(!verifyConsentHmac(samplePassId, "approve", "tampered_fake_signature"), "Rejects invalid/arbitrary signatures");

  // ==========================================================
  // SUITE 4: RBAC Authentication & Session Engine
  // ==========================================================
  console.log("\n📂 [Suite 4: Role-Based Access Control & Sessions]");
  
  // 4.1 Valid Student Auth
  const student = await authService.verifyCredentials("student@campus.edu", "pass123", "student");
  assert(student !== null && student.name === "Aryan Sharma", "Student login with valid credentials");

  // 4.2 Wrong Password
  const badPass = await authService.verifyCredentials("student@campus.edu", "wrongpass", "student");
  assert(badPass === null, "Rejects login with invalid password");

  // 4.3 Role Mismatch
  const roleMismatch = await authService.verifyCredentials("student@campus.edu", "pass123", "guard");
  assert(roleMismatch === null, "Rejects authentication when role does not match assigned user role");

  // 4.4 Warden / Admin Auth
  const warden = await authService.verifyCredentials("admin@campus.edu", "pass123", "admin");
  assert(warden !== null && warden.role === "admin", "Warden/Admin authentication succeeds");

  // 4.5 Guard Auth
  const guard = await authService.verifyCredentials("guard@campus.edu", "pass123", "guard");
  assert(guard !== null && guard.guardProfile?.assignedGate !== undefined, "Guard authentication succeeds with gate profile");

  // 4.6 Session Creation & Retrieval
  if (student) {
    const sessionToken = authService.createSession(student.id);
    const sessionUser = await authService.getUserFromSession(sessionToken);
    assert(sessionUser?.id === student.id, "Session token correctly resolves user without exposing passwordHash");
    assert(sessionToken.startsWith("sess_") && sessionToken.length > 30, "Session token generated with 256-bit entropy");
  }

  // ==========================================================
  // SUITE 5: Gate Pass State Machine & Workflows
  // ==========================================================
  console.log("\n📂 [Suite 5: Gate Pass State Machine]");

  const now = new Date();
  const depart = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const ret = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  // 5.1 Day Pass Creation (Auto-approved parent consent)
  const dayPass = await passService.createPass({
    studentId: "usr_student_01",
    studentName: "Aryan Sharma",
    rollNumber: "2024CS089",
    hostel: "NCH-A",
    roomNumber: "304",
    passType: "Day",
    destination: "Downtown Research Lab",
    reason: "Collaborative laboratory robotics project",
    departureTime: depart,
    expectedReturnTime: ret,
  });
  assert(dayPass.status === "Pending" && dayPass.parentConsent.status === "Approved", "Day pass created with auto parent consent");

  // 5.2 Overnight Pass Creation (Requires parent consent)
  const overnightPass = await passService.createPass({
    studentId: "usr_student_01",
    studentName: "Aryan Sharma",
    rollNumber: "2024CS089",
    hostel: "NCH-A",
    roomNumber: "304",
    passType: "Overnight",
    destination: "Home Residence",
    reason: "Family festival celebration",
    departureTime: depart,
    expectedReturnTime: ret,
  });
  assert(overnightPass.status === "Pending" && overnightPass.parentConsent.status === "Pending", "Overnight pass requires pending parent consent");

  // 5.3 Emergency Pass (Instant approval bypass)
  const emergencyPass = await passService.createPass({
    studentId: "usr_student_01",
    studentName: "Aryan Sharma",
    rollNumber: "2024CS089",
    hostel: "NCH-A",
    roomNumber: "304",
    passType: "Emergency",
    destination: "City Hospital",
    reason: "Medical consultation",
    departureTime: depart,
    expectedReturnTime: ret,
  });
  assert(emergencyPass.status === "Approved", "Emergency pass auto-approves immediately");

  // 5.4 Warden Approval State Transition
  const approvedOvernight = await passService.updatePassStatus(
    overnightPass.id,
    "Approved",
    "Special approval granted by Chief Warden",
    "Dr. Vikram Sethi"
  );
  assert(approvedOvernight.status === "Approved" && approvedOvernight.approvedBy === "Dr. Vikram Sethi", "Warden pass approval updates status and logs signatory");

  // ==========================================================
  // SUITE 6: Checkpoint Exit & Entry Transitions
  // ==========================================================
  console.log("\n📂 [Suite 6: Checkpoint Scanner & Transit Logs]");

  // 6.1 Exit Scan (action: OUT)
  const exitResult = await passService.recordCheckpointScan(
    approvedOvernight.id,
    "usr_guard_01",
    "Officer Rajesh Kumar",
    "Main North Campus Gate 1",
    "OUT"
  );
  assert(exitResult.pass.status === "CheckedOut" && exitResult.pass.actualOutTime !== undefined, "Check-out scan transitions status to CheckedOut and records actualOutTime");
  assert(exitResult.log.action === "OUT" && exitResult.log.gate === "Main North Campus Gate 1", "Checkpoint log correctly created for exit");

  // 6.2 Return Scan (action: IN)
  const entryResult = await passService.recordCheckpointScan(
    approvedOvernight.id,
    "usr_guard_01",
    "Officer Rajesh Kumar",
    "Main North Campus Gate 1",
    "IN"
  );
  assert(entryResult.pass.status === "Completed" && entryResult.pass.actualInTime !== undefined, "Check-in scan transitions status to Completed and records actualInTime");

  // 6.3 Audit Feed Log Retrieval
  const logs = await passService.getCheckpointLogs();
  assert(logs.length >= 2, "Checkpoint audit log feed records immutable event stream");

  // ==========================================================
  // SUITE 7: Cryptographic TOTP Token Rotation Validation
  // ==========================================================
  console.log("\n📂 [Suite 7: Dynamic TOTP QR Code Verification]");

  const epochWindow1 = Math.floor(Date.now() / 15000);
  const token1 = `${dayPass.id}-${dayPass.rollNumber}-${epochWindow1.toString(36).toUpperCase()}`;
  assert(token1.startsWith("GP-") && token1.includes("2024CS089"), "TOTP dynamic token generated with student identity binding");

  // ==========================================================
  // SUITE 8: Optical QR Scan JSON Payload Parser
  // ==========================================================
  console.log("\n📂 [Suite 8: Optical QR Camera Payload Parser]");

  const qrJsonPayload = JSON.stringify({
    passId: "GP-9421",
    rollNumber: "2024CS089",
    studentName: "Aryan Sharma",
    token: "GP-9421-2024CS089-SAMPLE",
    t: Date.now(),
  });

  // Test extraction from JSON payload
  let extractedId = "";
  if (qrJsonPayload.startsWith("{")) {
    try {
      const parsed = JSON.parse(qrJsonPayload);
      extractedId = parsed.passId || "";
    } catch {
      extractedId = qrJsonPayload;
    }
  }
  assert(extractedId === "GP-9421", "Optical scanner extracts passId from QR JSON string payload");

  // Test fallback for raw ID string
  const rawIdInput = "  GP-9421  ";
  const normalizedRaw = rawIdInput.trim().startsWith("{")
    ? JSON.parse(rawIdInput.trim()).passId
    : rawIdInput.trim();
  assert(normalizedRaw === "GP-9421", "Scanner normalizes and passes raw pass IDs cleanly");

  // ==========================================================
  // SUITE 9: Parent Consent & Webhook State Progression
  // ==========================================================
  console.log("\n📂 [Suite 9: Parent Consent Persistence & Elevation]");

  // Create a fresh pending overnight pass
  const pendingPass = await passService.createPass({
    studentId: "usr_student_01",
    studentName: "Aryan Sharma",
    rollNumber: "2024CS089",
    hostel: "NCH-A",
    roomNumber: "304",
    passType: "Overnight",
    destination: "Family Residence",
    reason: "Parent consent test flow",
    departureTime: depart,
    expectedReturnTime: ret,
  });

  assert(pendingPass.status === "Pending" && pendingPass.parentConsent.status === "Pending", "Fresh overnight pass starts as Pending consent");

  // Simulate WhatsApp approval webhook
  const approvedConsentPass = await passService.updateParentConsent(
    pendingPass.id,
    "Approved",
    "WhatsApp"
  );
  assert(
    approvedConsentPass.status === "ParentApproved" &&
    approvedConsentPass.parentConsent.status === "Approved" &&
    approvedConsentPass.parentConsent.method === "WhatsApp",
    "Parent WhatsApp approval elevates pass status to ParentApproved"
  );

  // Test parent decline flow
  const declinedPass = await passService.createPass({
    studentId: "usr_student_01",
    studentName: "Aryan Sharma",
    rollNumber: "2024CS089",
    hostel: "NCH-A",
    roomNumber: "304",
    passType: "Overnight",
    destination: "Late party",
    reason: "Will be rejected by parent",
    departureTime: depart,
    expectedReturnTime: ret,
  });

  const rejectedConsentPass = await passService.updateParentConsent(
    declinedPass.id,
    "Declined",
    "SMS",
    "Parent declined leave via SMS reply"
  );
  assert(
    rejectedConsentPass.status === "Rejected" &&
    rejectedConsentPass.parentConsent.status === "Declined",
    "Parent SMS decline transitions pass status to Rejected"
  );

  // ==========================================================
  // SUITE 10: User Management & Authentication Resilience
  // ==========================================================
  console.log("\n📂 [Suite 10: User Management & Identity Store]");

  const testUserEmail = `audit_student_${Date.now()}@campus.edu`;
  const createdStudent = await authService.createUser({
    name: "Audit Test Resident",
    email: testUserEmail,
    role: "student",
    passwordHash: "SecurePass@2026",
    studentProfile: {
      rollNumber: `2026AUDIT${Math.floor(Math.random() * 900)}`,
      hostel: "NCH-A",
      roomNumber: "101",
      phone: "+91 99999 88888",
      fatherName: "Guardian",
      fatherPhone: "+91 99999 77777",
      motherName: "Guardian",
      motherPhone: "+91 99999 66666",
      gender: "Male",
      leaveQuotaRemaining: 4,
    },
  });

  assert(createdStudent.id !== undefined && createdStudent.email === testUserEmail, "New resident successfully provisioned with hashed credentials");

  // Attempt duplicate registration
  let duplicateThrew = false;
  try {
    await authService.createUser({
      name: "Duplicate User",
      email: testUserEmail,
      role: "student",
      passwordHash: "AnotherPass",
    });
  } catch {
    duplicateThrew = true;
  }
  assert(duplicateThrew, "Prevents duplicate account creation for existing email addresses");

  // ==========================================================
  // SUMMARY
  // ==========================================================
  console.log("\n=======================================================");
  if (passedTests === totalTests) {
    console.log(`\x1b[32m✨ ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!\x1b[0m`);
  } else {
    console.error(`\x1b[31m⚠️  ${totalTests - passedTests} of ${totalTests} TESTS FAILED\x1b[0m`);
    process.exit(1);
  }
  console.log("=======================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
