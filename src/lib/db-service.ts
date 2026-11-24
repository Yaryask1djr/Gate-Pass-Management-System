import { prisma } from "@/lib/prisma";
import { GatePass, CheckpointLog, HostelName, PassType, PassStatus, User, StudentProfile, AdminProfile, GuardProfile } from "@/types";

/**
 * Checks if a real PostgreSQL DATABASE_URL is configured (e.g. Neon, Supabase, or AWS RDS).
 */
export function isCloudDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  // If it's the unconfigured default placeholder, skip attempting remote DB connection
  if (url.includes("password@localhost:5432")) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export const dbService = {
  // ==========================================
  // USER & AUTH QUERIES
  // ==========================================
  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          studentProfile: true,
          adminProfile: true,
          guardProfile: true,
        },
      });
      if (!record) return null;

      return {
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role as any,
        passwordHash: record.passwordHash,
        createdAt: record.createdAt.toISOString(),
        studentProfile: record.studentProfile
          ? {
              rollNumber: record.studentProfile.rollNumber,
              hostel: record.studentProfile.hostel as HostelName,
              roomNumber: record.studentProfile.roomNumber,
              phone: record.studentProfile.phone,
              fatherName: record.studentProfile.fatherName,
              fatherPhone: record.studentProfile.fatherPhone,
              motherName: record.studentProfile.motherName,
              motherPhone: record.studentProfile.motherPhone,
              gender: record.studentProfile.gender as any,
              leaveQuotaRemaining: record.studentProfile.leaveQuotaRemaining,
            }
          : undefined,
        adminProfile: record.adminProfile
          ? {
              employeeId: record.adminProfile.employeeId,
              department: record.adminProfile.department,
              designation: record.adminProfile.designation,
              assignedHostels: record.adminProfile.assignedHostels.split(",") as HostelName[],
              phone: record.adminProfile.phone,
            }
          : undefined,
        guardProfile: record.guardProfile
          ? {
              employeeId: record.guardProfile.employeeId,
              assignedGate: record.guardProfile.assignedGate,
              phone: record.guardProfile.phone,
              shift: record.guardProfile.shift as any,
            }
          : undefined,
      };
    } catch (err) {
      console.error("Prisma findUserByEmail error:", err);
      return null;
    }
  },

  async findUserById(id: string): Promise<User | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: true,
          adminProfile: true,
          guardProfile: true,
        },
      });
      if (!record) return null;

      return {
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role as any,
        createdAt: record.createdAt.toISOString(),
        studentProfile: record.studentProfile
          ? {
              rollNumber: record.studentProfile.rollNumber,
              hostel: record.studentProfile.hostel as HostelName,
              roomNumber: record.studentProfile.roomNumber,
              phone: record.studentProfile.phone,
              fatherName: record.studentProfile.fatherName,
              fatherPhone: record.studentProfile.fatherPhone,
              motherName: record.studentProfile.motherName,
              motherPhone: record.studentProfile.motherPhone,
              gender: record.studentProfile.gender as any,
              leaveQuotaRemaining: record.studentProfile.leaveQuotaRemaining,
            }
          : undefined,
        adminProfile: record.adminProfile
          ? {
              employeeId: record.adminProfile.employeeId,
              department: record.adminProfile.department,
              designation: record.adminProfile.designation,
              assignedHostels: record.adminProfile.assignedHostels.split(",") as HostelName[],
              phone: record.adminProfile.phone,
            }
          : undefined,
        guardProfile: record.guardProfile
          ? {
              employeeId: record.guardProfile.employeeId,
              assignedGate: record.guardProfile.assignedGate,
              phone: record.guardProfile.phone,
              shift: record.guardProfile.shift as any,
            }
          : undefined,
      };
    } catch (err) {
      console.error("Prisma findUserById error:", err);
      return null;
    }
  },

  // ==========================================
  // GATE PASS QUERIES
  // ==========================================
  async getAllPasses(): Promise<GatePass[]> {
    try {
      const records = await prisma.gatePass.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map(this.mapDbPassToGatePass);
    } catch (err) {
      console.error("Prisma getAllPasses error:", err);
      return [];
    }
  },

  async getPassesByStudent(studentId: string): Promise<GatePass[]> {
    try {
      const records = await prisma.gatePass.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      });
      return records.map(this.mapDbPassToGatePass);
    } catch (err) {
      console.error("Prisma getPassesByStudent error:", err);
      return [];
    }
  },

  async getPassById(id: string): Promise<GatePass | null> {
    try {
      const record = await prisma.gatePass.findUnique({
        where: { id },
      });
      return record ? this.mapDbPassToGatePass(record) : null;
    } catch (err) {
      console.error("Prisma getPassById error:", err);
      return null;
    }
  },

  async createPass(data: {
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
  }): Promise<GatePass> {
    const randomId = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
    const isEmergency = data.passType === "Emergency";
    const isDay = data.passType === "Day";

    const record = await prisma.gatePass.create({
      data: {
        id: randomId,
        studentId: data.studentId,
        studentName: data.studentName,
        rollNumber: data.rollNumber,
        hostel: data.hostel,
        roomNumber: data.roomNumber,
        passType: data.passType,
        destination: data.destination,
        reason: data.reason,
        departureTime: new Date(data.departureTime),
        expectedReturnTime: new Date(data.expectedReturnTime),
        status: isEmergency ? "Approved" : "Pending",
        parentConsentStatus: isDay ? "Approved" : "Pending",
        parentConsentMethod: "WhatsApp",
        totpSecret: Math.random().toString(36).substring(2, 18).toUpperCase(),
      },
    });

    return this.mapDbPassToGatePass(record);
  },

  async updatePassStatus(
    id: string,
    status: PassStatus,
    remarks?: string,
    approvedBy?: string
  ): Promise<GatePass> {
    const record = await prisma.gatePass.update({
      where: { id },
      data: {
        status,
        wardenRemarks: remarks,
        approvedBy,
      },
    });
    return this.mapDbPassToGatePass(record);
  },

  async recordCheckpointScan(
    passId: string,
    guardId: string,
    guardName: string,
    gate: string,
    action: "OUT" | "IN"
  ): Promise<{ pass: GatePass; log: CheckpointLog }> {
    const now = new Date();
    const updatedPassRecord = await prisma.gatePass.update({
      where: { id: passId },
      data:
        action === "OUT"
          ? { status: "CheckedOut", actualOutTime: now }
          : { status: "Completed", actualInTime: now },
    });

    const logRecord = await prisma.checkpointLog.create({
      data: {
        passId,
        studentName: updatedPassRecord.studentName,
        rollNumber: updatedPassRecord.rollNumber,
        gate,
        guardId,
        guardName,
        action,
        timestamp: now,
        verificationMethod: "DYNAMIC_QR",
      },
    });

    return {
      pass: this.mapDbPassToGatePass(updatedPassRecord),
      log: {
        id: logRecord.id,
        passId: logRecord.passId,
        studentName: logRecord.studentName,
        rollNumber: logRecord.rollNumber,
        gate: logRecord.gate,
        guardId: logRecord.guardId,
        guardName: logRecord.guardName,
        action: logRecord.action as any,
        timestamp: logRecord.timestamp.toISOString(),
        verificationMethod: logRecord.verificationMethod as any,
      },
    };
  },

  async getCheckpointLogs(): Promise<CheckpointLog[]> {
    try {
      const records = await prisma.checkpointLog.findMany({
        orderBy: { timestamp: "desc" },
      });
      return records.map((r: any) => ({
        id: r.id,
        passId: r.passId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        gate: r.gate,
        guardId: r.guardId,
        guardName: r.guardName,
        action: r.action as any,
        timestamp: r.timestamp.toISOString(),
        verificationMethod: r.verificationMethod as any,
      }));
    } catch (err) {
      console.error("Prisma getCheckpointLogs error:", err);
      return [];
    }
  },

  mapDbPassToGatePass(dbPass: any): GatePass {
    return {
      id: dbPass.id,
      studentId: dbPass.studentId,
      studentName: dbPass.studentName,
      rollNumber: dbPass.rollNumber,
      hostel: dbPass.hostel as HostelName,
      roomNumber: dbPass.roomNumber,
      passType: dbPass.passType as PassType,
      destination: dbPass.destination,
      reason: dbPass.reason,
      departureTime: dbPass.departureTime instanceof Date ? dbPass.departureTime.toISOString() : dbPass.departureTime,
      expectedReturnTime: dbPass.expectedReturnTime instanceof Date ? dbPass.expectedReturnTime.toISOString() : dbPass.expectedReturnTime,
      actualOutTime: dbPass.actualOutTime ? (dbPass.actualOutTime instanceof Date ? dbPass.actualOutTime.toISOString() : dbPass.actualOutTime) : undefined,
      actualInTime: dbPass.actualInTime ? (dbPass.actualInTime instanceof Date ? dbPass.actualInTime.toISOString() : dbPass.actualInTime) : undefined,
      status: dbPass.status as PassStatus,
      parentConsent: {
        status: dbPass.parentConsentStatus as any,
        verifiedAt: dbPass.parentConsentVerifiedAt ? new Date(dbPass.parentConsentVerifiedAt).toISOString() : undefined,
        method: dbPass.parentConsentMethod as any,
      },
      wardenRemarks: dbPass.wardenRemarks || undefined,
      approvedBy: dbPass.approvedBy || undefined,
      totpSecret: dbPass.totpSecret,
      createdAt: dbPass.createdAt instanceof Date ? dbPass.createdAt.toISOString() : dbPass.createdAt,
    };
  },
};
