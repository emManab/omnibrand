import fs from "fs";

const schema = fs.readFileSync("supabase/RUN_ALL_SCHEMA.sql", "utf-8");
const seed = fs.readFileSync("supabase/seed.sql", "utf-8");

const combined = `-- ========================================================
-- CALCUTTAPRESS ALL-IN-ONE SETUP SCRIPT
-- Creates all tables, security, functions AND loads all
-- categories, products, banners, and default settings.
-- ========================================================

${schema}

-- ========================================================
-- POPULATE SEED DATA (CATEGORIES, PRODUCTS, BANNERS)
-- ========================================================

${seed}
`;

fs.writeFileSync("supabase/ONE_CLICK_SETUP.sql", combined, "utf-8");
console.log("Created supabase/ONE_CLICK_SETUP.sql with size:", combined.length);
