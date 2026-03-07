import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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

import { AppTooltip, KpiInfoButton } from '@shared/ui';

import type { Position } from '../types/position';
import { DialogFieldLabelWrap, DialogSubmitButton } from './PositionDialogs.styles';

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
  quantityError: string;
  buyPriceError: string;
  buyDateError: string;
  sellPriceError: string;
  sellDateError: string;

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

const POSITIVE_NUMBER_INPUT_PROPS = {
  min: 0.00000001,
  step: 'any',
};

const ANY_NUMBER_INPUT_PROPS = {
  step: 'any',
};

type FieldLabelWithTipProps = {
  label: string;
  tip: React.ReactNode;
};

function FieldLabelWithTip({ label, tip }: FieldLabelWithTipProps) {
  return (
    <DialogFieldLabelWrap>
      <span>{label}</span>
      <AppTooltip title={tip}>
        <span>
          <KpiInfoButton 
		    aria-label={`${label} info`}
			tabIndex={-1}
			disableRipple
			disableFocusRipple
		  >
            <InfoOutlinedIcon fontSize="inherit" />
          </KpiInfoButton>
        </span>
      </AppTooltip>
    </DialogFieldLabelWrap>
  );
}

const TICKER_TIP =
  'Enter the market ticker symbol for this holding, for example AMZN, MSFT, or AAPL.';

const QUANTITY_TIP =
  'Enter the number of shares purchased. Fractional shares are supported, but the quantity must be greater than 0';

const BUY_PRICE_TIP =
  'Enter the purchase price per share. This value is required and must be greater than 0.';

const SELL_PRICE_TIP =
  'Enter the selling price per share used to close the position. This value is required. Zero is allowed if the position became worthless.';

const DATE_TIP =
  'Enter a valid calendar date or select one using the calendar picker. Invalid or empty dates are not accepted.';

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
    quantityError,
    buyPriceError,
    buyDateError,
    sellPriceError,
    sellDateError,

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
            label={<FieldLabelWithTip label="Ticker" tip={TICKER_TIP} />}
            value={newTicker}
            error={Boolean(tickerError)}
            helperText={tickerError}
            onChange={(e) => setNewTicker(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label={<FieldLabelWithTip label="Quantity" tip={QUANTITY_TIP} />}
            type="number"
            value={newQuantity}
            error={Boolean(quantityError)}
            helperText={quantityError}
            inputProps={POSITIVE_NUMBER_INPUT_PROPS}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label={<FieldLabelWithTip label="Buy Price" tip={BUY_PRICE_TIP} />}
            type="number"
            value={newBuyPrice}
            error={Boolean(buyPriceError)}
            helperText={buyPriceError}
            inputProps={POSITIVE_NUMBER_INPUT_PROPS}
            onChange={(e) => setNewBuyPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={<FieldLabelWithTip label="Buy Date" tip={DATE_TIP} />}
              value={newBuyDate}
              onChange={(d) => setNewBuyDate(d)}
              disableFuture
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  error: Boolean(buyDateError),
                  helperText: buyDateError,
                },
              }}
            />
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseAdd}>Cancel</Button>
          <DialogSubmitButton
            onClick={onAddSubmit}
            disabled={isAdding}
            variant="contained"
            startIcon={isAdding ? <CircularProgress size={18} /> : undefined}
          >
            {isAdding ? 'Saving…' : 'Save'}
          </DialogSubmitButton>
        </DialogActions>
      </Dialog>

      <Dialog open={closeOpen} onClose={onCloseClose} fullWidth maxWidth="sm">
        <DialogTitle>Close Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label={<FieldLabelWithTip label="Sell Price" tip={SELL_PRICE_TIP} />}
            type="number"
            value={newSellPrice}
            error={Boolean(sellPriceError)}
            helperText={sellPriceError}
            inputProps={ANY_NUMBER_INPUT_PROPS}
            onChange={(e) => setNewSellPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={<FieldLabelWithTip label="Sell Date" tip={DATE_TIP} />}
              value={newSellDate}
              onChange={(d) => setNewSellDate(d)}
              disableFuture
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  error: Boolean(sellDateError),
                  helperText: sellDateError,
                },
              }}
            />
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseClose}>Cancel</Button>
          <DialogSubmitButton
            onClick={onCloseSubmit}
            disabled={isClosing}
            variant="contained"
            startIcon={isClosing ? <CircularProgress size={18} /> : undefined}
          >
            {isClosing ? 'Closing…' : 'Close'}
          </DialogSubmitButton>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={onCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label={<FieldLabelWithTip label="Quantity" tip={QUANTITY_TIP} />}
            type="number"
            value={newQuantity}
            error={Boolean(quantityError)}
            helperText={quantityError}
            inputProps={POSITIVE_NUMBER_INPUT_PROPS}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label={<FieldLabelWithTip label="Buy Price" tip={BUY_PRICE_TIP} />}
            type="number"
            value={newBuyPrice}
            error={Boolean(buyPriceError)}
            helperText={buyPriceError}
            inputProps={POSITIVE_NUMBER_INPUT_PROPS}
            onChange={(e) => setNewBuyPrice(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={<FieldLabelWithTip label="Buy Date" tip={DATE_TIP} />}
              value={newBuyDate}
              onChange={(d) => setNewBuyDate(d)}
              disableFuture
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  error: Boolean(buyDateError),
                  helperText: buyDateError,
                },
              }}
            />
          </LocalizationProvider>

          {tab === 'closed' ? (
            <>
              <TextField
                fullWidth
                margin="dense"
                label={<FieldLabelWithTip label="Sell Price" tip={SELL_PRICE_TIP} />}
                type="number"
                value={newSellPrice}
                error={Boolean(sellPriceError)}
                helperText={sellPriceError}
                inputProps={ANY_NUMBER_INPUT_PROPS}
                onChange={(e) => setNewSellPrice(e.target.value)}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={<FieldLabelWithTip label="Sell Date" tip={DATE_TIP} />}
                  value={newSellDate}
                  onChange={(d) => setNewSellDate(d)}
                  disableFuture
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: Boolean(sellDateError),
                      helperText: sellDateError,
                    },
                  }}
                />
              </LocalizationProvider>
            </>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseEdit}>Cancel</Button>
          <DialogSubmitButton
            onClick={onEditSubmit}
            disabled={isEditing}
            variant="contained"
            startIcon={isEditing ? <CircularProgress size={18} /> : undefined}
          >
            {isEditing ? 'Saving…' : 'Save'}
          </DialogSubmitButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={onCloseDelete} fullWidth maxWidth="sm">
        <DialogTitle>Delete Position {selected?.ticker}?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the position. Are you sure?</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseDelete}>Cancel</Button>
          <DialogSubmitButton
            color="error"
            onClick={onDeleteConfirm}
            disabled={isDeleting}
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={18} /> : undefined}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </DialogSubmitButton>
        </DialogActions>
      </Dialog>
    </>
  );
}