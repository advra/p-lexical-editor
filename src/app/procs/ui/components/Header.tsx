'use client';

import React, { useMemo, useState } from 'react';
import { BackToDashboardButton } from './BackToDashboardButton';
import { ExportPDFButton } from './ExportPDFButton';
import { EditButton } from './EditButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ProcMetadataDialog, { MetadataInfo } from './ProcMetadataDialog';
import { ProcMetadataDetailsButton } from './ProcMetadataDetailsButton';
import { BackToViewMode } from './BackToViewModeButton';
import { ExecuteModeButton } from './ExecuteModeButton';
import { SessionButtons } from './SessionButton';
import { User } from '@/modules/auth/types';
import { CircularProgress } from '@mui/material';
import { ProcPermissions } from '@/context/ProcContext';

type Props = {
  viewMode: boolean;
  handlePreviewPrint: () => void | Promise<void>;
  metadata: MetadataInfo;
  path: string;
  title: string;
  description?: string;
  tags?: string[];
  executionMode?: boolean;
  presenceDisplay: any;
  permissions: ProcPermissions;
  user: User | undefined;
  loading: boolean;
};

export const Header = ({
  handlePreviewPrint,
  path,
  executionMode = false,
  title,
  description,
  tags,
  presenceDisplay,
  permissions,
  user,
  loading,
}: Props) => {
  const [showProcMetadataDetails, setShowProcMetadataDetails] = useState(false);

  const tryUpdateProcMetadata = () => {};

  const handleMetadataDetails = () => {
    setShowProcMetadataDetails(true);
  };

  const ViewModeLabel = () => {
    return (
      <div
        id="main-header"
        className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 text-blue-400"
      >
        <div>
          <VisibilityIcon className="mb-0.5" />
        </div>
        <div>Preview Mode</div>
      </div>
    );
  };

  const ExecutionModeLabel = () => {
    return (
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 text-orange-400">
        <div>
          <ElectricBoltIcon className="mb-0.5" />
        </div>
        <div>Execution Mode</div>
      </div>
    );
  };

  const metadata: MetadataInfo = {
    title: title,
    description: description ?? '',
    tags: tags,
  };

  return (
    <>
      {showProcMetadataDetails && (
        <ProcMetadataDialog
          metadata={metadata}
          open={showProcMetadataDetails}
          onClose={() => setShowProcMetadataDetails(false)}
          onUpdate={tryUpdateProcMetadata}
          //   projectTags={['Viasat', 'Northrop', 'Qualcomm']}
        />
      )}
      <div className="no-print">
        <div
          className="fixed w-full top-0 z-40 py-1 bg-white/80 backdrop-blur 
        supports-[backdrop-filter]:bg-white/60 shadow-sm"
        >
          <div className="px-4 mx-auto max-w-screen">
            <div className="flex items-center h-12 gap-1">
              <BackToDashboardButton />
              <div className="pl-1">
                {executionMode && <BackToViewMode path={path} />}
              </div>
              <div className="flex gap-1 text-sm text-gray-500">
                <span>Viewers:</span>
                <div>
                  {loading ? (
                    <>
                      <CircularProgress size={12} />
                    </>
                  ) : (
                    <>{presenceDisplay}</>
                  )}
                </div>
              </div>
              {executionMode ? <ExecutionModeLabel /> : <ViewModeLabel />}
              <div className="ml-auto flex gap-1 items-center">
                <ProcMetadataDetailsButton
                  openMetadataDetails={handleMetadataDetails}
                />
                {executionMode ? (
                  <SessionButtons
                    user={user}
                    canExecute={permissions.execute}
                  />
                ) : (
                  <>
                    <ExportPDFButton handlePreviewPrint={handlePreviewPrint} />
                    <EditButton path={path} disabled={!permissions.edit} />
                    <ExecuteModeButton
                      path={path}
                      disabled={permissions.execute}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {!executionMode && (
            <div className="bg-yellow-100 text-center text-yellow-700 text-sm">
              You are viewing a read-only version of this procedure. Items are
              displayed based on your current user permissions. If you have
              permissions you can begin a session to start a test execution.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
