import { Client } from "pg";

// Supabase pooler URL format for project: htwxqoklsnyezdddmika
// Password: Reda2002@Red (URL-encoded: Reda2002%40Red)
const connectionString = "postgresql://postgres.htwxqoklsnyezdddmika:Reda2002%40Red@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

async function tryConnect(url: string, label: string) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    console.log(`Trying ${label}...`);
    await client.connect();
    console.log(`Connected via ${label}!`);

    // Run schema
    console.log("\n=== Running schema.sql ===");
    const schemaSql = await Bun.file("/home/z/my-project/supabase/schema.sql").text();
    await client.query(schemaSql);
    console.log("Schema created successfully!");

    // Run seed
    console.log("\n=== Running seed.sql ===");
    const seedSql = await Bun.file("/home/z/my-project/supabase/seed.sql").text();
    await client.query(seedSql);
    console.log("Seed data inserted successfully!");

    // Verify
    console.log("\n=== Verifying data ===");
    const taxRes = await client.query("SELECT COUNT(*) FROM tax_obligations");
    const empRes = await client.query("SELECT COUNT(*) FROM employees");
    const dlRes = await client.query("SELECT COUNT(*) FROM deadlines");
    console.log(`  tax_obligations: ${taxRes.rows[0].count} rows`);
    console.log(`  employees: ${empRes.rows[0].count} rows`);
    console.log(`  deadlines: ${dlRes.rows[0].count} rows`);

    console.log("\nSetup complete!");
    return true;
  } catch (err) {
    console.error(`${label} failed:`, (err as Error).message);
    return false;
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  const connections = [
    {
      url: "postgresql://postgres.htwxqoklsnyezdddmika:Reda2002%40Red@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
      label: "Pooler (eu-central-1)"
    },
    {
      url: "postgresql://postgres.htwxqoklsnyezdddmika:Reda2002%40Red@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
      label: "Pooler (us-east-1)"
    },
    {
      url: "postgresql://postgres.htwxqoklsnyezdddmika:Reda2002%40Red@aws-0-us-west-1.pooler.supabase.com:6543/postgres",
      label: "Pooler (us-west-1)"
    },
    {
      url: "postgresql://postgres.htwxqoklsnyezdddmika:Reda2002%40Red@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
      label: "Pooler (ap-southeast-1)"
    },
    {
      url: "postgresql://postgres:Reda2002%40Red@db.htwxqoklsnyezdddmika.supabase.co:5432/postgres",
      label: "Direct connection"
    },
  ];

  for (const conn of connections) {
    const success = await tryConnect(conn.url, conn.label);
    if (success) process.exit(0);
  }

  console.error("\nAll connection attempts failed. Please check your Supabase credentials.");
  process.exit(1);
}

main();
