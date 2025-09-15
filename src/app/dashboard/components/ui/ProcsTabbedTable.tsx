"use client";

import { useMemo, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import Button from "@/components/common/buttons/Button";

export type Proc = {
  id: string;
  name: string;
  owner: string;
  sharedWith?: string[]; // usernames/emails
  updatedAt?: string;
};

type Props = {
  procs: Proc[];
  currentUser: string;
};

export default function ProcsTabbedTable({ procs, currentUser }: Props) {
  const tabs = ["All", "My Procs", "Shared with Me"] as const;
  type Tab = (typeof tabs)[number];

  const [active, setActive] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = procs;

    if (active === "My Procs") {
      items = procs.filter((p) => p.owner === currentUser);
    } else if (active === "Shared with Me") {
      items = procs.filter(
        (p) => p.owner !== currentUser && (p.sharedWith?.includes(currentUser) ?? false)
      );
    }

    if (!q) return items;

    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        (p.sharedWith?.some((s) => s.toLowerCase().includes(q)) ?? false)
    );
  }, [procs, query, active, currentUser]);

  return (
    <div className="bg-white rounded-md shadow-sm border">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex px-3" aria-label="Procs tabs">
          {tabs.map((t) => {
            const isActive = t === active;
            return (
              <Button
                key={t}
                onClick={() => setActive(t)}
                className={
                  "px-4 py-3 -mb-px text-sm font-medium transition-colors " +
                  (isActive
                    ? "border-b-2 border-blue-600 text-blue-700 rounded-none"
                    : "text-gray-600 hover:text-gray-800")
                }
                aria-current={isActive ? "page" : undefined}
              >
                {t}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <label htmlFor="procs-search" className="sr-only">
          Search procs
        </label>

        <div className="flex items-center gap-2 max-w-md">
          <div className="flex items-center gap-2 w-full bg-gray-50 rounded-md border px-2 py-1">
            {/* If you don't have Heroicons, replace SearchIcon with an SVG or text */}
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              id="procs-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, owner or shared user"
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Search procs"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 pb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Shared With</th>
                <th className="px-3 py-2">Last updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                    No procs found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-3 py-3 text-gray-600">{p.owner}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {p.sharedWith && p.sharedWith.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.sharedWith.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700"
                            >
                              {s}
                            </span>
                          ))}
                          {p.sharedWith.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                              +{p.sharedWith.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{p.updatedAt ?? "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:underline">Open</button>
                        <button className="text-sm text-gray-600 hover:underline">More</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
