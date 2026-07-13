import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const config: Parameters<typeof PrismaLibSql.prototype.createClient>[0] = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

export default prisma;
