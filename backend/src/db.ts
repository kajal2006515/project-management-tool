import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Remove 'file:' prefix for better-sqlite3 database file path
const dbPath = databaseUrl.replace(/^file:/, '');

const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);

const prisma = new PrismaClient({ adapter });

export default prisma;
