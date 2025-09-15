// components/TocClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import SearchIcon from '@mui/icons-material/Search';

export interface Link {
  href: string;
  label: string;
}

interface Props {
  links: Link[];
}

// export default function TocClient({ links }: Props) {
//   const router = useRouter();

//   // group into rows of two
//   const rows: Link[][] = [];
//   for (let i = 0; i < links.length; i += 2) {
//     rows.push(links.slice(i, i + 2));
//   }

//   return (
//     <>
//       <div className="bg-blue-900 w-[250px] max-h-full">

//       </div>
//       {/* {rows.map((row, rowIndex) => (
//         <tr key={`row-${rowIndex}`} className="border-b last:border-none">
//           {row.map((link, colIndex) => (
//             <td
//               key={`cell-${colIndex}`}
//               className="px-6 py-4 text-center cursor-pointer text-blue-600 hover:text-blue-800 transition-colors font-medium"
//               onClick={() => handleClick(link.href)}
//               role="link"
//               tabIndex={0}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") {
//                   handleClick(link.href);
//                 }
//               }}
//             >
//               {link.label}
//             </td>
//           ))}
//         </tr>
//       ))} */}
//     </>
//   );
// }

export default function ClientDashboardSidebar({ links }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [compact, setCompact] = useState(false);

  // simple filtered list based on search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) => l.label.toLowerCase().includes(q) || l.href.toLowerCase().includes(q)
    );
  }, [links, query]);

  return (
    <>
      <aside
        className="bg-[#162640] text-white w-[250px] overflow-auto shadow-lg flex flex-col"
        aria-label="Table of contents sidebar"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* <h2 className="text-sm font-semibold">Contents</h2> */}

          {/* Option toggle */}
          {/* <button
            aria-expanded={showOptions}
            onClick={() => setShowOptions((s) => !s)}
            className="text-xs bg-blue-800/60 hover:bg-blue-800 px-2 py-1 rounded"
            title="Options"
          >
            Options
          </button> */}
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <label htmlFor="toc-search" className="sr-only">
            Search contents
          </label>
          <div className="flex items-center gap-2">
            <SearchIcon fontSize="small" className="text-gray-400" />
            <input
              id="toc-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full text-sm px-2 py-1 rounded bg-transparent placeholder-blue-200 focus:outline-none"
              aria-label="Search contents"
            />
          </div>

        </div>

        <div className="border-b border-gray-700"></div>

        {/* Options panel (collapsible) */}
        {/* {showOptions && (
          <div className="px-3 py-2 border-b border-blue-800 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span>Compact mode</span>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
                aria-label="Toggle compact mode"
                className="h-4 w-4"
              />
            </div>

            <div className="text-xs text-blue-200">
              Use the options to change how the sidebar looks.
            </div>
          </div>
        )} */}

        {/* Menu / Links */}
        <nav className="px-1 py-2 flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-blue-200">No matches</div>
          ) : (
            <ul className={`space-y-1 ${compact ? "text-xs" : "text-sm"}`}>
              {filtered.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => {
                      router.push('/procs/' + link.href);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-800/60 rounded flex items-center gap-2 hover:cursor-pointer"
                    title={link.label}
                  >
                    {/* small bullet icon */}
                    <span className="w-2 h-2 rounded-full bg-blue-300/80 inline-block shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Spacer / Footer area */}
        {/* <div className="px-3 py-3 border-t border-blue-800">
          <div className="text-xs text-blue-200">Space</div>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => {
                setQuery("");
              }}
              className="text-xs bg-blue-800/50 hover:bg-blue-800 px-2 py-1 rounded"
            >
              Clear search
            </button>

            <button
              onClick={() => {
                router.push("/");
              }}
              className="text-xs bg-blue-700/80 hover:bg-blue-700 px-2 py-1 rounded"
            >
              Home
            </button>
          </div>
        </div> */}
      </aside>
    </>
  );
}
