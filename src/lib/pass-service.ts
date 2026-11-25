import { GatePass, CheckpointLog, HostelName, PassType, PassStatus } from "@/types";
import { dbService, isCloudDbConfigured } from "@/lib/db-service";

const globalForPasses = globalThis as unknown as {
  passesStore: GatePass[];
  checkpointLogs: CheckpointLog[];
};

if (!globalForPasses.passesStore) {
  const now = new Date();
  const departToday = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const returnToday = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  globalForPasses.passesStore = [
    {
      id: "GP-9421",
      studentId: "usr_student_01",
      studentName: "Aryan Sharma",
      rollNumber: "2024CS089",
      hostel: "NCH-A",
      roomNumber: "304",
      passType: "Day",
      destination: "Central Library & Tech City Market",
      reason: "Purchasing engineering textbooks and hardware components",
      departureTime: departToday,
      expectedReturnTime: returnToday,
      status: "Approved",
      parentConsent: {
        status: "Approved",
        verifiedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        method: "WhatsApp",
      },
      wardenRemarks: "Approved. Please adhere strictly to the 08:30 PM hostel curfew.",
      approvedBy: "Dr. Vikram Sethi",
      totpSecret: "KVKFKRCPNZQUYMLX",
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "GP-9422",
      studentId: "usr_student_01",
      studentName: "Aryan Sharma",
      rollNumber: "2024CS089",
      hostel: "NCH-A",
      roomNumber: "304",
      passType: "Overnight",
      destination: "Family Residence (Delhi NCR)",
      reason: "Attending cousin's wedding ceremony over the weekend",
      departureTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      expectedReturnTime: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      status: "Pending",
      parentConsent: {
        status: "Pending",
        method: "WhatsApp",
      },
      totpSecret: "NZQUYMLXKVKFKRCP",
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    },
  ];
}

if (!globalForPasses.checkpointLogs) {
  globalForPasses.checkpointLogs = [];
}

export const passService = {
  async getAllPasses(): Promise<GatePass[]> {
    if (isCloudDbConfigured()) {
      return await dbService.getAllPasses();
    }
    return globalForPasses.passesStore;
  },

  async getPassesByStudent(studentId: string): Promise<GatePass[]> {
    if (isCloudDbConfigured()) {
      return await dbService.getPassesByStudent(studentId);
    }
    return globalForPasses.passesStore.filter((p) => p.studentId === studentId);
  },

  async getPendingPasses(hostels?: HostelName[]): Promise<GatePass[]> {
    const all = await this.getAllPasses();
    return all.filter((p) => {
      if (p.status !== "Pending" && p.status !== "ParentApproved") return false;
      if (hostels && hostels.length > 0) {
        return hostels.includes(p.hostel);
      }
      return true;
    });
  },

  async getApprovedPasses(): Promise<GatePass[]> {
    const all = await this.getAllPasses();
    return all.filter(
      (p) => p.status === "Approved" || p.status === "CheckedOut"
    );
  },

  async getPassById(id: string): Promise<GatePass | null> {
    if (isCloudDbConfigured()) {
      return await dbService.getPassById(id);
    }
    return globalForPasses.passesStore.find((p) => p.id === id) || null;
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
    if (isCloudDbConfigured()) {
      return await dbService.createPass(data);
    }

    const randomId = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPass: GatePass = {
      id: randomId,
      ...data,
      status: data.passType === "Emergency" ? "Approved" : "Pending",
      parentConsent: {
        status: data.passType === "Day" ? "Approved" : "Pending",
        method: "WhatsApp",
      },
      totpSecret: Math.random().toString(36).substring(2, 18).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    globalForPasses.passesStore.unshift(newPass);
    return newPass;
  },

  async updatePassStatus(id: string, status: PassStatus, remarks?: string, approvedBy?: string): Promise<GatePass> {
    if (isCloudDbConfigured()) {
      return await dbService.updatePassStatus(id, status, remarks, approvedBy);
    }

    const pass = await this.getPassById(id);
    if (!pass) throw new Error("Pass not found");

    pass.status = status;
    if (remarks) pass.wardenRemarks = remarks;
    if (approvedBy) pass.approvedBy = approvedBy;

    return pass;
  },

  async updateParentConsent(
    passId: string,
    consentStatus: "Approved" | "Declined",
    method: "WhatsApp" | "SMS" | "Manual",
    remarks?: string
  ): Promise<GatePass> {
    if (isCloudDbConfigured()) {
      return await dbService.updateParentConsent(passId, consentStatus, method, remarks);
    }

    const pass = await this.getPassById(passId);
    if (!pass) throw new Error("Pass not found");

    const isApproved = consentStatus === "Approved";
    pass.parentConsent = {
      status: consentStatus,
      verifiedAt: new Date().toISOString(),
      method,
    };

    if (isApproved && pass.status === "Pending") {
      pass.status = "ParentApproved";
    } else if (!isApproved) {
      pass.status = "Rejected";
      pass.wardenRemarks = remarks || `Declined by parent via ${method}`;
    }

    return pass;
  },

  async recordCheckpointScan(
    passId: string,
    guardId: string,
    guardName: string,
    gate: string,
    action: "OUT" | "IN"
  ): Promise<{ pass: GatePass; log: CheckpointLog }> {
    if (isCloudDbConfigured()) {
      return await dbService.recordCheckpointScan(passId, guardId, guardName, gate, action);
    }

    const pass = await this.getPassById(passId);
    if (!pass) throw new Error("Pass not found");

    const now = new Date().toISOString();
    if (action === "OUT") {
      pass.status = "CheckedOut";
      pass.actualOutTime = now;
    } else {
      pass.status = "Completed";
      pass.actualInTime = now;
    }

    const log: CheckpointLog = {
      id: `LOG-${Date.now()}`,
      passId,
      studentName: pass.studentName,
      rollNumber: pass.rollNumber,
      gate,
      guardId,
      guardName,
      action,
      timestamp: now,
      verificationMethod: "DYNAMIC_QR",
    };

    globalForPasses.checkpointLogs.unshift(log);
    return { pass, log };
  },

  async getCheckpointLogs(): Promise<CheckpointLog[]> {
    if (isCloudDbConfigured()) {
      return await dbService.getCheckpointLogs();
    }
    return globalForPasses.checkpointLogs;
  },
};
