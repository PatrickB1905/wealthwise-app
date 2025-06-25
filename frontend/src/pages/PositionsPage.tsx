import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ButtonGroup,
} from '@mui/material';
import API from '../api/axios';
import MarketAPI from '../api/marketData';

interface Position {
  id: number;
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  sellPrice?: number;
  sellDate?: string;
}

interface Quote {
  symbol: string;
  currentPrice: number;
  dailyChangePercent: number;
}

const PositionsPage: React.FC = () => {
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const [positions, setPositions] = useState<Position[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const [newTicker, setNewTicker] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');

  const [closeSellPrice, setCloseSellPrice] = useState('');

  const fetchPositions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get<Position[]>(`/positions?status=${tab}`);
      const pos = res.data;
      setPositions(pos);

      if (tab === 'open' && pos.length > 0) {
        const symbols = pos.map((p) => p.ticker).join(',');
        const qr = await MarketAPI.get<Quote[]>(`/quotes`, { params: { symbols } });
        const qmap: Record<string, Quote> = {};
        qr.data.forEach((q) => {
          qmap[q.symbol] = q;
        });
        setQuotes(qmap);
      } else {
        setQuotes({});
      }
    } catch {
      setError('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [tab]);

  const handleAddSubmit = async () => {
    try {
      await API.post('/positions', {
        ticker: newTicker.toUpperCase(),
        quantity: parseFloat(newQuantity),
        buyPrice: parseFloat(newBuyPrice),
      });
      setAddOpen(false);
      setNewTicker('');
      setNewQuantity('');
      setNewBuyPrice('');
      fetchPositions();
    } catch {
      setError('Failed to add position');
    }
  };

  const handleCloseSubmit = async () => {
    if (!selectedPos) return;
    try {
      await API.put(`/positions/${selectedPos.id}/close`, {
        sellPrice: parseFloat(closeSellPrice),
      });
      setCloseOpen(false);
      setCloseSellPrice('');
      fetchPositions();
    } catch {
      setError('Failed to close position');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <ButtonGroup variant="contained">
          <Button onClick={() => setTab('open')} disabled={tab === 'open'}>
            Open Positions
          </Button>
          <Button onClick={() => setTab('closed')} disabled={tab === 'closed'}>
            Closed Positions
          </Button>
        </ButtonGroup>
        {tab === 'open' && (
          <Button variant="outlined" onClick={() => setAddOpen(true)}>
            Add Position
          </Button>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Buy Price</TableCell>
                {tab === 'open' ? (
                  <>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Total P/L ($)</TableCell>
                    <TableCell align="right">Total P/L (%)</TableCell>
                    <TableCell align="right">Daily Change (%)</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell align="right">Sell Price</TableCell>
                    <TableCell align="right">Total P/L ($)</TableCell>
                    <TableCell align="right">Total P/L (%)</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((pos) => {
                const cost = pos.quantity * pos.buyPrice;
                if (tab === 'open') {
                  const quote = quotes[pos.ticker];
                  const currentPrice = quote?.currentPrice ?? 0;
                  const totalPL = currentPrice * pos.quantity - cost;
                  const totalPLPercent = cost ? (totalPL / cost) * 100 : 0;
                  const dailyChange = quote?.dailyChangePercent ?? 0;
                  return (
                    <TableRow key={pos.id}>
                      <TableCell>{pos.ticker}</TableCell>
                      <TableCell align="right">{pos.quantity}</TableCell>
                      <TableCell align="right">${pos.buyPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${currentPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${totalPL.toFixed(2)}</TableCell>
                      <TableCell align="right">{totalPLPercent.toFixed(2)}%</TableCell>
                      <TableCell align="right">{dailyChange.toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedPos(pos);
                            setCloseOpen(true);
                          }}
                        >
                          Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  const sellPrice = pos.sellPrice ?? 0;
                  const proceeds = sellPrice * pos.quantity;
                  const totalPL = proceeds - cost;
                  const totalPLPercent = cost ? (totalPL / cost) * 100 : 0;
                  return (
                    <TableRow key={pos.id}>
                      <TableCell>{pos.ticker}</TableCell>
                      <TableCell align="right">{pos.quantity}</TableCell>
                      <TableCell align="right">${pos.buyPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${sellPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${totalPL.toFixed(2)}</TableCell>
                      <TableCell align="right">{totalPLPercent.toFixed(2)}%</TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add New Position</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ticker"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Quantity"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Buy Price"
            value={newBuyPrice}
            onChange={(e) => setNewBuyPrice(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)}>
        <DialogTitle>Close Position {selectedPos?.ticker}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Sell Price"
            value={closeSellPrice}
            onChange={(e) => setCloseSellPrice(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseSubmit}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PositionsPage;