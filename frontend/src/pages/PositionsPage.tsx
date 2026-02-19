import React, { useMemo, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs, { type Dayjs } from 'dayjs'

import API from '../api/axios'
import { usePositionWS } from '../hooks/usePositionWS'
import { useQuotes } from '../hooks/useQuotes'
import {
  CenteredBox,
  PositionsActions,
  PositionsTabGroupWrap,
  ProfitCell,
  TickerCell,
  TickerLogo,
  TotalsRow,
  PageCard,
  PageContainer,
  SectionContent,
  SectionHeader,
  StyledContainer,
} from '../components/layout/Styled'

type Position = {
  id: number
  ticker: string
  quantity: number
  buyPrice: number
  buyDate: string
  sellPrice?: number
  sellDate?: string
}

type Quote = {
  symbol: string
  currentPrice: number
  logoUrl: string
}

type Tone = 'positive' | 'negative' | 'neutral'

function toneFromNumber(val: number): Tone {
  if (val > 0) return 'positive'
  if (val < 0) return 'negative'
  return 'neutral'
}

const PositionsPage: React.FC = () => {
  usePositionWS()
  const qc = useQueryClient()

  const [tab, setTab] = useState<'open' | 'closed'>('open')

  const [addOpen, setAddOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Position | null>(null)

  const [newTicker, setNewTicker] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [newBuyPrice, setNewBuyPrice] = useState('')
  const [newBuyDate, setNewBuyDate] = useState<Dayjs | null>(dayjs())
  const [newSellPrice, setNewSellPrice] = useState('')
  const [newSellDate, setNewSellDate] = useState<Dayjs | null>(dayjs())
  const [tickerError, setTickerError] = useState('')

  const {
    data: positions = [],
    isLoading: posLoading,
    error: posError,
  } = useQuery<Position[], Error>({
    queryKey: ['positions', tab],
    queryFn: () => API.get(`/positions?status=${tab}`).then((r) => r.data as Position[]),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  })

  const tickers = useMemo(() => positions.map((p) => p.ticker), [positions])
  const { data: quotesArray = [], isLoading: quotesLoading } = useQuotes(tickers)

  const quotesMap = useMemo<Record<string, Quote>>(() => {
    const m: Record<string, Quote> = {}
    quotesArray.forEach((q) => {
      m[q.symbol] = q
    })
    return m
  }, [quotesArray])

  const addPosition = useMutation<
    Position,
    Error,
    { ticker: string; quantity: number; buyPrice: number; buyDate?: string }
  >({
    mutationFn: (newPos) => API.post('/positions', newPos).then((r) => r.data as Position),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', 'open'] })
      setAddOpen(false)
    },
  })

  const closePosition = useMutation<Position, Error, { id: number; sellPrice: number; sellDate?: string }>(
    {
      mutationFn: (vars) =>
        API.put(`/positions/${vars.id}/close`, {
          sellPrice: vars.sellPrice,
          sellDate: vars.sellDate,
        }).then((r) => r.data as Position),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['positions', 'open'] })
        qc.invalidateQueries({ queryKey: ['positions', 'closed'] })
        setCloseOpen(false)
        setSelected(null)
      },
    }
  )

  const editPosition = useMutation<
    Position,
    Error,
    {
      id: number
      quantity: number
      buyPrice: number
      buyDate?: string
      sellPrice?: number
      sellDate?: string
    }
  >({
    mutationFn: (vars) => API.put(`/positions/${vars.id}`, vars).then((r) => r.data as Position),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', tab] })
      setEditOpen(false)
      setSelected(null)
    },
  })

  const deletePosition = useMutation<void, Error, number>({
    mutationFn: (id) => API.delete(`/positions/${id}`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', tab] })
      setDeleteOpen(false)
      setSelected(null)
    },
  })

  const onAddSubmit = () => {
    setTickerError('')
    const sym = newTicker.trim().toUpperCase()
    if (!sym) {
      setTickerError('Ticker is required')
      return
    }

    addPosition.mutate({
      ticker: sym,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
      buyDate: newBuyDate?.toISOString(),
    })
  }

  const onCloseSubmit = () => {
    if (!selected) return
    closePosition.mutate({
      id: selected.id,
      sellPrice: Number(newSellPrice),
      sellDate: newSellDate?.toISOString(),
    })
  }

  const onEditSubmit = () => {
    if (!selected) return
    editPosition.mutate({
      id: selected.id,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
      buyDate: newBuyDate?.toISOString(),
      ...(tab === 'closed'
        ? {
            sellPrice: Number(newSellPrice),
            sellDate: newSellDate?.toISOString(),
          }
        : {}),
    })
  }

  const onDeleteConfirm = () => {
    if (!selected) return
    deletePosition.mutate(selected.id)
  }

  const { totalInvested, totalProfit, totalProfitPct } = useMemo(() => {
    let invested = 0
    let profit = 0

    positions.forEach((p) => {
      const cost = p.buyPrice * p.quantity
      const price =
        tab === 'open'
          ? quotesMap[p.ticker]?.currentPrice ?? cost / p.quantity
          : p.sellPrice ?? p.buyPrice
      invested += cost
      profit += price * p.quantity - cost
    })

    return {
      totalInvested: invested,
      totalProfit: profit,
      totalProfitPct: invested ? (profit / invested) * 100 : 0,
    }
  }, [positions, quotesMap, tab])

  const totalsProfitTone = toneFromNumber(totalProfit)
  const totalsPctTone = toneFromNumber(totalProfitPct)

  return (
    <PageContainer>
      <StyledContainer>
        <PageCard>
          <SectionHeader
            title={tab === 'open' ? 'Open Positions' : 'Closed Positions'}
            action={
              tab === 'open' ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    setNewTicker('')
                    setNewQuantity('')
                    setNewBuyPrice('')
                    setNewBuyDate(dayjs())
                    setAddOpen(true)
                  }}
                >
                  Add Position
                </Button>
              ) : null
            }
          />

          <SectionContent>
            <PositionsTabGroupWrap>
              <ButtonGroup>
                <Button variant={tab === 'open' ? 'contained' : 'outlined'} onClick={() => setTab('open')}>
                  Open
                </Button>
                <Button
                  variant={tab === 'closed' ? 'contained' : 'outlined'}
                  onClick={() => setTab('closed')}
                >
                  Closed
                </Button>
              </ButtonGroup>
            </PositionsTabGroupWrap>

            {posLoading || quotesLoading ? (
              <CenteredBox>
                <CircularProgress />
              </CenteredBox>
            ) : posError ? (
              <Typography color="error">{posError.message}</Typography>
            ) : positions.length === 0 ? (
              <CenteredBox>
                <Typography color="text.secondary">You currently have no {tab} positions.</Typography>
              </CenteredBox>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell align="right">Buy Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">{tab === 'open' ? 'Current Price' : 'Sell Price'}</TableCell>
                      <TableCell align="right">Amount Invested ($)</TableCell>
                      <TableCell align="right">Total P/L (%)</TableCell>
                      <TableCell align="right">Total P/L ($)</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {positions.map((pos) => {
                      const cost = pos.buyPrice * pos.quantity
                      const price =
                        tab === 'open'
                          ? quotesMap[pos.ticker]?.currentPrice ?? cost / pos.quantity
                          : pos.sellPrice ?? pos.buyPrice
                      const profit = price * pos.quantity - cost
                      const pct = cost ? (profit / cost) * 100 : 0

                      return (
                        <TableRow key={pos.id}>
                          <TableCell>
                            <TickerCell>
                              <TickerLogo>
                                <Avatar src={quotesMap[pos.ticker]?.logoUrl} alt={pos.ticker} />
                              </TickerLogo>
                              {pos.ticker}
                            </TickerCell>
                          </TableCell>

                          <TableCell align="right">${pos.buyPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">{pos.quantity}</TableCell>
                          <TableCell align="right">${price.toFixed(2)}</TableCell>
                          <TableCell align="right">${cost.toFixed(2)}</TableCell>

                          <ProfitCell align="right" tone={toneFromNumber(pct)}>
                            {pct.toFixed(2)}%
                          </ProfitCell>

                          <ProfitCell align="right" tone={toneFromNumber(profit)}>
                            ${profit.toFixed(2)}
                          </ProfitCell>

                          <TableCell align="center">
                            <PositionsActions>
                              {tab === 'open' ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setSelected(pos)
                                    setNewSellPrice('')
                                    setNewSellDate(dayjs())
                                    setCloseOpen(true)
                                  }}
                                >
                                  Close
                                </Button>
                              ) : null}

                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelected(pos)
                                  setNewQuantity(String(pos.quantity))
                                  setNewBuyPrice(String(pos.buyPrice))
                                  setNewBuyDate(dayjs(pos.buyDate))
                                  if (pos.sellDate) setNewSellDate(dayjs(pos.sellDate))
                                  setEditOpen(true)
                                }}
                              >
                                Edit
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setSelected(pos)
                                  setDeleteOpen(true)
                                }}
                              >
                                Delete
                              </Button>
                            </PositionsActions>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>

                  <TableFooter>
                    <TotalsRow>
                      <TableCell>
                        <strong>Totals</strong>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell align="right">
                        <strong>${totalInvested.toFixed(2)}</strong>
                      </TableCell>

                      <ProfitCell align="right" tone={totalsPctTone}>
                        <strong>{totalProfitPct.toFixed(2)}%</strong>
                      </ProfitCell>

                      <ProfitCell align="right" tone={totalsProfitTone}>
                        <strong>${totalProfit.toFixed(2)}</strong>
                      </ProfitCell>

                      <TableCell />
                    </TotalsRow>
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
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={onAddSubmit} disabled={addPosition.isPending} variant="contained">
            {addPosition.isPending ? 'Saving…' : 'Save'}
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
          <Button onClick={() => setCloseOpen(false)}>Cancel</Button>
          <Button onClick={onCloseSubmit} disabled={closePosition.isPending} variant="contained">
            {closePosition.isPending ? 'Closing…' : 'Close'}
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
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={onEditSubmit} disabled={editPosition.isPending} variant="contained">
            {editPosition.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Position {selected?.ticker}?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the position. Are you sure?</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={onDeleteConfirm}
            disabled={deletePosition.isPending}
            variant="contained"
          >
            {deletePosition.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  )
}

export default PositionsPage
