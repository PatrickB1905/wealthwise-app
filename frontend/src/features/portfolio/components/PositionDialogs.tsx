import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import type { Position } from '../types/position';

type Props = {
  tab: 'open' | 'closed';
  selected: Position | null;

  // Open states
  addOpen: boolean;
  closeOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;

  // Close handlers
  onCloseAdd: () => void;
  onCloseClose: () => void;
  onCloseEdit: () => void;
  onCloseDelete: () => void;

  // Form values
  newTicker: string;
  newQuantity: string;
  newBuyPrice: string;
  newBuyDate: Dayjs | null;
  newSellPrice: string;
  newSellDate: Dayjs | null;
  tickerError: string;

  // Setters
  setNewTicker: (v: string) => void;
  setNewQuantity: (v: string) => void;
  setNewBuyPrice: (v: string) => void;
  setNewBuyDate: (d: Dayjs | null) => void;
  setNewSellPrice: (v: string) => void;
  setNewSellDate: (d: Dayjs | null) => void;

  // Submit handlers
  onAddSubmit: () => void;
  onCloseSubmit: () => void;
  onEditSubmit: () => void;
  onDeleteConfirm: () => void;

  // Pending
  isAdding: boolean;
  isClosing: boolean;
  isEditing: boolean;
  isDeleting: boolean;
};

export function PositionDialogs(props: Props) {
  const {
    tab,
    selected,

    addOpen,
    closeOpen,
    editOpen,
    deleteOpen,

    onCloseAdd,
    onCloseClose,
    onCloseEdit,
    onCloseDelete,

    newTicker,
    newQuantity,
    newBuyPrice,
    newBuyDate,
    newSellPrice,
    newSellDate,
    tickerError,

    setNewTicker,
    setNewQuantity,
    setNewBuyPrice,
    setNewBuyDate,
    setNewSellPrice,
    setNewSellDate,

    onAddSubmit,
    onCloseSubmit,
    onEditSubmit,
    onDeleteConfirm,

    isAdding,
    isClosing,
    isEditing,
    isDeleting,
  } = props;

  return (
    <>
      <Dialog open={addOpen} onClose={onCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>Add New Position</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Ticker"
            value={newTicker}
            error={Boolean(tickerError)}
            helperText={tickerError}
            onChange={(e) => setNewTicker(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Buy Price"
            type="number"
            value={newBuyPrice}
            onChange={(e) => setNewBuyPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Buy Date"
              value={newBuyDate}
              onChange={(d) => setNewBuyDate(d)}
              disableFuture
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseAdd}>Cancel</Button>
          <Button
            onClick={onAddSubmit}
            disabled={isAdding}
            variant="contained"
            startIcon={isAdding ? <CircularProgress size={18} /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isAdding ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={closeOpen} onClose={onCloseClose} fullWidth maxWidth="sm">
        <DialogTitle>Close Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Sell Price"
            type="number"
            value={newSellPrice}
            onChange={(e) => setNewSellPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Sell Date"
              value={newSellDate}
              onChange={(d) => setNewSellDate(d)}
              disableFuture
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseClose}>Cancel</Button>
          <Button
            onClick={onCloseSubmit}
            disabled={isClosing}
            variant="contained"
            startIcon={isClosing ? <CircularProgress size={18} /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isClosing ? 'Closing…' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={onCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Buy Price"
            type="number"
            value={newBuyPrice}
            onChange={(e) => setNewBuyPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Buy Date"
              value={newBuyDate}
              onChange={(d) => setNewBuyDate(d)}
              disableFuture
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>

          {tab === 'closed' ? (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="Sell Price"
                type="number"
                value={newSellPrice}
                onChange={(e) => setNewSellPrice(e.target.value)}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Sell Date"
                  value={newSellDate}
                  onChange={(d) => setNewSellDate(d)}
                  disableFuture
                  slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                />
              </LocalizationProvider>
            </>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseEdit}>Cancel</Button>
          <Button
            onClick={onEditSubmit}
            disabled={isEditing}
            variant="contained"
            startIcon={isEditing ? <CircularProgress size={18} /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isEditing ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={onCloseDelete} fullWidth maxWidth="sm">
        <DialogTitle>Delete Position {selected?.ticker}?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the position. Are you sure?</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseDelete}>Cancel</Button>
          <Button
            color="error"
            onClick={onDeleteConfirm}
            disabled={isDeleting}
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={18} /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
