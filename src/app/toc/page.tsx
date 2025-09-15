// src/app/toc/page.tsx  (server component)
import fs from "fs";
import path from "path";
import TocClient, { Link } from "./components/ClientToc";
import { DatabaseError } from "./components/DatabaseError";
import LogoutButton from "@/components/common/buttons/LogoutButton";
import { Navbar } from "@/components/common/Navbar";

interface PageData {
  root: { props?: { title?: string } };
  content: any[];
  zones: Record<string, any[]>;
}
type DatabaseSchema = Record<string, PageData>;

export default function Page() {
  const dbRelative = process.env.DB_JSON_PATH ?? "";

  const getNavLinks = (dbPathOrRelative: string): Link[] => {
    if (!dbPathOrRelative) {
      throw new Error("DB_JSON_PATH not configured");
    }

    // Candidate absolute paths to try
    const candidates = [
      dbPathOrRelative, // maybe already absolute
      path.join(process.cwd(), dbPathOrRelative), // relative to project root
      path.join(process.cwd(), "src", dbPathOrRelative.replace(/^\.\//, "")), // relative to src/
      path.resolve(dbPathOrRelative), // resolved from current CWD
    ];

    // Find the first candidate that exists
    const found = candidates.find((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isFile();
      } catch {
        return false;
      }
    });

    if (!found) {
      // helpful error with all tried candidates
      throw new Error(
        `DB file not found. Tried:\n${candidates.map((c) => ` - ${c}`).join("\n")}`
      );
    }

    const raw = fs.readFileSync(found, "utf8");
    let database: DatabaseSchema;
    try {
      database = JSON.parse(raw) as DatabaseSchema;
    } catch (err) {
      throw new Error(`Failed to parse DB JSON at ${found}: ${(err as Error).message}`);
    }

    const links: Link[] = Object.keys(database).map((p) => ({
      href: p,
      label: p === "/" ? "Home" : p.replace(/^\//, ""),
    }));

    return links;
  };

  try {
    const links = getNavLinks(dbRelative);
    return (
      <>
        <Navbar />
        <TocClient links={links} />
      </>
    )
  } catch (err) {
    console.error("Error loading database:", err);
    return <DatabaseError />;
  }
}
