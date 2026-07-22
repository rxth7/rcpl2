import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const code = "LIVE-TEST-" + Date.now();
  const e1 = `live1-${Date.now()}@example.com`;
  const e2 = `live2-${Date.now()}@example.com`;

  const r1 = await sb.auth.admin.createUser({
    email: e1, password: "Password123!", email_confirm: true,
    user_metadata: { role: "branch", branchName: "LIVE", branchCode: code, branchId: null, contactPerson: "P1", branchRole: "Branch Admin", name: "P1" },
  });
  console.log("USER1:", r1.error ? JSON.stringify(r1.error, null, 2) : "OK " + r1.data?.user?.id);

  const r2 = await sb.auth.admin.createUser({
    email: e2, password: "Password123!", email_confirm: true,
    user_metadata: { role: "branch", branchName: "LIVE", branchCode: code, branchId: null, contactPerson: "P2", branchRole: "IT", name: "P2" },
  });
  console.log("USER2 (same branch):", r2.error ? JSON.stringify(r2.error, null, 2) : "OK " + r2.data?.user?.id);

  // cleanup
  for (const r of [r1, r2]) if (r.data?.user) await sb.auth.admin.deleteUser(r.data.user.id);
  console.log("cleanup done");
}
main().then(() => process.exit(0)).catch((e) => { console.error("FATAL", e); process.exit(1); });
