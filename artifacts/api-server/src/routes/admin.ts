import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { tomesTable, usersTable, oracleLogsTable } from "@workspace/db";
import { count, desc, sum } from "drizzle-orm";
import { AdminLoginBody, ListUsersQueryParams, DeleteUserParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env["JWT_SECRET"] ?? "akashic-record-secret-key-change-in-production";
const TOKEN_EXPIRY = "24h";

router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const { username, password } = parsed.data;
  const adminUsername = process.env["ADMIN_USERNAME"] ?? "admin";
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "akashic-oracle-2024";

  if (username !== adminUsername || password !== adminPassword) {
    res.status(401).json({ error: "The Record does not recognize you" });
    return;
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ token, expiresAt });
});

router.post("/admin/logout", (req, res) => {
  res.json({ success: true });
});

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized — Bearer token required" });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const [
      [tomeCount],
      [userCount],
      [oracleCount],
      [viewSum],
      categories,
      recentTomes,
    ] = await Promise.all([
      db.select({ count: count() }).from(tomesTable),
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(oracleLogsTable),
      db.select({ total: sum(tomesTable.viewCount) }).from(tomesTable),
      db
        .select({ category: tomesTable.category, count: count() })
        .from(tomesTable)
        .groupBy(tomesTable.category)
        .orderBy(desc(count()))
        .limit(10),
      db.select().from(tomesTable).orderBy(desc(tomesTable.createdAt)).limit(5),
    ]);

    res.json({
      totalTomes: Number(tomeCount?.count ?? 0),
      totalUsers: Number(userCount?.count ?? 0),
      totalOracleQueries: Number(oracleCount?.count ?? 0),
      totalViews: Number(viewSum?.total ?? 0),
      recentTomes: recentTomes.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        featured: t.featured,
        viewCount: t.viewCount,
        createdAt: t.createdAt.toISOString(),
      })),
      recentActivity: [],
      categoryBreakdown: categories.map((c) => ({
        name: c.category,
        count: Number(c.count),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching admin dashboard");
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const parsed = ListUsersQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
    const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

    const users = await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        createdAt: u.createdAt.toISOString(),
        tomeCount: 0,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error fetching users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = DeleteUserParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(usersTable).where(eq(usersTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting user");
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
