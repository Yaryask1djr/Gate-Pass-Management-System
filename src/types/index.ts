export type UserRole = "student" | "admin" | "guard";

export type HostelName =
  | "NCH-A"
  | "NCH-B"
  | "NC-1"
  | "NC-2"
  | "NC-3"
  | "NC-4"
  | "SUKHNA"
  | "Govind"
  | "Zakir";

export interface StudentProfile {
  rollNumber: string;
  hostel: HostelName;
  roomNumber: string;
  phone: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  gender: "Male" | "Female" | "Other";
  leaveQuotaRemaining: number;
}

export interface AdminProfile {
  employeeId: string;
  department: string; // e.g. "Campus Life & Student Affairs" / "Hostel Warden Office"
  assignedHostels: HostelName[];
  phone: string;
  designation: string;
}

export interface GuardProfile {
  employeeId: string;
  assignedGate: string; // e.g. "Main Campus Gate 1", "North Hostel Gate"
  phone: string;
  shift: "Morning" | "Evening" | "Night";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  studentProfile?: StudentProfile;
  adminProfile?: AdminProfile;
  guardProfile?: GuardProfile;
}

export type PassType = "Day" | "Overnight" | "Emergency";

export type PassStatus =
  | "Pending"
  | "ParentApproved"
  | "Approved"
  | "Rejected"
  | "CheckedOut"
  | "Completed"
  | "Overdue";

export interface GatePass {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  hostel: HostelName;
  roomNumber: string;
  passType: PassType;
  destination: string;
  reason: string;
  departureTime: string;
  expectedReturnTime: string;
  actualOutTime?: string;
  actualInTime?: string;
  status: PassStatus;
  parentConsent: {
    status: "Pending" | "Approved" | "Declined";
    verifiedAt?: string;
    method?: "WhatsApp" | "SMS" | "Manual";
  };
  wardenRemarks?: string;
  approvedBy?: string;
  totpSecret: string;
  createdAt: string;
}

export interface CheckpointLog {
  id: string;
  passId: string;
  studentName: string;
  rollNumber: string;
  gate: string;
  guardId: string;
  guardName: string;
  action: "OUT" | "IN";
  timestamp: string;
  verificationMethod: "DYNAMIC_QR" | "MANUAL_OVERRIDE";
}
