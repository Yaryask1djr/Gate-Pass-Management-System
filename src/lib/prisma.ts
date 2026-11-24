import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const url = process.env.DATABASE_URL;
  if (!url || url.includes("password@localhost:5432")) {
    throw new Error(
      "Cloud PostgreSQL is not yet configured. Please set a valid DATABASE_URL in .env."
    );
  }

  // Resilient instantiation: use datasourceUrl or adapter without crashing webpack
  let client: PrismaClient;
  try {
    const adapterPkg = "@prisma/adapter-pg";
    // eval-require avoids static bundling resolution failure during next build
    const { PrismaPg } = eval("require")(adapterPkg);
    const adapter = new PrismaPg({ connectionString: url });
    client = new PrismaClient({ adapter });
  } catch {
    client = new PrismaClient({
      datasourceUrl: url,
    } as any);
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Lazy proxy to prevent PrismaClientConstructorValidationError on server start
 * before DATABASE_URL is configured by the user.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
