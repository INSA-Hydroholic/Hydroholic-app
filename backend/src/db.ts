const { PrismaClient } = require('@prisma/client');

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const initDb = async (): Promise<void> => {
  await prisma.$connect();
};

export const getDb = () => prisma;
