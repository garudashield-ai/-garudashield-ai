// new release garudashield source
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs/promises";

export interface ScanReport {
  id: string;
  type: "web" | "apk" | "osint";
  target: string;
  report: string;
  timestamp: number;
  status: "processing" | "safe" | "warning" | "danger";
  isPrivate?: boolean;
}

const dbPath = path.join(process.cwd(), "data", "database.sqlite");

let dbInstance: Database | null = null;

async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target TEXT NOT NULL,
      report TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL
    )
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      ip TEXT PRIMARY KEY,
      last_deep_scan INTEGER NOT NULL
    )
  `);

  try {
    await dbInstance.exec(
      `ALTER TABLE reports ADD COLUMN isPrivate INTEGER DEFAULT 0`,
    );
  } catch (err: any) {}

  return dbInstance;
}

export async function checkRateLimit(ip: string): Promise<boolean> {
  if (ip === "unknown") return true;
  const db = await getDb();
  const row = await db.get("SELECT last_deep_scan FROM rate_limits WHERE ip = ?", ip);
  if (!row) return true;

  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  return (Date.now() - row.last_deep_scan) >= ONE_WEEK;
}

export async function updateRateLimit(ip: string) {
  if (ip === "unknown") return;
  const db = await getDb();
  await db.run(
    "INSERT OR REPLACE INTO rate_limits (ip, last_deep_scan) VALUES (?, ?)",
    [ip, Date.now()]
  );
}

export async function saveReport(report: ScanReport) {
  const db = await getDb();
  await db.run(
    "INSERT OR REPLACE INTO reports (id, type, target, report, timestamp, status, isPrivate) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      report.id,
      report.type,
      report.target,
      report.report,
      report.timestamp,
      report.status,
      report.isPrivate ? 1 : 0,
    ],
  );
}

export async function getReport(id: string): Promise<ScanReport | null> {
  const db = await getDb();
  const result = await db.get<ScanReport>(
    "SELECT * FROM reports WHERE id = ?",
    id,
  );
  if (result) {
    result.isPrivate = Boolean(result.isPrivate);
  }
  return result || null;
}

export async function getAllReports(): Promise<ScanReport[]> {
  const db = await getDb();
  const results = await db.all<ScanReport[]>(
    "SELECT * FROM reports WHERE isPrivate = 0 OR isPrivate IS NULL ORDER BY timestamp DESC",
  );
  return results.map((r) => ({ ...r, isPrivate: Boolean(r.isPrivate) }));
}
