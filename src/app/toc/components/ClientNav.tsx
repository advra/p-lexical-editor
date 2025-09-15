// app/toc/page.tsx   (Server component)
import fs from "fs";
import path from "path";
import ClientDashboardSidebar, { Link } from "./ClientDashboardSidebar";

// Define shape of DB as you expect
interface PageData {
  root: { props?: { title?: string } };
  content: any[];
  zones: Record<string, any[]>;
}
type DatabaseSchema = Record<string, PageData>;

export default function Page() {
  // Resolve configured path relative to project root
  const dbRelative = process.env.DB_JSON_PATH ?? "./data/database.json";
  const dbPath = path.join(process.cwd(), dbRelative);

  // Read and parse synchronously (on server only)
  const raw = fs.readFileSync(dbPath, "utf8");
  const database = JSON.parse(raw) as DatabaseSchema;

  // Convert database to the Link[] you expect (or compute inside client)
  const links: Link[] = Object.keys(database).map((p) => ({
    href: p,
    label: p === "/" ? "Home" : p.replace(/^\//, ""),
  }));

  // Pass links as props into the client component
  return <ClientDashboardSidebar links={links} />;
}
