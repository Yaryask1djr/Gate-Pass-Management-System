import { User, UserRole, HostelName } from "@/types";
import { dbService, isCloudDbConfigured } from "@/lib/db-service";

interface UserRecord extends User {
  passwordHash: string; // Plain/hashed for mock store
}

// Global in-memory storage for development and demo
const globalForAuth = globalThis as unknown as {
  usersStore: UserRecord[];
  sessionsStore: Record<string, { userId: string; expiresAt: number }>;
};

if (!globalForAuth.usersStore) {
  globalForAuth.usersStore = [
    {
      id: "usr_student_01",
      name: "Aryan Sharma",
      email: "student@campus.edu",
      role: "student",
      createdAt: new Date().toISOString(),
      passwordHash: "pass123",
      studentProfile: {
        rollNumber: "2024CS089",
        hostel: "NCH-A",
        roomNumber: "304",
        phone: "+91 98765 43210",
        fatherName: "Ramesh Sharma",
        fatherPhone: "+91 98765 11111",
        motherName: "Sunita Sharma",
        motherPhone: "+91 98765 22222",
        gender: "Male",
        leaveQuotaRemaining: 4,
      },
    },
    {
      id: "usr_admin_01",
      name: "Dr. Vikram Sethi",
      email: "admin@campus.edu",
      role: "admin",
      createdAt: new Date().toISOString(),
      passwordHash: "pass123",
      adminProfile: {
        employeeId: "ADM-9042",
        department: "Campus Life & Student Affairs",
        designation: "Chief Hostel Warden & Dean of Student Welfare",
        assignedHostels: ["NCH-A", "NCH-B", "NC-1", "SUKHNA", "Govind", "Zakir"],
        phone: "+91 98111 22334",
      },
    },
    {
      id: "usr_guard_01",
      name: "Officer Rajesh Kumar",
      email: "guard@campus.edu",
      role: "guard",
      createdAt: new Date().toISOString(),
      passwordHash: "pass123",
      guardProfile: {
        employeeId: "SEC-108",
        assignedGate: "Main North Campus Gate 1",
        phone: "+91 98222 33445",
        shift: "Evening",
      },
    },
  ];
}

if (!globalForAuth.sessionsStore) {
  globalForAuth.sessionsStore = {};
}

export const authService = {
  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    if (isCloudDbConfigured()) {
      const dbUser = await dbService.findUserByEmail(email);
      if (dbUser) return dbUser;
    }
    const memUser = globalForAuth.usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return memUser || null;
  },

  async findUserById(id: string): Promise<User | null> {
    if (isCloudDbConfigured()) {
      const dbUser = await dbService.findUserById(id);
      if (dbUser) return dbUser;
    }
    const memUser = globalForAuth.usersStore.find((u) => u.id === id);
    return memUser || null;
  },

  createUser(userData: Omit<UserRecord, "id" | "createdAt">) {
    const existing = globalForAuth.usersStore.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const newUser: UserRecord = {
      ...userData,
      id: `usr_${userData.role}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    globalForAuth.usersStore.push(newUser);
    return newUser;
  },

  async verifyCredentials(email: string, password: string, role: UserRole): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;
    if (user.role !== role) return null;
    if (user.passwordHash !== password) return null;

    return user;
  },

  createSession(userId: string): string {
    const sessionToken = `sess_${userId}_${Math.random().toString(36).substring(2)}${Date.now()}`;
    // 7 days expiration
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    globalForAuth.sessionsStore[sessionToken] = { userId, expiresAt };
    return sessionToken;
  },

  async getUserFromSession(token: string): Promise<User | null> {
    const session = globalForAuth.sessionsStore[token];
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      delete globalForAuth.sessionsStore[token];
      return null;
    }
    const user = await this.findUserById(session.userId);
    if (!user) return null;

    // Return user without password
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  },

  invalidateSession(token: string) {
    delete globalForAuth.sessionsStore[token];
  },
};
