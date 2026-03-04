import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';

import API from '@shared/lib/axios';
import { usePositionWS } from '@features/portfolio/hooks/usePositionWS';
import { useQuotes, type RemoteQuote } from '@features/market-data/hooks/useQuotes';

import { EMPTY_POSITIONS } from '../constants/positions';
import type { Position } from '../types/position';
import { isFiniteNumber, normalizeSymbol, toneFromNumber } from '../utils/format';

type Tab = 'open' | 'closed';

export type ToastSeverity = 'success' | 'error' | 'info';

export type ToastState = {
  open: boolean;
  message: string;
  severity: ToastSeverity;
};

export type PricingTotals = {
  totalInvested: number;
  totalProfitKnown: number;
  totalProfitPctKnown: number;
  missingQuotes: number;
};

export type PositionsPageVM = {
  // View state
  tab: Tab;
  setTab: (t: Tab) => void;

  // Data
  positions: Position[];
  quotesMap: Record<string, RemoteQuote>;
  loading: boolean;
  errorText?: string;

  // Derived
  pricing: PricingTotals;
  totalsProfitTone: ReturnType<typeof toneFromNumber>;
  totalsPctTone: ReturnType<typeof toneFromNumber>;
  headerSubtitle: string;
  listSubtitle: string;
  showQuoteAlert: boolean;
  isMobile: boolean;

  // Dialogs
  addOpen: boolean;
  closeOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;
  selected: Position | null;

  // Form fields
  newTicker: string;
  newQuantity: string;
  newBuyPrice: string;
  newBuyDate: Dayjs | null;
  newSellPrice: string;
  newSellDate: Dayjs | null;
  tickerError: string;

  // Form setters
  setNewTicker: (v: string) => void;
  setNewQuantity: (v: string) => void;
  setNewBuyPrice: (v: string) => void;
  setNewBuyDate: (v: Dayjs | null) => void;
  setNewSellPrice: (v: string) => void;
  setNewSellDate: (v: Dayjs | null) => void;

  // Open dialog actions
  openAddDialog: () => void;
  openCloseDialog: (p: Position) => void;
  openEditDialog: (p: Position) => void;
  openDeleteDialog: (p: Position) => void;
  closeAddDialog: () => void;
  closeCloseDialog: () => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;

  // Submit actions
  onAddSubmit: () => void;
  onCloseSubmit: () => void;
  onEditSubmit: () => void;
  onDeleteConfirm: () => void;

  // Pending flags
  isAdding: boolean;
  isClosing: boolean;
  isEditing: boolean;
  isDeleting: boolean;

  // Toast
  toast: ToastState;
  closeToast: () => void;
};

export function usePositionsPage(isMobile: boolean): PositionsPageVM {
  usePositionWS();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>('open');

  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);

  const [newTicker, setNewTicker] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');
  const [newBuyDate, setNewBuyDate] = useState<Dayjs | null>(dayjs());
  const [newSellPrice, setNewSellPrice] = useState('');
  const [newSellDate, setNewSellDate] = useState<Dayjs | null>(dayjs());
  const [tickerError, setTickerError] = useState('');

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });
  const showToast = (message: string, severity: ToastSeverity = 'success') => {
    setToast({ open: true, message, severity });
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const positionsQuery = useQuery<Position[], Error>({
    queryKey: ['positions', tab],
    queryFn: () => API.get(`/positions?status=${tab}`).then((r) => r.data as Position[]),
    placeholderData: (prev) => prev ?? EMPTY_POSITIONS,
    refetchOnWindowFocus: false,
  });

  const positions = positionsQuery.data ?? EMPTY_POSITIONS;
  const posLoading = positionsQuery.isLoading;
  const posError = positionsQuery.error;

  const tickers = useMemo(() => positions.map((p) => p.ticker), [positions]);
  const quotesResult = useQuotes(tickers);

  const quotesArray = useMemo<RemoteQuote[]>(() => quotesResult.data ?? [], [quotesResult.data]);

  const quotesLoading = quotesResult.isLoading;

  const quotesMap = useMemo<Record<string, RemoteQuote>>(() => {
    const m: Record<string, RemoteQuote> = {};
    for (const q of quotesArray) m[normalizeSymbol(q.symbol)] = q;
    return m;
  }, [quotesArray]);

  const pricing = useMemo<PricingTotals>(() => {
    let invested = 0;
    let profitKnown = 0;
    let missingQuotes = 0;

    for (const p of positions) {
      const cost = p.buyPrice * p.quantity;
      invested += cost;

      if (tab === 'closed') {
        const price = isFiniteNumber(p.sellPrice) ? p.sellPrice : p.buyPrice;
        profitKnown += price * p.quantity - cost;
        continue;
      }

      const q = quotesMap[normalizeSymbol(p.ticker)];
      if (!q || !isFiniteNumber(q.currentPrice)) {
        missingQuotes += 1;
        continue;
      }
      profitKnown += q.currentPrice * p.quantity - cost;
    }

    const profitPctKnown = invested ? (profitKnown / invested) * 100 : 0;

    return {
      totalInvested: invested,
      totalProfitKnown: profitKnown,
      totalProfitPctKnown: profitPctKnown,
      missingQuotes,
    };
  }, [positions, quotesMap, tab]);

  const totalsProfitTone = toneFromNumber(pricing.totalProfitKnown);
  const totalsPctTone = toneFromNumber(pricing.totalProfitPctKnown);

  const [showQuoteAlert, setShowQuoteAlert] = useState(false);
  useEffect(() => {
    if (tab !== 'open') {
      setShowQuoteAlert(false);
      return;
    }
    if (quotesLoading) {
      setShowQuoteAlert(false);
      return;
    }
    if (pricing.missingQuotes <= 0) {
      setShowQuoteAlert(false);
      return;
    }

    const t = window.setTimeout(() => setShowQuoteAlert(true), 2500);
    return () => window.clearTimeout(t);
  }, [pricing.missingQuotes, quotesLoading, tab]);

  const headerSubtitle =
    tab === 'open'
      ? 'Live portfolio view with real-time quote updates.'
      : 'Closed trades with realized profit/loss.';

  const listSubtitle =
    tab === 'open'
      ? 'Live pricing, invested capital, and unrealized performance.'
      : 'Sell prices, realized profit/loss, and trade outcomes.';

  const loading = posLoading || (quotesLoading && tab === 'open');
  const errorText = posError?.message;

  const addPosition = useMutation<
    Position,
    Error,
    { ticker: string; quantity: number; buyPrice: number; buyDate?: string }
  >({
    mutationFn: (newPos) => API.post('/positions', newPos).then((r) => r.data as Position),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['positions', 'open'] });
      setAddOpen(false);
      showToast(`Added ${normalizeSymbol(created.ticker)} to your portfolio.`, 'success');
    },
    onError: () => {
      showToast('Could not add the position. Please try again.', 'error');
    },
  });

  const closePosition = useMutation<
    Position,
    Error,
    { id: number; sellPrice: number; sellDate?: string }
  >({
    mutationFn: (vars) =>
      API.put(`/positions/${vars.id}/close`, {
        sellPrice: vars.sellPrice,
        sellDate: vars.sellDate,
      }).then((r) => r.data as Position),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['positions', 'open'] });
      qc.invalidateQueries({ queryKey: ['positions', 'closed'] });
      setCloseOpen(false);
      setSelected(null);
      showToast(`Closed ${normalizeSymbol(updated.ticker)} successfully.`, 'success');
    },
    onError: () => {
      showToast('Could not close the position. Please try again.', 'error');
    },
  });

  const editPosition = useMutation<
    Position,
    Error,
    {
      id: number;
      quantity: number;
      buyPrice: number;
      buyDate?: string;
      sellPrice?: number;
      sellDate?: string;
    }
  >({
    mutationFn: (vars) => API.put(`/positions/${vars.id}`, vars).then((r) => r.data as Position),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['positions', tab] });
      setEditOpen(false);
      setSelected(null);
      showToast(`Updated ${normalizeSymbol(updated.ticker)} successfully.`, 'success');
    },
    onError: () => {
      showToast('Could not update the position. Please try again.', 'error');
    },
  });

  const deletePosition = useMutation<void, Error, number>({
    mutationFn: (id) => API.delete(`/positions/${id}`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions', tab] });
      const sym = selected?.ticker ? normalizeSymbol(selected.ticker) : 'position';
      setDeleteOpen(false);
      setSelected(null);
      showToast(`Deleted ${sym} successfully.`, 'success');
    },
    onError: () => {
      showToast('Could not delete the position. Please try again.', 'error');
    },
  });

  const onAddSubmit = () => {
    setTickerError('');
    const sym = normalizeSymbol(newTicker);
    if (!sym) {
      setTickerError('Ticker is required');
      return;
    }

    addPosition.mutate({
      ticker: sym,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
      buyDate: newBuyDate?.toISOString(),
    });
  };

  const onCloseSubmit = () => {
    if (!selected) return;
    closePosition.mutate({
      id: selected.id,
      sellPrice: Number(newSellPrice),
      sellDate: newSellDate?.toISOString(),
    });
  };

  const onEditSubmit = () => {
    if (!selected) return;
    editPosition.mutate({
      id: selected.id,
      quantity: Number(newQuantity),
      buyPrice: Number(newBuyPrice),
      buyDate: newBuyDate?.toISOString(),
      ...(tab === 'closed'
        ? { sellPrice: Number(newSellPrice), sellDate: newSellDate?.toISOString() }
        : {}),
    });
  };

  const onDeleteConfirm = () => {
    if (!selected) return;
    deletePosition.mutate(selected.id);
  };

  const openAddDialog = () => {
    setNewTicker('');
    setNewQuantity('');
    setNewBuyPrice('');
    setNewBuyDate(dayjs());
    setTickerError('');
    setAddOpen(true);
  };

  const openDeleteDialog = (pos: Position) => {
    setSelected(pos);
    setDeleteOpen(true);
  };

  const openCloseDialog = (pos: Position) => {
    setSelected(pos);
    setNewSellPrice('');
    setNewSellDate(dayjs());
    setCloseOpen(true);
  };

  const openEditDialog = (pos: Position) => {
    setSelected(pos);
    setNewQuantity(String(pos.quantity));
    setNewBuyPrice(String(pos.buyPrice));
    setNewBuyDate(dayjs(pos.buyDate));

    if (tab === 'closed') {
      if (pos.sellDate) setNewSellDate(dayjs(pos.sellDate));
      if (isFiniteNumber(pos.sellPrice)) setNewSellPrice(String(pos.sellPrice));
    }

    setEditOpen(true);
  };

  return {
    tab,
    setTab,

    positions,
    quotesMap,
    loading,
    errorText,

    pricing,
    totalsProfitTone,
    totalsPctTone,
    headerSubtitle,
    listSubtitle,
    showQuoteAlert,
    isMobile,

    addOpen,
    closeOpen,
    editOpen,
    deleteOpen,
    selected,

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

    openAddDialog,
    openCloseDialog,
    openEditDialog,
    openDeleteDialog,
    closeAddDialog: () => setAddOpen(false),
    closeCloseDialog: () => setCloseOpen(false),
    closeEditDialog: () => setEditOpen(false),
    closeDeleteDialog: () => setDeleteOpen(false),

    onAddSubmit,
    onCloseSubmit,
    onEditSubmit,
    onDeleteConfirm,

    isAdding: addPosition.isPending,
    isClosing: closePosition.isPending,
    isEditing: editPosition.isPending,
    isDeleting: deletePosition.isPending,

    toast,
    closeToast,
  };
}
