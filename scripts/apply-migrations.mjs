import fs from "fs";
import path from "path";
import pg from "pg";

const { Client } = pg;

async function run() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  if (!dbPassword) {
    console.log("Usage: node scripts/apply-migrations.mjs <YOUR_DB_PASSWORD>");
    console.log("Or set SUPABASE_DB_PASSWORD in your environment.");
    return;
  }

  const projectRef = "vhdnocyvcroqaobbiuux";
  const encodedPass = encodeURIComponent(dbPassword);
  // Connection strings without sslmode in query so pg ssl option takes precedence
  const connectionStrings = [
    `postgresql://postgres.${projectRef}:${encodedPass}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPass}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${encodedPass}@db.${projectRef}.supabase.co:5432/postgres`,
  ];

  let client;
  let connected = false;

  for (const cs of connectionStrings) {
    console.log(`Connecting to: ${cs.split('@')[1]}...`);
    client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      connected = true;
      console.log("Connected successfully!");
      break;
    } catch (err) {
      console.log("Connection failed with this host:", err.message);
      await client.end().catch(() => {});
    }
  }

  if (!connected) {
    console.error("Could not connect to database with provided password.");
    process.exit(1);
  }

  try {
    console.log("Applying schema (RUN_ALL_SCHEMA.sql)...");
    const schemaSql = fs.readFileSync("supabase/RUN_ALL_SCHEMA.sql", "utf-8");
    await client.query(schemaSql);
    console.log("Schema applied successfully!");

    console.log("Applying seed (seed.sql)...");
    const seedSql = fs.readFileSync("supabase/seed.sql", "utf-8");
    await client.query(seedSql);
    console.log("Seed data applied successfully!");

    console.log("All migrations and seed complete!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

run();
