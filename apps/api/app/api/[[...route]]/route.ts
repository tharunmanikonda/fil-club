import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@nil-club/database";
import { athletes } from "@nil-club/database";

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/athletes", async (c) => {
  try {
    const athleteList = await db.select().from(athletes);
    return c.json({ data: athleteList });
  } catch (error) {
    console.error("[GET /api/athletes]", error);
    return c.json(
      {
        error: "internal_error",
        message: "Failed to fetch athletes",
      },
      500
    );
  }
});

export const GET = handle(app);
export const POST = handle(app);
