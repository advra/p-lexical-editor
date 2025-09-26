import React, { useState } from 'react';
import { BackToDashboardButton } from './BackToDashboardButton';
import { ExportPDFButton } from './ExportPDFButton';
import { PaperPage } from './PaperPage';
import { EditButton } from './EditButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ProcMetadataDialog, { MetadataInfo } from './ProcMetadataDialog';
import { ProcMetadataDetailsButton } from './ProcMetadataDetailsButton';
import { BackToViewMode } from './BackToViewModeButton';

type Props = {
  viewMode: boolean;
  handlePreviewPrint: () => void | Promise<void>;
  metadata: MetadataInfo;
  path: string;
  title: string;
  description?: string;
  tags?: string[];
  executionMode?: boolean;
};

export const Header = ({
  handlePreviewPrint,
  path,
  executionMode = false,
  title,
  description,
  tags,
}: Props) => {
  const [showProcMetadataDetails, setShowProcMetadataDetails] = useState(false);

  const tryUpdateProcMetadata = () => {};

  const handleMetadataDetails = () => {
    setShowProcMetadataDetails(true);
  };

  const ViewModeLabel = () => {
    return (
      <div className="ml-auto text-center flex gap-2 text-blue-400">
        <div>
          <VisibilityIcon className="mb-0.5" />
        </div>
        <div>View Mode</div>
      </div>
    );
  };

  const ExecutionModeLabel = () => {
    return (
      <div className="ml-auto text-center flex gap-2 text-orange-400">
        <div>
          <ElectricBoltIcon className="mb-0.5" />
        </div>
        <div>Execution Mode</div>
      </div>
    );
  };

  console.log('DATA', title);

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
          className="sticky top-0 z-40 py-1 bg-white/80 backdrop-blur 
        supports-[backdrop-filter]:bg-white/60 shadow-sm"
        >
          <div className="px-4 mx-auto max-w-screen">
            <div className="flex items-center h-12">
              <BackToDashboardButton />
              <div className="pl-1">
                {executionMode && <BackToViewMode path={path} />}
              </div>
              {executionMode ? <ExecutionModeLabel /> : <ViewModeLabel />}
              <div className="ml-auto flex gap-2">
                <ProcMetadataDetailsButton
                  openMetadataDetails={handleMetadataDetails}
                />
                {!executionMode && (
                  <>
                    <ExportPDFButton handlePreviewPrint={handlePreviewPrint} />
                    <EditButton path={path} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
