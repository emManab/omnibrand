import fs from "fs";
import path from "path";

const dir = "supabase/migrations";
const files = [
  "20241012000000_omnibrand.sql",
  "20261014000001_catalog_schema.sql",
  "20261014000002_rls_and_storage.sql",
  "20261014000003_functions.sql",
];

let combined = "-- =========================================================\n" +
               "-- Calcuttapress Complete Database Schema & Functions\n" +
               "-- Run this entire script in Supabase Dashboard -> SQL Editor\n" +
               "-- =========================================================\n\n";

for (const file of files) {
  const filePath = path.join(dir, file);
  combined += `\n-- >>>>>>>>>>>>>> START OF ${file} <<<<<<<<<<<<<<\n\n`;
  combined += fs.readFileSync(filePath, "utf-8");
  combined += `\n\n-- >>>>>>>>>>>>>> END OF ${file} <<<<<<<<<<<<<<\n\n`;
}

fs.writeFileSync("supabase/RUN_ALL_SCHEMA.sql", combined, "utf-8");
console.log("Created supabase/RUN_ALL_SCHEMA.sql with size:", combined.length);
