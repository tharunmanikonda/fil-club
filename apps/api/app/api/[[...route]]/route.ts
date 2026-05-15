import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { db } from "@nil-club/database";
import { athletes, deals, payments } from "@nil-club/database";
import { eq } from "drizzle-orm";

const uuidSchema = z.string().uuid();

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// GET /api/athletes
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

// GET /api/athletes/:id
app.get("/athletes/:id", async (c) => {
  try {
    const { id } = c.req.param();

    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return c.json(
        {
          error: "invalid_uuid",
          message: "Athlete ID must be a valid UUID",
        },
        400
      );
    }

    const athlete = await db
      .select()
      .from(athletes)
      .where(eq(athletes.id, id))
      .limit(1);

    if (athlete.length === 0) {
      return c.json(
        {
          error: "not_found",
          message: "Athlete not found",
        },
        404
      );
    }

    return c.json({ data: athlete[0] });
  } catch (error) {
    console.error("[GET /api/athletes/:id]", error);
    return c.json(
      {
        error: "internal_error",
        message: "Failed to fetch athlete",
      },
      500
    );
  }
});

// GET /api/athletes/:id/deals
app.get("/athletes/:id/deals", async (c) => {
  try {
    const { id } = c.req.param();

    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return c.json(
        {
          error: "invalid_uuid",
          message: "Athlete ID must be a valid UUID",
        },
        400
      );
    }

    // Verify athlete exists
    const athlete = await db
      .select()
      .from(athletes)
      .where(eq(athletes.id, id))
      .limit(1);

    if (athlete.length === 0) {
      return c.json(
        {
          error: "not_found",
          message: "Athlete not found",
        },
        404
      );
    }

    const athleteDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.athleteId, id));

    return c.json({ data: athleteDeals });
  } catch (error) {
    console.error("[GET /api/athletes/:id/deals]", error);
    return c.json(
      {
        error: "internal_error",
        message: "Failed to fetch deals",
      },
      500
    );
  }
});

// GET /api/athletes/:id/earnings
app.get("/athletes/:id/earnings", async (c) => {
  try {
    const { id } = c.req.param();

    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return c.json(
        {
          error: "invalid_uuid",
          message: "Athlete ID must be a valid UUID",
        },
        400
      );
    }

    // Verify athlete exists
    const athlete = await db
      .select()
      .from(athletes)
      .where(eq(athletes.id, id))
      .limit(1);

    if (athlete.length === 0) {
      return c.json(
        {
          error: "not_found",
          message: "Athlete not found",
        },
        404
      );
    }

    // Get all deals and payments for this athlete
    const athleteDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.athleteId, id));

    const dealIds = athleteDeals.map((d) => d.id);

    let athletePayments: typeof payments.$inferSelect[] = [];
    if (dealIds.length > 0) {
      athletePayments = await db
        .select()
        .from(payments)
        .where(payments.dealId.inArray(dealIds));
    }

    // Calculate earnings
    const totalValueCents = athleteDeals.reduce((sum, d) => sum + d.valueCents, 0);
    const totalPaidCents = athletePayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const totalPendingCents = athletePayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const dealCount = athleteDeals.length;

    return c.json({
      data: {
        totalValueCents,
        totalPaidCents,
        totalPendingCents,
        dealCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/athletes/:id/earnings]", error);
    return c.json(
      {
        error: "internal_error",
        message: "Failed to fetch earnings",
      },
      500
    );
  }
});

// GET /api/deals/:id/payments
app.get("/deals/:id/payments", async (c) => {
  try {
    const { id } = c.req.param();

    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return c.json(
        {
          error: "invalid_uuid",
          message: "Deal ID must be a valid UUID",
        },
        400
      );
    }

    // Verify deal exists
    const deal = await db
      .select()
      .from(deals)
      .where(eq(deals.id, id))
      .limit(1);

    if (deal.length === 0) {
      return c.json(
        {
          error: "not_found",
          message: "Deal not found",
        },
        404
      );
    }

    const dealPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.dealId, id));

    return c.json({ data: dealPayments });
  } catch (error) {
    console.error("[GET /api/deals/:id/payments]", error);
    return c.json(
      {
        error: "internal_error",
        message: "Failed to fetch payments",
      },
      500
    );
  }
});

export const GET = handle(app);
export const POST = handle(app);
