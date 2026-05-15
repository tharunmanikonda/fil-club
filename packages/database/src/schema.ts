import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const dealStatusEnum = pgEnum("deal_status", [
  "active",
  "completed",
  "pending",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "pending",
  "failed",
]);

// Tables
export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 255}).notNull(),
  university: varchar("university", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: uuid("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade" }),
  brand: varchar("brand", { length: 255 }).notNull(),
  valueCents: integer("value_cents").notNull(),
  status: dealStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});
