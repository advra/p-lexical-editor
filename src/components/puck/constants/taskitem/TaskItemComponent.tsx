function TaskItemComponent({ step, recordId, content, recordData }) {
  //   logger.debug(
  //     `TaskItemComponent:  recordId=${recordId}, props.recordData?redline_content = ${recordData?.redline_content}`,
  //   );

  // const { store, updateStore } = useContext(StoreContext);
  // const { sessionId, loadingSession } = useContext(SessionContext);

  // const record = store?.[recordId]; // optional chaining notion.  Return the item from store whose key matches recordId. If store is undefined or there’s no matching key, return undefined
  // const [loading, setLoading] = useState(false);
  // const { user } = useContext(SessionContext);
  // const [anchorEl, setAnchorEl] = useState(null);
  // const menuOpen = Boolean(anchorEl);

  // // State for Redline Modal
  // const [showRedlineModal, setShowRedlineModal] = useState(false);

  // const [dcnInput, setDcnInput] = useState('');
  // const [redlineInput, setRedlineInput] = useState('');

  // async function onIconButton(event) {
  //   logger.debug(`onIconButton: sessionId=${sessionId}, recordId=${recordId}`);
  //   setAnchorEl(event.currentTarget);
  // }

  // function handleMenuClose() {
  //   setAnchorEl(null);
  // }

  // function handleUnmark() {
  //   logger.debug('Unmark complete clicked');
  //   handleMenuClose();
  // }

  // function handleMakeRedline() {
  //   logger.debug('handleMakeRedline - Redline clicked');

  //   setDcnInput(record?.dcn || ''); // Pre-fill DCN from record if available
  //   setRedlineInput(record?.redline || ''); // Pre-fill redline from record if available
  //   setShowRedlineModal(true); // Open the modal

  //   handleMenuClose();
  // }

  // function RedlineDialog({ open, onClose }) {
  //   return (
  //     <Dialog open={open} onClose={onClose}>
  //       <DialogTitle>Redline Record</DialogTitle>
  //       <DialogContent>
  //         {/* Your redline form or content goes here */}
  //         This is where you'll enter redline content.
  //       </DialogContent>
  //       <DialogActions>
  //         <Button onClick={onClose}>Cancel</Button>
  //         <Button onClick={onClose} variant="contained">
  //           Save
  //         </Button>
  //       </DialogActions>
  //     </Dialog>
  //   );
  // }

  // // Handles cancelling the redline input from the modal
  // const handleCloseRedlineModal = useCallback(() => {
  //   logger.debug('handleCloseRedlineModal clicked');
  //   setShowRedlineModal(false); // Close the modal
  //   //setRedlineModalInput(""); // Clear the input
  // }, []);

  // async function onUnmarkComplete() {
  //   logger.debug(`onUnmarkComplete: recordId=${recordId}`);

  //   try {
  //     //await deleteRecordById(recordId);

  //     // update the state of the record. The resultant is 'newRecord'
  //     const newRecord = await updateRecordState(
  //       sessionId,
  //       recordId,
  //       'unmark complete',
  //       user?.username,
  //       {
  //         isRedlined: record?.isRedlined,
  //         dcn: record?.dcn,
  //         redline_content: record?.redline_content,
  //       },
  //     );

  //     updateStore({ ...newRecord }); // mark it as removed in store
  //     //fetchData(); // optional: refresh from server if needed

  //     const actionPerformed = {
  //       recId: recordId,
  //     };

  //     logger.debug(`tx send-recordId-actionPerformed`);

  //     socket.emit('send-recordId-actionPerformed', actionPerformed);
  //   } catch (err) {
  //     logger.error(`Failed to delete record ${recordId}:`, err);
  //   }
  // }

  // async function fetchData() {
  //   logger.debug(`fetchData - I am recordId ${recordId}`);

  //   const data = await fetchRecordById(recordId);
  //   if (data?.data?.record) {
  //     logger.debug(`Fetched record for recordId=${recordId}`);
  //     //logger.info(`In TaskItemComponent fetched ${recordId}, ${JSON.stringify(data.data.record, null, 2)}`);

  //     updateStore(data.data.record);
  //   } else {
  //     logger.debug(`Record not found for recordId=${recordId}`);
  //     updateStore({ record_id: recordId, state: null });
  //   }
  // }

  // // this function is executed upon clicking on the "Mark Complete" button
  // async function onMarkComplete() {
  //   logger.debug(
  //     `onMarkComplete: sessionId=${sessionId}, recordId=${recordId}`,
  //   );

  //   if (sessionId) {
  //     setLoading(true); // turn on loading animation

  //     // update the state of the record. The resultant is 'newRecord'
  //     const newRecord = await updateRecordState(
  //       sessionId,
  //       recordId,
  //       'complete',
  //       user?.username,
  //       {
  //         isRedlined: record?.isRedlined,
  //         dcn: record?.dcn,
  //         redline_content: record?.redline_content,
  //       },
  //     );
  //     logger.debug(newRecord);

  //     // update the context to the newRecord
  //     if (newRecord != null) {
  //       updateStore(newRecord);

  //       const actionPerformed = {
  //         recId: recordId,
  //       };

  //       logger.info(`tx send-recordId-actionPerformed`);

  //       socket.emit('send-recordId-actionPerformed', actionPerformed);
  //     }

  //     setLoading(false); // turn off loading animation
  //   } else {
  //     logger.debug('onMarkComplete: NOT in sessionId');
  //   }
  // }

  // const handleSaveRedlineModal = useCallback(async () => {
  //   logger.debug(`handleSaveRedlineModal - exec dcnInput= ${dcnInput}`);
  //   logger.debug(`handleSaveRedlineModal - exec redlineInput ${redlineInput}`);

  //   if (!sessionId) {
  //     logger.debug(
  //       'handleSaveRedlineModal: Not in session or redline text is empty. Cancelling.',
  //     );
  //     handleCloseRedlineModal();
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const newRecord = await updateRecordState(
  //       sessionId,
  //       recordId,
  //       'redlined',
  //       user?.username,
  //       {
  //         isRedlined: true,
  //         dcn: dcnInput,
  //         redline_content: redlineInput,
  //       },
  //     );

  //     if (newRecord != null) {
  //       updateStore({
  //         ...newRecord,
  //         isRedlined: true,
  //         dcn: dcnInput, // Store DCN in local state for immediate UI update
  //         redline_content: redlineInput,
  //         state: 'redlined',
  //       });

  //       const actionPerformed = {
  //         recId: recordId,
  //       };
  //       socket.emit('send-recordId-actionPerformed', actionPerformed);
  //     }
  //   } catch (err) {
  //     logger.error(`Failed to save redline for record ${recordId}:`, err);
  //   } finally {
  //     setLoading(false);
  //     setShowRedlineModal(false);
  //   }
  // }, [
  //   sessionId,
  //   recordId,
  //   dcnInput,
  //   redlineInput,
  //   user?.username,
  //   updateStore,
  // ]); // Added dcnInput, redlineInput to dependencies

  // socket.on('receive-recordId-actionPerformed', (actionPerformed) => {
  //   logger.debug(`rx ${actionPerformed.recId}`);

  //   if (recordId == actionPerformed.recId) {
  //     fetchData();
  //   }
  // });

  // const isViewer = user?.role === 'viewer';

  // // Determine the content to display and its style
  // let displayContent = content;
  // let contentStyle = {
  //   color: 'black',
  // };

  // let isRedlined = record?.isRedlined;
  // let displayRedlinedContent = record?.redline_content;
  // let redLinedcontentStyle = { color: 'red' };

  // if (isRedlined) {
  //   contentStyle = {
  //     ...contentStyle,
  //     textDecoration: 'line-through',
  //     textDecorationColor: 'red',
  //   };
  // }

  // logger.debug(
  //   `TASKITEM isViewer? ${isViewer}  username=${user?.username} role=${user?.role} isRedlined=${record?.isRedlined} displayRedlinedContent=${displayRedlinedContent}`,
  // );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 4,
        backgroundColor: '#FAFA8FA',
        borderRadius: '10px',
        borderColor: '#888888',
      }}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
      >
        <Box justifyContent="center" sx={{ display: 'flex', minWidth: '3%' }}>
          <Typography variant="h5">{step}</Typography>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Stack direction="column" spacing={2}>
            {/* Render the plain content string */}

            {/*
                        <Typography sx={contentStyle}>{displayContent}</Typography>
                        <Typography sx={redLinedcontentStyle} contentEditable={true} >{displayRedlinedContent}</Typography>
                        */}
            <Typography>
              {/* original content text */}
              <span style={contentStyle}>{displayContent}</span>

              {/* If applicable, redline text */}
              {isRedlined && (
                <span
                  style={redLinedcontentStyle}
                  contentEditable={false}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const updated = e.currentTarget.innerText;
                    // Save or process updated redlined content
                    console.log('Updated redline:', updated);
                  }}
                >
                  <br />
                  {displayRedlinedContent}
                </span>
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                {record && <CompletionStatus record={record} />}
              </Box>
              <Tooltip
                title={
                  isViewer ? 'This action is not permitted by viewers' : ''
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={onMarkComplete}
                    disabled={
                      isViewer || // ⬅️ Disable if viewer
                      loadingSession ||
                      sessionId == null ||
                      record?.state === 'complete' ||
                      loading
                    }
                  >
                    Mark Complete
                  </Button>
                </span>
              </Tooltip>
              <IconButton onClick={onIconButton}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={onUnmarkComplete}>Unmark Complete</MenuItem>
                <MenuItem onClick={handleMakeRedline}>Make Redline</MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Redline Input Modal */}
      <Dialog
        open={showRedlineModal}
        onClose={handleCloseRedlineModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Redline Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="redline-text-dcn"
            label="Enter DCN"
            type="text"
            fullWidth
            minRows={4}
            variant="outlined"
            value={dcnInput} // Bound to the new dcnInput state
            onChange={(e) => setDcnInput(e.target.value)} // Updates the new dcnInput state
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="redline-text"
            label="Enter new redline text"
            type="text"
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            value={redlineInput} // Bound to the new redlineInput state
            onChange={(e) => setRedlineInput(e.target.value)} // Updates the new redlineInput state
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRedlineModal} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveRedlineModal} disabled={loading}>
            Apply Redline
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
