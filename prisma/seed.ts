import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PassGuard 2.0 PostgreSQL Database...");

  // 1. Clean existing records (optional for re-seeding)
  await prisma.checkpointLog.deleteMany();
  await prisma.gatePass.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.guardProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Student User & Profile
  const student = await prisma.user.create({
    data: {
      id: "usr_student_01",
      name: "Aryan Sharma",
      email: "student@campus.edu",
      passwordHash: "pass123",
      role: "student",
      studentProfile: {
        create: {
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
    },
  });

  // 3. Create Admin / Warden User & Profile
  await prisma.user.create({
    data: {
      id: "usr_admin_01",
      name: "Dr. Vikram Sethi",
      email: "admin@campus.edu",
      passwordHash: "pass123",
      role: "admin",
      adminProfile: {
        create: {
          employeeId: "ADM-9042",
          department: "Campus Life & Student Affairs",
          designation: "Chief Hostel Warden & Dean of Student Welfare",
          assignedHostels: "NCH-A,NCH-B,NC-1,SUKHNA,Govind,Zakir",
          phone: "+91 98111 22334",
        },
      },
    },
  });

  // 4. Create Guard User & Profile
  await prisma.user.create({
    data: {
      id: "usr_guard_01",
      name: "Officer Rajesh Kumar",
      email: "guard@campus.edu",
      passwordHash: "pass123",
      role: "guard",
      guardProfile: {
        create: {
          employeeId: "SEC-108",
          assignedGate: "Main North Campus Gate 1",
          phone: "+91 98222 33445",
          shift: "Evening",
        },
      },
    },
  });

  // 5. Create Sample Passes for Student
  const now = new Date();
  const departToday = new Date(now.getTime() + 15 * 60 * 1000);
  const returnToday = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  // Active Approved Pass
  await prisma.gatePass.create({
    data: {
      id: "GP-9421",
      studentId: student.id,
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
      parentConsentStatus: "Approved",
      parentConsentVerifiedAt: new Date(now.getTime() - 30 * 60 * 1000),
      parentConsentMethod: "WhatsApp",
      wardenRemarks: "Approved. Please adhere strictly to the 08:30 PM hostel curfew.",
      approvedBy: "Dr. Vikram Sethi",
      totpSecret: "KVKFKRCPNZQUYMLX",
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    },
  });

  // Pending Overnight Pass
  await prisma.gatePass.create({
    data: {
      id: "GP-9422",
      studentId: student.id,
      studentName: "Aryan Sharma",
      rollNumber: "2024CS089",
      hostel: "NCH-A",
      roomNumber: "304",
      passType: "Overnight",
      destination: "Family Residence (Delhi NCR)",
      reason: "Attending cousin's wedding ceremony over the weekend",
      departureTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      expectedReturnTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      status: "Pending",
      parentConsentStatus: "Pending",
      parentConsentMethod: "WhatsApp",
      totpSecret: "NZQUYMLXKVKFKRCP",
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  });

  console.log("✅ Seed completed successfully! Users and sample passes created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
