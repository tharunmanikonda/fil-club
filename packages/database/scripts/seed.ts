import "dotenv/config";
import { db } from "../src/db";
import { athletes, deals, payments } from "../src/schema";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Starting seed...");

    // Clear existing data (safe for re-run)
    console.log("Clearing existing data...");
    await db.delete(payments);
    await db.delete(deals);
    await db.delete(athletes);

    // Create athletes
    console.log("Creating athletes...");
    const insertedAthletes = await db
      .insert(athletes)
      .values([
        {
          name: "Marcus Johnson",
          sport: "Basketball",
          university: "Duke University",
        },
        {
          name: "Sophia Chen",
          sport: "Soccer",
          university: "Stanford University",
        },
        {
          name: "James Williams",
          sport: "Football",
          university: "Alabama University",
        },
      ])
      .returning();

    const marcus = insertedAthletes[0];
    const sophia = insertedAthletes[1];
    const james = insertedAthletes[2];

    console.log(`✓ Created ${insertedAthletes.length} athletes`);

    // Create deals
    console.log("Creating deals...");
    const insertedDeals = await db
      .insert(deals)
      .values([
        // Marcus: Nike deal (active, multiple payments)
        {
          athleteId: marcus.id,
          brand: "Nike",
          valueCents: 1500000, // $15,000
          status: "active",
        },
        // Marcus: Gatorade deal (completed)
        {
          athleteId: marcus.id,
          brand: "Gatorade",
          valueCents: 500000, // $5,000
          status: "completed",
        },
        // Sophia: Adidas deal (pending)
        {
          athleteId: sophia.id,
          brand: "Adidas",
          valueCents: 800000, // $8,000
          status: "pending",
        },
        // Sophia: Energy Bar deal (active)
        {
          athleteId: sophia.id,
          brand: "PowerBar",
          valueCents: 300000, // $3,000
          status: "active",
        },
        // James: Under Armour deal (active, multiple payments)
        {
          athleteId: james.id,
          brand: "Under Armour",
          valueCents: 1200000, // $12,000
          status: "active",
        },
        // James: Beats deal (cancelled)
        {
          athleteId: james.id,
          brand: "Beats by Dre",
          valueCents: 600000, // $6,000
          status: "cancelled",
        },
      ])
      .returning();

    console.log(`✓ Created ${insertedDeals.length} deals`);

    // Create payments
    console.log("Creating payments...");

    // Marcus Nike payments (2 paid, 1 pending)
    const nikeDeal = insertedDeals[0];
    const gatoradeDeal = insertedDeals[1];
    const adidasDeal = insertedDeals[2];
    const powerbarDeal = insertedDeals[3];
    const uaFeal = insertedDeals[4];
    const beatsDeal = insertedDeals[5];

    const insertedPayments = await db
      .insert(payments)
      .values([
        // Nike: Payment 1 - $5,000 paid
        {
          dealId: nikeDeal.id,
          amountCents: 500000,
          status: "paid",
          paidAt: new Date("2024-03-15"),
        },
        // Nike: Payment 2 - $5,000 paid
        {
          dealId: nikeDeal.id,
          amountCents: 500000,
          status: "paid",
          paidAt: new Date("2024-04-15"),
        },
        // Nike: Payment 3 - $4,500 pending
        {
          dealId: nikeDeal.id,
          amountCents: 450000,
          status: "pending",
          paidAt: null,
        },
        // Gatorade: Full payment (completed deal, fully paid)
        {
          dealId: gatoradeDeal.id,
          amountCents: 500000,
          status: "paid",
          paidAt: new Date("2024-02-20"),
        },
        // Adidas: Partial payment (pending deal, payment failed once)
        {
          dealId: adidasDeal.id,
          amountCents: 400000,
          status: "failed",
          paidAt: null,
        },
        // PowerBar: Payment (active, paid)
        {
          dealId: powerbarDeal.id,
          amountCents: 300000,
          status: "paid",
          paidAt: new Date("2024-05-01"),
        },
        // Under Armour: Two payments (one paid, one pending)
        {
          dealId: uaFeal.id,
          amountCents: 600000,
          status: "paid",
          paidAt: new Date("2024-04-10"),
        },
        {
          dealId: uaFeal.id,
          amountCents: 600000,
          status: "pending",
          paidAt: null,
        },
        // Beats: Payment (cancelled deal, payment failed)
        {
          dealId: beatsDeal.id,
          amountCents: 300000,
          status: "failed",
          paidAt: null,
        },
      ])
      .returning();

    console.log(`✓ Created ${insertedPayments.length} payments`);

    // Summary
    console.log("\n✅ Seed complete!\n");
    console.log("Summary:");
    console.log(`  Athletes: ${insertedAthletes.length}`);
    console.log(`  Deals: ${insertedDeals.length}`);
    console.log(`  Payments: ${insertedPayments.length}`);
    console.log("\nMarcus Johnson (Nike deal example):");
    console.log("  - Nike: $15,000 total");
    console.log("    - Payment 1: $5,000 (paid)");
    console.log("    - Payment 2: $5,000 (paid)");
    console.log("    - Payment 3: $4,500 (pending)");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
