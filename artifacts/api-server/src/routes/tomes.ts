import { Router } from "express";
import { db } from "@workspace/db";
import { tomesTable } from "@workspace/db";
import { eq, ilike, count, sum, desc, and, or } from "drizzle-orm";
import {
  ListTomesQueryParams,
  CreateTomeBody,
  UpdateTomeBody,
  GetTomeParams,
  DeleteTomeParams,
  UpdateTomeParams,
  ListRecentTomesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tomes/featured", async (req, res) => {
  try {
    const featured = await db
      .select()
      .from(tomesTable)
      .where(eq(tomesTable.featured, true))
      .orderBy(desc(tomesTable.createdAt))
      .limit(6);
    res.json(featured.map(formatTome));
  } catch (err) {
    req.log.error({ err }, "Error fetching featured tomes");
    res.status(500).json({ error: "Failed to fetch featured tomes" });
  }
});

router.get("/tomes/recent", async (req, res) => {
  try {
    const parsed = ListRecentTomesQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
    const recent = await db
      .select()
      .from(tomesTable)
      .orderBy(desc(tomesTable.createdAt))
      .limit(limit);
    res.json(recent.map(formatTome));
  } catch (err) {
    req.log.error({ err }, "Error fetching recent tomes");
    res.status(500).json({ error: "Failed to fetch recent tomes" });
  }
});

router.get("/tomes/stats", async (req, res) => {
  try {
    const [totalResult] = await db
      .select({ count: count() })
      .from(tomesTable);
    const [viewResult] = await db
      .select({ total: sum(tomesTable.viewCount) })
      .from(tomesTable);

    const categories = await db
      .select({ category: tomesTable.category, tomeCount: count() })
      .from(tomesTable)
      .groupBy(tomesTable.category)
      .orderBy(desc(count()));

    res.json({
      totalTomes: Number(totalResult?.count ?? 0),
      totalCategories: categories.length,
      totalViews: Number(viewResult?.total ?? 0),
      recentCount: 0,
      topCategories: categories.slice(0, 5).map((c) => ({
        name: c.category,
        count: Number(c.tomeCount),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching tome stats");
    res.status(500).json({ error: "Failed to fetch tome stats" });
  }
});

router.get("/tomes/categories", async (req, res) => {
  try {
    const categories = await db
      .select({ name: tomesTable.category, count: count() })
      .from(tomesTable)
      .groupBy(tomesTable.category)
      .orderBy(desc(count()));
    res.json(categories.map((c) => ({ name: c.name, count: Number(c.count) })));
  } catch (err) {
    req.log.error({ err }, "Error fetching categories");
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/tomes", async (req, res) => {
  try {
    const parsed = ListTomesQueryParams.safeParse(req.query);
    const limit = parsed.success ? parsed.data.limit : 20;
    const offset = parsed.success ? parsed.data.offset : 0;
    const category = parsed.success ? parsed.data.category : undefined;
    const search = parsed.success ? parsed.data.search : undefined;

    const conditions = [];
    if (category) {
      conditions.push(ilike(tomesTable.category, category));
    }
    if (search) {
      conditions.push(
        or(
          ilike(tomesTable.title, `%${search}%`),
          ilike(tomesTable.content, `%${search}%`)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [tomes, [totalResult]] = await Promise.all([
      db
        .select()
        .from(tomesTable)
        .where(where)
        .orderBy(desc(tomesTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(tomesTable).where(where),
    ]);

    res.json({
      tomes: tomes.map(formatTome),
      total: Number(totalResult?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching tomes");
    res.status(500).json({ error: "Failed to fetch tomes" });
  }
});

router.post("/tomes", async (req, res) => {
  try {
    const parsed = CreateTomeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { featured, tags, sourceUrl, excerpt, ...rest } = parsed.data;
    const [tome] = await db
      .insert(tomesTable)
      .values({
        ...rest,
        featured: featured ?? false,
        tags: tags ?? [],
        sourceUrl: sourceUrl ?? null,
        excerpt: excerpt ?? null,
      })
      .returning();
    res.status(201).json(formatTome(tome!));
  } catch (err) {
    req.log.error({ err }, "Error creating tome");
    res.status(500).json({ error: "Failed to create tome" });
  }
});

router.get("/tomes/:id", async (req, res) => {
  try {
    const parsed = GetTomeParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [tome] = await db
      .select()
      .from(tomesTable)
      .where(eq(tomesTable.id, parsed.data.id));
    if (!tome) {
      res.status(404).json({ error: "Tome not found" });
      return;
    }
    await db
      .update(tomesTable)
      .set({ viewCount: (tome.viewCount ?? 0) + 1 })
      .where(eq(tomesTable.id, tome.id));
    res.json(formatTome({ ...tome, viewCount: (tome.viewCount ?? 0) + 1 }));
  } catch (err) {
    req.log.error({ err }, "Error fetching tome");
    res.status(500).json({ error: "Failed to fetch tome" });
  }
});

router.patch("/tomes/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateTomeParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = UpdateTomeBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [tome] = await db
      .update(tomesTable)
      .set({ ...bodyParsed.data, updatedAt: new Date() })
      .where(eq(tomesTable.id, paramsParsed.data.id))
      .returning();
    if (!tome) {
      res.status(404).json({ error: "Tome not found" });
      return;
    }
    res.json(formatTome(tome));
  } catch (err) {
    req.log.error({ err }, "Error updating tome");
    res.status(500).json({ error: "Failed to update tome" });
  }
});

router.delete("/tomes/:id", async (req, res) => {
  try {
    const parsed = DeleteTomeParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(tomesTable).where(eq(tomesTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting tome");
    res.status(500).json({ error: "Failed to delete tome" });
  }
});

function formatTome(tome: typeof tomesTable.$inferSelect) {
  return {
    id: tome.id,
    title: tome.title,
    excerpt: tome.excerpt,
    content: tome.content,
    category: tome.category,
    tags: tome.tags ?? [],
    sourceUrl: tome.sourceUrl,
    featured: tome.featured,
    viewCount: tome.viewCount,
    createdAt: tome.createdAt.toISOString(),
    updatedAt: tome.updatedAt?.toISOString() ?? tome.createdAt.toISOString(),
  };
}

export default router;
