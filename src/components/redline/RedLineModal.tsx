import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useRef, useLayoutEffect, useState, useEffect } from 'react';

type Props = {
  loading: boolean;
  originalText: string;
  dcn: string;
  description: string;
  handleCloseRedlineModal: () => void;
  handleSaveRedlineModal: () => void;
  setDcn: (value: string) => void;
  setDescription: (value: string) => void;
  showRedlineModal: boolean;
};

export const RedLineModal = ({
  loading,
  originalText,
  dcn,
  description,
  handleCloseRedlineModal,
  handleSaveRedlineModal,
  setDcn,
  setDescription,
  showRedlineModal,
}: Props) => {
  const lineHeightClass = 'leading-6';
  const oldBlockRef = useRef<HTMLDivElement | null>(null);
  const [minRows, setMinRows] = useState<number>(6);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const initial = useRef({ dcn: '', description: '' });
  const hasInit = useRef(false);

  const normalize = (s: string) => (s ?? '').replace(/\r\n/g, '\n');
  const isDirty =
    normalize(dcn) !== normalize(initial.current.dcn) ||
    normalize(description) !== normalize(initial.current.description);

  useEffect(() => {
    if (showRedlineModal) {
      hasInit.current = false;
    }
  }, [showRedlineModal]);

  useEffect(() => {
    if (showRedlineModal && !hasInit.current) {
      // next frame to let parent setState flush
      const id = requestAnimationFrame(() => {
        initial.current = { dcn, description };
        hasInit.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [showRedlineModal, dcn, description]);

  // attempt to close (from cancel button, backdrop, or ESC)
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      handleCloseRedlineModal();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    handleCloseRedlineModal();
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  useLayoutEffect(() => {
    const element = oldBlockRef.current;
    if (!element) return;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '24');
    const currentHeight = element.clientHeight || 0;
    if (lineHeight > 0 && currentHeight > 0) {
      const rows = Math.max(3, Math.floor(currentHeight / lineHeight));
      setMinRows(rows);
    }
  }, [originalText, showRedlineModal]);
  return (
    <>
      <Dialog
        disableScrollLock
        open={showRedlineModal}
        onClose={(_e, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            handleAttemptClose();
          }
        }}
        fullWidth
        maxWidth="xl"
      >
        <div className="p-4">
          <h3>{dcn ? 'Edit Redline' : 'Create New Redline'}</h3>
        </div>

        <div className="px-4 mb-8">
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* DCN on top */}
            <TextField
              margin="dense"
              id="redline-text-dcn"
              label="Document Change Number (DCN)"
              type="text"
              fullWidth
              variant="outlined"
              value={dcn}
              onChange={(e) => setDcn(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <div className="w-full">
              <div className="grid grid-cols-2 gap-4">
                <label className="justify-self-start block text-sm mb-1">
                  <span className="font-medium">Original</span>
                </label>
                <label className="flex justify-self-start text-sm mb-1 gap-1">
                  <span className="font-medium">New</span>
                  <span>*</span>
                </label>
              </div>
            </div>

            {/* ONE shared scroll container drives both columns */}
            <div className="max-h-[55dvh] overflow-auto">
              <div className="grid grid-cols-2 gap-4 min-h-full">
                {/* LEFT: Old / read-only */}
                <div className="flex flex-col min-h-full hover:cursor-not-allowed bg-gray-200">
                  <div
                    ref={oldBlockRef}
                    className={`flex-1 rounded border border-gray-300 p-3 whitespace-pre-wrap ${lineHeightClass}`}
                    // NOTE: no overflow here — scrolling is on the parent
                  >
                    {originalText}
                  </div>
                </div>

                {/* RIGHT: New / editable (auto-grows, no inner scrollbar) */}
                <div className="flex flex-col min-h-full">
                  <div className="flex-1 rounded border border-gray-300">
                    <TextareaAutosize
                      required
                      minRows={minRows} // at least fill visible height
                      value={description}
                      placeholder="Enter a description for suggested changes"
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full resize-none outline-none p-3 ${lineHeightClass}`}
                      style={{
                        // Make sure it fills and lets the parent be the only scrollable thing
                        boxSizing: 'border-box',
                        // Prevent its own scrollbar; grow instead:
                        overflow: 'hidden',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </div>

        <div className="ml-auto flex gap-2 pb-4 pr-4">
          <Button
            variant="outlined"
            onClick={() => handleAttemptClose()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRedlineModal}
            disabled={loading || !dcn.length || !description.length}
          >
            Apply
          </Button>
        </div>
      </Dialog>

      {/* Confirmation modal */}
      {showDiscardModal && (
        <Dialog
          open={showDiscardModal}
          onClose={handleCancelDiscard}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Discard Changes?</DialogTitle>
          <DialogContent>
            Are you sure you want to discard DCN changes? This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDiscard} autoFocus>
              Keep Editing
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDiscard}
            >
              Discard
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
