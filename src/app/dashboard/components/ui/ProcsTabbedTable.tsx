'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Button from '@/components/common/buttons/Button';
import CreateNewProcDialog from './CreateNewProcDialog';
import type { ProcPayload } from './CreateNewProcDialog';
import { initialProcsData } from '@/app/procs/utils/initialData';
import { PuckPageData } from '@/app/puck/types';
import Link from 'next/link';
import RedirectingDialog from './RedirectingDialog';
import { Menu, MenuItem } from '@mui/material';
import { User } from '@/modules/auth/types';
import ManagePermissionsDialog, {
  UserPermission,
} from './ManagePermissionsDialog';

export type Proc = {
  _id: string;
  slug: string;
  tags?: string[];
  name: string;
  owner: string;
  sharedWith?: string[]; // usernames/emails
  version: number;
  updatedAt?: string | Date;
  data: PuckPageData;
};

type Props = {
  procs: Proc[];
  currentUser: User | null;
};

const formatWhen = (v?: string | Date) =>
  v ? new Date(v).toLocaleString() : '—';

export default function ProcsTabbedTable({ procs, currentUser }: Props) {
  const [showCreateNewProc, setShowCreateNewProc] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [showManagePermissions, setShowManagePermissions] = useState(false);
  const [selectedProc, setSelectedProc] = useState<Proc | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProcForMenu, setSelectedProcForMenu] = useState<Proc | null>(
    null,
  );
  const open = Boolean(anchorEl);
  const tabs = ['All', 'My Procs', 'Shared With Me'] as const;
  type Tab = (typeof tabs)[number];

  const [active, setActive] = useState<Tab>('All');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = procs;

    console.log('ALL PROCS: ', procs);

    if (active === 'My Procs') {
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, proc: Proc) => {
    setAnchorEl(event.currentTarget);
    setSelectedProcForMenu(proc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProcForMenu(null);
  };

  const handleManagePermissions = () => {
    if (selectedProcForMenu) {
      setSelectedProc(selectedProcForMenu);
      setShowManagePermissions(true);
    }
    handleMenuClose();
  };

  const handlePermissionsUpdate = async (
    procId: string,
    permissions: UserPermission[],
  ) => {
    // TODO: Implement API call to update permissions
    console.log('Updating permissions for proc:', procId, permissions);

    // Mock implementation - replace with actual API call
    try {
      const response = await fetch(`/api/puck/proc/${procId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      // Refresh the procs list or update local state
      // For now, we'll just log success
      console.log('Permissions updated successfully');
    } catch (error) {
      console.error('Failed to update permissions', error);
      throw error;
    }
  };

  const tryCreateNewProc = async ({ name, description, tags }: ProcPayload) => {
    console.log(`Creating: name: ${name} desc: ${description} tag: ${tags}`);
    // 1) generate id
    // const id = crypto.randomUUID();
    // const path = `/procs/${id}`;

    // check if valid user
    if (!currentUser) {
      console.error(
        'Creating Eproc failed. No user is logged in to create eproc',
      );
    } else {
      // 2) build the data object in the same shape your DB expects
      const initialData = initialProcsData({
        owner: currentUser.username,
        title: name,
        description: description || undefined,
        tags: tags ? [] : undefined,
      });

      console.log('initialData: ', initialData);

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

        // Optionally parse server response
        const { id, path } = await res.json();

        setShowCreateNewProc(false);
        // render loading new page message
        setShowRedirectDialog(true);
        // The dialog expects this return value to navigate to the new proc
        return { id, path, initialData } as any;
      } catch (error) {
        console.error('Failed to create proc', error);
        throw error;
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow-xs border border-gray-300 flex flex-col h-full min-h-[800px]">
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
              onClick={() => setShowCreateNewProc(true)}
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
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-gray-500 "
                  >
                    No procs found
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
                        {/* {!p.published && (
                          <span className="text-gray-500"> (DRAFT)</span>
                        )} */}
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
                          <Link href={`procs/${p.slug}`}> View</Link>
                        </button>
                        <button className="text-sm text-blue-600 hover:underline hover:cursor-pointer">
                          <Link href={`procs/${p.slug}/edit`}> Edit</Link>
                        </button>
                        {/* TODO: Add Delete, Edit Metadata, Manage Permissions */}
                        {currentUser?.username === p.owner && (
                          <button
                            className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
                            onClick={(e) => handleMenuOpen(e, p)}
                          >
                            More
                          </button>
                        )}
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleMenuClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          slotProps={{
                            paper: {
                              elevation: 0,
                              sx: {
                                boxShadow:
                                  '0 12px 28px rgba(0,0,0,0.01), 0 2px 6px rgba(0,0,0,0.05)',
                                minWidth: 200,
                              },
                            },
                          }}
                        >
                          {/* TODO: eproc-3 Implement Publish and unpublish for drafts *
                          <MenuItem key="unpublish">
                            <div>Unpublish</div>
                          </MenuItem> */}
                          <MenuItem
                            key="managePermissions"
                            onClick={handleManagePermissions}
                          >
                            <div>Manage Permissions</div>
                          </MenuItem>
                        </Menu>
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
            Showing {startIndex + 1}-{endIndex} of {totalItems} Procs
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
      {showCreateNewProc && (
        <CreateNewProcDialog
          open={showCreateNewProc}
          onClose={() => setShowCreateNewProc(false)}
          onCreate={tryCreateNewProc}
          tags={['Viasat', 'Northrop', 'Qualcomm']}
        />
      )}
      {showRedirectDialog && <RedirectingDialog open={showRedirectDialog} />}
      {showManagePermissions && selectedProc && (
        <ManagePermissionsDialog
          open={showManagePermissions}
          onClose={() => setShowManagePermissions(false)}
          proc={selectedProc}
          onPermissionsUpdate={handlePermissionsUpdate}
        />
      )}
    </div>
  );
}
