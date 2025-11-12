'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@/modules/auth/types';

export type ProcPermissions = {
  read: boolean;
  edit: boolean;
  execute: boolean;
};

export type ProcViewModes = 'none' | 'view' | 'edit' | 'execute';

// map username to their permissions
export type ProcPermissionMap = Record<string, ProcPermissions>;

export type ProcContextType = {
  owner: string;
  permissions: ProcPermissionMap;
  currentUser?: User;
  procId: string;
  viewMode: ProcViewModes;
};

const ProcContext = createContext<ProcContextType | null>(null);

type ProcProviderProps = {
  children: ReactNode;
  owner: string;
  currentUser?: User;
  procId: string;
  viewMode: ProcViewModes;
};

export function ProcProvider({
  children,
  owner,
  currentUser,
  procId,
  viewMode,
}: ProcProviderProps) {
  const value = {
    owner,
    currentUser,
    procId,
    viewMode,
  };

  return <ProcContext.Provider value={value}>{children}</ProcContext.Provider>;
}

export function useProc() {
  const context = useContext(ProcContext);
  if (!context) {
    throw new Error('useProc must be used within a ProcProvider');
  }
  return context;
}

// Helper hook for checking permissions
export function useProcPermissions() {
  const { owner, currentUser, viewMode } = useProc();

  const isOwner = currentUser?.username === owner;
  const isAdmin = currentUser?.roles?.includes('admin');

  const permissions = {
    read: isOwner || isAdmin || true, // Default to true for now
    edit: !!(isOwner || isAdmin),
    execute: !!(isOwner || isAdmin),
  };

  const canRead = permissions.read || currentUser?.username === owner;
  const canEdit = permissions.edit || currentUser?.username === owner;
  const canExecute = permissions.execute || currentUser?.username === owner;

  return {
    viewMode,
    canRead,
    canEdit,
    canExecute,
    isOwner,
    isAdmin,
    hasPermission: (permission: keyof ProcPermissions) => {
      if (isOwner || isAdmin) return true;
      return permissions[permission] || false;
    },
  };
}
