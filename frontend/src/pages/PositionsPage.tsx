import React, { useEffect, useState, useMemo } from 'react';
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableFooter,
  TableRow,
  TextField,
  Typography,
  Box,
  CircularProgress,
  ButtonGroup,
} from '@mui/material';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import API from '../api/axios';
import { usePositionWS } from '../hooks/usePositionWS';
import { useQuotes } from '../hooks/useQuotes';
import {
  PageContainer,
  StyledContainer,
  PageCard,
  SectionHeader,
  SectionContent,
  CenteredBox,
} from '../components/layout/Styled';

interface Position {
  id: number;
  ticker: string;
  quantity: number;
  buyPrice: number;
  sellPrice?: number;
}

interface Quote {
  symbol: string;
  currentPrice: number;
  logoUrl: string;
}

const POSITIVE_COLOR = '#10b42c';
const NEGATIVE_COLOR = '#f83c44';
const ZERO_COLOR     = '#000000';

const PositionsPage: React.FC = () => {
  usePositionWS();

  const qc = useQueryClient();
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  const [addOpen,    setAddOpen]    = useState(false);
  const [closeOpen,  setCloseOpen]  = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected,   setSelected]   = useState<Position | null>(null);

  const [newTicker,    setNewTicker]    = useState('');
  const [newQuantity,  setNewQuantity]  = useState('');
  const [newBuyPrice,  setNewBuyPrice]  = useState('');
  const [newSellPrice, setNewSellPrice] = useState('');
  const [tickerError,  setTickerError]  = useState('');

  const {
    data: positions = [],
    isLoading: posLoading,
    error: posError,
  } = useQuery<Position[], Error>({
    queryKey: ['positions', tab],
    queryFn: () =>
      API.get<Position[]>(`/positions?status=${tab}`).then(r => r.data),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const tickers = positions.map(p => p.ticker);
  const {
    data: quotesArray = [],
    isLoading: quotesLoading,
  } = useQuotes(tickers);

  const quotesMap = useMemo<Record<string, Quote>>(() => {
    const m: Record<string, Quote> = {};
    quotesArray.forEach(q => { m[q.symbol] = q; });
    return m;
  }, [quotesArray]);

  const addPosition = useMutation({
    mutationFn: (newPos: { ticker: string; quantity: number; buyPrice: number }) =>
      API.post('/positions', newPos).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries(['positions', 'open']);
      setAddOpen(false);
    },
  });

  const closePosition = useMutation({
    mutationFn: (vars: { id: number; sellPrice: number }) =>
      API.put(`/positions/${vars.id}/close`, { sellPrice: vars.sellPrice }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries(['positions', 'open']);
      qc.invalidateQueries(['positions', 'closed']);
      setCloseOpen(false);
      setSelected(null);
    },
  });

  const editPosition = useMutation({
    mutationFn: (vars: {
      id: number;
      quantity: number;
      buyPrice: number;
      sellPrice?: number;
    }) =>
      API.put(`/positions/${vars.id}`, {
        quantity: vars.quantity,
        buyPrice: vars.buyPrice,
        ...(tab === 'closed' && vars.sellPrice !== undefined
          ? { sellPrice: vars.sellPrice }
          : {}),
      }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries(['positions', tab]);
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deletePosition = useMutation({
    mutationFn: (id: number) => API.delete(`/positions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['positions', tab]);
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const onAddSubmit = () => {
    setTickerError('');
    const sym = newTicker.trim().toUpperCase();
    if (!sym) {
      setTickerError('Ticker is required');
      return;
    }
    addPosition.mutate({
      ticker: sym,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
    });
  };

  const onCloseSubmit = () => {
    if (!selected) return;
    closePosition.mutate({ id: selected.id, sellPrice: Number(newSellPrice) });
  };

  const onEditSubmit = () => {
    if (!selected) return;
    editPosition.mutate({
      id: selected.id,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
      sellPrice: tab === 'closed' ? Number(newSellPrice) : undefined,
    });
  };

  const onDeleteConfirm = () => {
    if (!selected) return;
    deletePosition.mutate(selected.id);
  };

  const { totalInvested, totalProfit, totalProfitPct } = useMemo(() => {
    let invested = 0, profit = 0;
    positions.forEach(p => {
      const cost = p.buyPrice * p.quantity;
      const price = tab === 'open'
        ? quotesMap[p.ticker]?.currentPrice ?? (cost / p.quantity)
        : (p.sellPrice ?? p.buyPrice);
      invested += cost;
      profit += price * p.quantity - cost;
    });
    return {
      totalInvested: invested,
      totalProfit: profit,
      totalProfitPct: invested ? (profit / invested) * 100 : 0,
    };
  }, [positions, quotesMap, tab]);

  return (
    <PageContainer>
      <StyledContainer>
        <PageCard>
          <SectionHeader
            title={tab === 'open' ? 'Open Positions' : 'Closed Positions'}
            action={
              tab === 'open' && (
                <Button onClick={() => setAddOpen(true)} variant="contained">
                  Add Position
                </Button>
              )
            }
          />
          <SectionContent>
            <ButtonGroup sx={{ mb: { xs: 1, sm: 2 } }}>
              <Button
                variant={tab === 'open' ? 'contained' : 'outlined'}
                onClick={() => setTab('open')}
              >
                Open
              </Button>
              <Button
                variant={tab === 'closed' ? 'contained' : 'outlined'}
                onClick={() => setTab('closed')}
              >
                Closed
              </Button>
            </ButtonGroup>

            {(posLoading || quotesLoading) ? (
              <CenteredBox>
                <CircularProgress />
              </CenteredBox>
            ) : posError ? (
              <Typography color="error">{posError.message}</Typography>
            ) : positions.length === 0 ? (
              <CenteredBox>
                <Typography color="textSecondary">
                  You currently have no {tab} positions.
                </Typography>
              </CenteredBox>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell align="right">Buy Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">
                        {tab === 'open' ? 'Current Price' : 'Sell Price'}
                      </TableCell>
                      <TableCell align="right">Amount Invested ($)</TableCell>
                      <TableCell align="right">Total P/L (%)</TableCell>
                      <TableCell align="right">Total P/L ($)</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map(pos => {
                      const cost = pos.buyPrice * pos.quantity;
                      const price = tab === 'open'
                        ? quotesMap[pos.ticker]?.currentPrice ?? (cost / pos.quantity)
                        : (pos.sellPrice ?? pos.buyPrice);
                      const profit = price * pos.quantity - cost;
                      const pct = cost ? (profit / cost) * 100 : 0;
                      const colorPct = pct > 0
                        ? POSITIVE_COLOR
                        : pct < 0
                        ? NEGATIVE_COLOR
                        : ZERO_COLOR;
                      const colorPl = profit > 0
                        ? POSITIVE_COLOR
                        : profit < 0
                        ? NEGATIVE_COLOR
                        : ZERO_COLOR;

                      return (
                        <TableRow key={pos.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={quotesMap[pos.ticker]?.logoUrl}
                                alt={pos.ticker}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              />
                              {pos.ticker}
                            </Box>
                          </TableCell>
                          <TableCell align="right">${pos.buyPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">{pos.quantity}</TableCell>
                          <TableCell align="right">${price.toFixed(2)}</TableCell>
                          <TableCell align="right">${cost.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ color: colorPct }}>
                            {pct.toFixed(2)}%
                          </TableCell>
                          <TableCell align="right" sx={{ color: colorPl }}>
                            ${profit.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            {tab === 'open' && (
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 2, px: 1.5 }}
                                onClick={() => {
                                  setSelected(pos);
                                  setNewSellPrice('');
                                  setCloseOpen(true);
                                }}
                              >
                                Close
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mx:1, borderRadius:2, px:1.5 }}
                              onClick={() => {
                                setSelected(pos);
                                setNewQuantity(String(pos.quantity));
                                setNewBuyPrice(String(pos.buyPrice));
                                setNewSellPrice(pos.sellPrice?.toString() ?? '');
                                setEditOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              sx={{ borderRadius:2, px:1.5 }}
                              onClick={() => {
                                setSelected(pos);
                                setDeleteOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableFooter>
                    <TableRow sx={{ borderTop: t => `2px solid ${t.palette.divider}` }}>
                      <TableCell><strong>Totals</strong></TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell align="right">
                        <strong>${totalInvested.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            totalProfitPct > 0 ? POSITIVE_COLOR :
                            totalProfitPct < 0 ? NEGATIVE_COLOR :
                            ZERO_COLOR
                        }}
                      >
                        <strong>{totalProfitPct.toFixed(2)}%</strong>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            totalProfit > 0 ? POSITIVE_COLOR :
                            totalProfit < 0 ? NEGATIVE_COLOR :
                            ZERO_COLOR
                        }}
                      >
                        <strong>${totalProfit.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )}
          </SectionContent>
        </PageCard>
      </StyledContainer>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add New Position</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Ticker"
            value={newTicker}
            error={!!tickerError}
            helperText={tickerError}
            onChange={e => setNewTicker(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Quantity"
            type="number"
            value={newQuantity}
            onChange={e => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Buy Price"
            type="number"
            value={newBuyPrice}
            onChange={e => setNewBuyPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            onClick={onAddSubmit}
            disabled={addPosition.isLoading}
            variant="contained"
          >
            {addPosition.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)}>
        <DialogTitle>Close Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Sell Price"
            type="number"
            value={newSellPrice}
            onChange={e => setNewSellPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseOpen(false)}>Cancel</Button>
          <Button
            onClick={onCloseSubmit}
            disabled={closePosition.isLoading}
            variant="contained"
          >
            {closePosition.isLoading ? 'Closing…' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Position {selected?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Quantity"
            type="number"
            value={newQuantity}
            onChange={e => setNewQuantity(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Buy Price"
            type="number"
            value={newBuyPrice}
            onChange={e => setNewBuyPrice(e.target.value)}
          />
          {tab === 'closed' && (
            <TextField
              fullWidth
              margin="dense"
              label="Sell Price"
              type="number"
              value={newSellPrice}
              onChange={e => setNewSellPrice(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={onEditSubmit}
            disabled={editPosition.isLoading}
            variant="contained"
          >
            {editPosition.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Position {selected?.ticker}?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently remove the position. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={onDeleteConfirm}
            disabled={deletePosition.isLoading}
            variant="contained"
          >
            {deletePosition.isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PositionsPage;