"use client";

import { useEffect, useMemo, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Button from "@/components/common/buttons/Button";
import CreateNewProcDialog from "./CreateNewProcDialog";
import type { ProcPayload } from "./CreateNewProcDialog";

export type Proc = {
  id: string;
  name: string;
  owner: string;
  sharedWith?: string[]; // usernames/emails
  updatedAt?: string;
};

type Props = {
  procs: Proc[];
  currentUsername: string;
};

export default function ProcsTabbedTable({ procs, currentUsername }: Props) {

  const [showCreateNewProc, setShowCreateNewProc] = useState(false);
  const tabs = ["All", "My Procs", "Shared With Me"] as const;
  type Tab = (typeof tabs)[number];

  const [active, setActive] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = procs;

    if (active === "My Procs") {
      items = procs.filter((p) => p.owner === currentUsername);
    } else if (active === "Shared with Me") {
      items = procs.filter(
        (p) => p.owner !== currentUsername && (p.sharedWith?.includes(currentUsername) ?? false)
      );
    }

    if (!q) return items;

    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        (p.sharedWith?.some((s) => s.toLowerCase().includes(q)) ?? false)
    );
  }, [procs, query, active, currentUsername]);

  const tryCreateNewProc = async ({ name, description, projectTag }: ProcPayload) => {
    // 1) generate id
    const id = crypto.randomUUID()
    const path = `/procs/${id}`;

    // 2) build the data object in the same shape your DB expects
    const data = {
      root: {
        props: {
          title: name,
          owner: currentUsername,
          projectTag: projectTag ?? null,
          description: description ?? "",
        },
      },
      content: [
        {
          type: "HeadingBlock",
          props: {
            title: name,
            id: `HeadingBlock-${Date.now()}`,
          },
        },
      ],
      zones: {},
    };

    try {
      const res = await fetch("/api/puck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, data }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Request failed: ${res.status}`);
      }

      // Optionally parse server response
      await res.json();

      setShowCreateNewProc(false);
      return { id, path, data };
    } catch (error) {
      console.error("Failed to create proc", error);
      throw error;
    }
  }

  return (
    <div className="bg-white rounded-md shadow-xs border border-gray-300">
      {/* Tabs */}
      <div className="pt-2">
        <nav className="flex px-3 mx-2 border-b border-gray-200" aria-label="Procs tabs">
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
          <div className="ml-auto">
            <Button
              size="none"
              className="px-4 py-1 my-4 bg-green-700 text-white rounded-sm flex hover:bg-green-700/85"
              onClick={() => setShowCreateNewProc(true)}>
              <div className="flex items-center">
                <AddIcon sx={{ fontSize: 24 }} /> <span className="text-sm">New Proc</span>
              </div>
            </Button>
          </div>
        </nav>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <label htmlFor="procs-search" className="sr-only">
          Search procs
        </label>

        <div className="flex items-center gap-2 max-w-md">
          <div className="flex items-center gap-2 w-full bg-gray-50 rounded-md border border-gray-500 px-2 py-1">
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
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500 ">
                    No procs found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 ">
                    <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-3 py-3 text-gray-600">{p.owner}</td>
                    <td className="px-3 py-3 text-gray-600 ">
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
                        <button className="text-sm text-blue-600 hover:underline hover:cursor-pointer">View</button>
                        <button className="text-sm text-blue-600 hover:underline hover:cursor-pointer">Edit</button>
                        <button className="text-sm text-gray-600 hover:underline hover:cursor-pointer">More</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render NewProcDialog */}
      {showCreateNewProc &&
        <CreateNewProcDialog
          open={showCreateNewProc}
          onClose={() => setShowCreateNewProc(false)}
          onCreate={tryCreateNewProc}
          projectTags={["Viasat", "Northrop", "Qualcomm"]}
        />}
    </div>
  );
}
