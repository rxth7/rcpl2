/**
 * Executes the migration SQL against Supabase via the PostgREST SQL endpoint.
 * Run with: node -r dotenv/config scripts/run-migration.cjs
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "ticket-form-config.sql"), "utf8");

// Try using the PostgREST /rpc/ endpoint.
// Some Supabase projects expose a pg_query or exec_sql function.
// We'll attempt to create the table via direct PostgREST approach.

async function tryRpcMethod() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/`);
  const body = JSON.stringify({ query: sql });

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "apikey": SERVICE_KEY,
          "User-Agent": "Node.js/migration-script",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          resolve({ status: res.statusCode, body: data });
        });
      }
    );
    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

async function tryDirectDdl() {
  // PostgREST doesn't support DDL directly, but we can try using
  // a special media type or approach.
  // This is a fallback attempt using the pg_net extension.
  return { status: 0, body: "not attempted" };
}

async function main() {
  console.log("Attempting migration via RPC...");

  // First try the RPC approach
  const result = await tryRpcMethod();
  console.log(`Status: ${result.status}`);
  console.log(`Response: ${result.body.substring(0, 500)}`);

  if (result.status === 200 || result.status === 201 || result.status === 204) {
    console.log("Migration completed successfully!");
    process.exit(0);
  }

  // If RPC fails, check if the table already exists
  if (result.status === 404) {
    console.log("RPC function not found. Checking if table exists via direct query...");
    const checkResult = await new Promise((resolve) => {
      const url = new URL(`${SUPABASE_URL}/rest/v1/ticket_form_config?select=id&limit=1`);
      const req = https.request(
        url,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "apikey": SERVICE_KEY,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => resolve({ status: res.statusCode, body: data }));
        }
      );
      req.on("error", (e) => resolve({ status: 0, body: e.message }));
      req.end();
    });

    if (checkResult.status === 200) {
      console.log("Table already exists! Migration not needed.");
      process.exit(0);
    }

    console.log("Table does not exist.");
    console.log("");
    console.log("==============================================");
    console.log("MANUAL STEP REQUIRED:");
    console.log("==============================================");
    console.log("Go to your Supabase Dashboard → SQL Editor and run:");
    console.log("");
    console.log(sql);
    console.log("");
    console.log("Or create the table by hand with these columns:");
    console.log("  id: uuid (PK, default gen_random_uuid())");
    console.log("  role: text (unique, check: IT | Branch Admin | Manager)");
    console.log("  fields: jsonb (default '[]')");
    console.log("  filesEnabled: boolean (default true)");
    console.log("  createdAt: timestamptz (default now())");
    console.log("  updatedAt: timestamptz (default now())");
    process.exit(1);
  }

  console.log("Unexpected error. Try running the SQL manually in Supabase SQL Editor.");
  process.exit(1);
}

main();
