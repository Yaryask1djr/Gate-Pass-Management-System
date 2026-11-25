import { User, UserRole, HostelName } from "@/types";
import { dbService, isCloudDbConfigured } from "@/lib/db-service";
import { hashPassword, verifyPassword, generateSecureSessionToken } from "@/lib/security";

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

  async createUser(userData: Omit<UserRecord, "id" | "createdAt">): Promise<User> {
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const hashedPassword = hashPassword(userData.passwordHash);

    if (isCloudDbConfigured()) {
      return await dbService.createUser({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        studentProfile: userData.studentProfile,
        adminProfile: userData.adminProfile,
        guardProfile: userData.guardProfile,
      });
    }

    const newUser: UserRecord = {
      ...userData,
      passwordHash: hashedPassword,
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
    if (!verifyPassword(password, user.passwordHash)) return null;

    return user;
  },

  createSession(userId: string): string {
    // Cryptographically secure 256-bit session token
    const sessionToken = generateSecureSessionToken(`sess_${userId}`);
    // 7 days expiration
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    globalForAuth.sessionsStore[sessionToken] = { userId, expiresAt };

    // Active prune of expired sessions to prevent memory leaks
    if (Object.keys(globalForAuth.sessionsStore).length > 200) {
      const now = Date.now();
      for (const [token, sess] of Object.entries(globalForAuth.sessionsStore)) {
        if (now > sess.expiresAt) {
          delete globalForAuth.sessionsStore[token];
        }
      }
    }

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
