'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { User } from '@/modules/auth/types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

import Button from '@/components/common/buttons/Button';
import CreateNewDocDialog from './CreateNewDocDialog';
import type { ProcPayload } from './CreateNewDocDialog';
import { initialProcsData } from '@/app/procs/utils/initialData';
import { PuckPageData } from '@/app/puck/types';
import RedirectingDialog from './RedirectingDialog';
import PreviewButton from './navigation/preview-button';
import EditButton from './navigation/edit-button';

export type Doc = {
  _id: string;
  slug: string;
  tags?: string[];
  name: string; //title to match the model?
  owner: string;
  sharedWith?: string[]; // usernames/emails
  version: number;
  updatedAt: string | Date;
  createdAt: string | Date;
  data: PuckPageData;
};

type Props = {
  docs: Doc[];
  currentUser: User | null;
};

const formatWhen = (v?: string | Date) =>
  v ? new Date(v).toLocaleString() : '—';

export default function DocsTabbedTable({ docs: procs, currentUser }: Props) {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const tabs = ['All', 'My Documents', 'Shared With Me'] as const;
  type Tab = (typeof tabs)[number];

  const [active, setActive] = useState<Tab>('All');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = procs;

    console.log('ALL PROCS: ', procs);

    if (active === 'My Documents') {
      items = procs.filter((p) => p.owner === currentUser?.username);
    } else if (active === 'Shared With Me') {
      if (currentUser) {
        items = procs.filter(
          (p) =>
            p.owner !== currentUser?.username &&
            (p.sharedWith?.includes(currentUser.username) ?? false),
        );
      } else {
        items = [];
      }
    }

    if (!q) return items;

    // Guard for missing fields and support title vs name
    return items.filter((p) => {
      const title = (p.data?.root?.props?.title ?? p.name ?? '').toLowerCase();
      const owner = (p.owner ?? '').toLowerCase();
      const shared = (p.sharedWith ?? []).map((s) => s.toLowerCase());
      return (
        title.includes(q) ||
        owner.includes(q) ||
        shared.some((s) => s.includes(q))
      );
    });
  }, [procs, query, active, currentUser]);

  // Pagination logic
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, active, filtered.length]);

  const tryCreateNewProc = async ({ name, description, tags }: ProcPayload) => {
    if (!currentUser) {
      console.error(
        'Creating Eproc failed. No user is logged in to create eproc',
      );
    } else {
      const initialData = initialProcsData({
        owner: currentUser.username,
        title: name,
        description: description || undefined,
        tags: tags ? [] : undefined,
      });

      try {
        const res = await fetch('/api/puck/proc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: initialData }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || `Request failed: ${res.status}`);
        }

        const { id, path } = await res.json();

        setShowCreateNew(false);
        setShowRedirectDialog(true);
        return { id, path, initialData } as any;
      } catch (error) {
        console.error('Failed to create proc', error);
        throw error;
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow-xs border border-gray-300 flex flex-col h-[80dvh]">
      {/* Tabs */}
      <div className="pt-2">
        <nav
          className="flex px-3 mx-2 border-b border-gray-200"
          aria-label="Procs tabs"
        >
          {tabs.map((t) => {
            const isActive = t === active;
            return (
              <Button
                key={t}
                onClick={() => setActive(t)}
                className={
                  'px-4 py-3 -mb-px text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'border-b-2 border-blue-600 text-blue-700 rounded-none'
                    : 'text-gray-600 hover:text-gray-800')
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {t}
              </Button>
            );
          })}
          <div className="ml-auto">
            <Button
              size="none"
              className="px-4 py-1 my-4 bg-green-700 text-white rounded-sm flex hover:bg-green-700/85"
              onClick={() => setShowCreateNew(true)}
            >
              <div className="flex items-center">
                <AddIcon sx={{ fontSize: 24 }} />{' '}
                <span className="text-sm">Create</span>
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
                onClick={() => setQuery('')}
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
      <div className="px-4 flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-gray-500 uppercase sticky top-0 bg-white">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Shared With</th>
                <th className="px-3 py-2">Last updated</th>
                <th className=" py-2">Version</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="h-auto px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No Documents Found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 ">
                    <td className="flex px-3 py-3 text-gray-800">
                      <Link href={`procs/${p.slug}`}>
                        <span className="font-medium">
                          {p.data?.root?.props?.title ?? p.name}
                        </span>
                      </Link>
                    </td>
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
                    <td className="px-3 py-3 text-gray-600">
                      {formatWhen(p.updatedAt)}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{p.version}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:underline hover:cursor-pointer">
                          <PreviewButton slug={p.slug} />
                        </button>
                        <button className="text-sm text-blue-600 hover:underline hover:cursor-pointer">
                          <EditButton slug={p.slug} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {totalItems} Documents
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <SkipPreviousIcon sx={{ fontSize: 16 }} />
            </Button>

            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 5))}
              disabled={currentPage <= 5}
            >
              -5
            </Button>

            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </Button>

            <span className="px-2 py-1 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </Button>

            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 5))
              }
              disabled={currentPage + 5 > totalPages}
            >
              +5
            </Button>

            <Button
              size="none"
              className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <SkipNextIcon sx={{ fontSize: 16 }} />
            </Button>
          </div>
        </div>
      )}

      {/* Render dialogs */}
      {showCreateNew && (
        <CreateNewDocDialog
          open={showCreateNew}
          onClose={() => setShowCreateNew(false)}
          onCreate={tryCreateNewProc}
          tags={['Tag1', 'Tag2', 'Tag3']}
        />
      )}
      {showRedirectDialog && <RedirectingDialog open={showRedirectDialog} />}
    </div>
  );
}
