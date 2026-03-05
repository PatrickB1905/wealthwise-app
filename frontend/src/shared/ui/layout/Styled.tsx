import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItemButton, { type ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import { alpha, styled, type Theme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { SIDEBAR_WIDTH } from './styled.utils';
import heroImgUrl from '@assets/images/hero.png';

type Tone = 'positive' | 'negative' | 'neutral';

function toneToColor(theme: Theme, tone: Tone) {
  if (tone === 'positive') return theme.palette.success.main;
  if (tone === 'negative') return theme.palette.error.main;
  return theme.palette.text.primary;
}

function themeRadius(theme: Theme, multiplier: number, fallback = 16) {
  const raw = theme.shape.borderRadius;
  const base = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));

  return Number.isFinite(base) && base > 0 ? base * multiplier : fallback;
}

/** =========================
 *  App Shell
 *  ========================= */

export const DashboardContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

export const ContentScrollArea = styled('div')(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const RouteLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 2,
  borderRadius: 999,
  marginBottom: theme.spacing(0.75),
  '& .MuiLinearProgress-bar': {
    borderRadius: 999,
  },
}));

/** =========================
 *  Navbar
 *  ========================= */

export const NavbarAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const NavbarToolbar = styled(Toolbar)(({ theme }) => ({
  gap: theme.spacing(1),
  minHeight: 64,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export const NavbarTitle = styled('div')(() => ({
  flexGrow: 1,
}));

export const NavbarTitleWrap = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(0.25),
  minWidth: 0,
}));

export const NavbarCrumbs = styled(Typography)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.text.secondary,
    opacity: 0.7,
  },
}));

export const NavbarCrumbLink = styled('button')(({ theme }) => ({
  appearance: 'none',
  border: 0,
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
  fontWeight: 800,
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
}));

export const NavbarTitleRow = styled(Stack)(() => ({
  minWidth: 0,
}));

export const UserMenuButton = styled(Button)(({ theme }) => ({
  borderRadius: 999,
  paddingLeft: theme.spacing(0.9),
  paddingRight: theme.spacing(1.1),
  paddingTop: theme.spacing(0.55),
  paddingBottom: theme.spacing(0.55),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  backgroundColor: alpha(theme.palette.text.primary, 0.02),
  textTransform: 'none',
  gap: theme.spacing(1),
  transition: 'background-color 140ms ease, border-color 140ms ease, transform 140ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    borderColor: alpha(theme.palette.text.primary, 0.16),
    transform: 'translateY(-1px)',
  },
}));

export const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontWeight: 900,
  letterSpacing: '-0.03em',
  color: theme.palette.common.white,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  boxShadow: `0 10px 18px ${alpha(theme.palette.primary.main, 0.16)}`,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.55)} 100%)`,
}));

export const UserEmailText = styled(Typography)(({ theme }) => ({
  fontWeight: 850,
  letterSpacing: '-0.01em',
  color: theme.palette.text.primary,
  maxWidth: 260,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    maxWidth: 160,
  },
  [theme.breakpoints.down('xs')]: {
    display: 'none',
  },
}));

/** =========================
 *  Sidebar
 *  ========================= */

export const SidebarContainer = styled(Drawer)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export const SidebarInner = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
}));

export const SidebarBrand = styled(Box)(({ theme }) => ({
  height: theme.spacing(7),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  fontWeight: 900,
  letterSpacing: '-0.02em',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.primary.main, 0.04)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  color: theme.palette.text.primary,
}));

export const SidebarPush = styled(Box)(() => ({
  flexGrow: 1,
}));

export const SidebarIcon = styled(ListItemIcon)(() => ({
  minWidth: 40,
  color: 'inherit',
}));

export const SidebarNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  paddingTop: theme.spacing(1.1),
  paddingBottom: theme.spacing(1.1),
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 750,
    },
  }),
  '&:hover': {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.text.primary, 0.04),
  },
}));

export const SidebarDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/** =========================
 *  Page primitives
 *  ========================= */

export function AppTooltip(props: TooltipProps) {
  return <Tooltip arrow placement="top" enterTouchDelay={0} leaveTouchDelay={2500} {...props} />;
}

export const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: 'lg',
  paddingLeft: 0,
  paddingRight: 0,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export const PageCard = styled(Card)(() => ({
  width: '100%',
}));

export const SectionHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2.25, 2.5),
  '& .MuiCardHeader-title': {
    fontWeight: 900,
    letterSpacing: '-0.02em',
  },
  '& .MuiCardHeader-subheader': {
    marginTop: theme.spacing(0.5),
  },
}));

export const SectionContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const SectionDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.divider,
}));

export const CenteredBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const CenteredStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

export const ToastSnackbar = styled(Snackbar)(({ theme }) => ({
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1.25),
  },
  '& .MuiPaper-root': {
    borderRadius: 24,
    boxShadow: '0px 18px 50px rgba(15, 23, 42, 0.20)',
  },
}));

export const ToastAlert = styled(Alert)(() => ({
  alignItems: 'center',
  fontWeight: 800,
  letterSpacing: '0.01em',
}));

export const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  letterSpacing: '-0.02em',
  marginTop: theme.spacing(1),
}));

export const EmptyStateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: 520,
}));

export const FullPageCentered = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  display: 'grid',
  placeItems: 'center',
  padding: theme.spacing(3),
}));

export const InlineInfoAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: themeRadius(theme, 0.9, 16),
}));

export const InlineErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const TableWrap = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}));

export const Grid3 = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
}));

export const Grid4 = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

export const SpacedSection = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const ControlsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const ControlsGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  alignItems: 'center',
}));

export const ControlsLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  color: theme.palette.text.secondary,
  letterSpacing: '-0.01em',
}));

export const MetricHeaderRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}));

/** =========================
 *  Analytics
 *  ========================= */

export const MetricCard = styled(PageCard)(() => ({
  height: '100%',
}));

export const MetricValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
  fontWeight: 900,
  color: toneToColor(theme, tone),
  fontVariantNumeric: 'tabular-nums',
}));

export const AnalyticsRangeToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

export const AnalyticsChartBox = styled(Box)(() => ({
  width: '100%',
  height: 350,
}));

/** ==============================
 *  Analytics – layout primitives
 *  ============================== */

export const AnalyticsControlsCard = styled(PageCard)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const AnalyticsControlsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(3),
  alignItems: 'center',

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr auto',
    gap: theme.spacing(4),
  },
}));

export const AnalyticsControlBlock = styled(Box)(() => ({
  minWidth: 0,
}));

export const AnalyticsControlLabel = styled(ControlsLabel)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(1),
  display: 'block',
}));

export const AnalyticsLabelInline = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
}));

export const AnalyticsToggleGroup = styled(AnalyticsRangeToggleGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiToggleButton-root': {
    flex: 1,
    borderRadius: 8,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export const AnalyticsToggleButton = styled(ToggleButtonGroup)(() => ({}));

export const AnalyticsFreshnessWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),

  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 180,
  },
}));

export const AnalyticsFreshnessPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0.9),
  paddingBottom: theme.spacing(0.9),
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.01) 100%)',
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.06)',
  minWidth: 138,
  justifyContent: 'center',
}));

export const AnalyticsFreshnessDot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: 999,
  display: 'inline-block',
  backgroundColor: theme.palette.success.main,
  boxShadow: '0 0 0 4px rgba(34,197,94,0.12)',
}));

export const AnalyticsChartFrame = styled(AnalyticsChartBox)(() => ({
  borderRadius: 3,
  overflow: 'hidden',
}));

export const AnalyticsHeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
  width: '100%',

  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

export const AnalyticsHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1.25),
  width: '100%',

  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
  },
}));

export const AnalyticsTableHeadLabel = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
}));

export const AnalyticsTableHeadLabelRight = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  justifyContent: 'flex-end',
}));

/** =========================
 *  Positions
 *  ========================= */

export const KpiGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

export const KpiCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: themeRadius(theme, 1.1, 16),
}));

export const KpiCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.25),
  '&:last-child': { paddingBottom: theme.spacing(2.25) },
}));

export const KpiTopRow = styled(Stack)(({ theme }) => ({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
}));

export const KpiLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  color: theme.palette.text.secondary,
  letterSpacing: '-0.01em',
}));

export const KpiValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
  fontWeight: 950,
  letterSpacing: '-0.02em',
  color: toneToColor(theme, tone),
}));

export const KpiSub = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}));

export const KpiChip = styled(Chip)(({ theme }) => ({
  fontWeight: 900,
  borderRadius: 999,
  height: 26,
  backgroundColor: alpha(theme.palette.text.primary, 0.04),
}));

export const KpiInfoButton = styled(IconButton)(({ theme }) => ({
  width: 28,
  height: 28,
  padding: 0,
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  backgroundColor: alpha(theme.palette.text.primary, 0.03),
  transition: 'background-color 140ms ease, border-color 140ms ease, transform 140ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
    borderColor: alpha(theme.palette.text.primary, 0.16),
    transform: 'translateY(-1px)',
  },
}));

export const PositionsTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: themeRadius(theme, 0.9, 16),
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    overflowX: 'auto',
  },
}));

export const StickyTableHead = styled(TableHead)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
}));

export const EmptyStateWrap = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(1),
}));

export const SkeletonBlock = styled(Skeleton)(({ theme }) => ({
  borderRadius: themeRadius(theme, 0.8, 12),
}));

export const PositionsTabGroupWrap = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

export const PositionsActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

export const TickerCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const TickerLogo = styled(Box)(() => ({
  width: 24,
  height: 24,
  '& .MuiAvatar-root': {
    width: 24,
    height: 24,
  },
}));

export const ProfitCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
  color: toneToColor(theme, tone),
  fontVariantNumeric: 'tabular-nums',
}));

export const TotalsRow = styled(TableRow)(({ theme }) => ({
  borderTop: `2px solid ${theme.palette.divider}`,
}));

export const MobileListWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const MobilePositionCard = styled(Card)(({ theme }) => ({
  borderRadius: themeRadius(theme, 1.1, 16),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.10)',
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(
    theme.palette.background.paper,
    0.94,
  )} 100%)`,
  padding: theme.spacing(2),
}));

export const MobileCardTopRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));

export const MobileCardTitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const MobileCardMetaRow = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.75),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));

export const MobileFieldGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const MobileField = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.35),
  minWidth: 0,
}));

export const MobileFieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

export const MobileFieldValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone?: Tone }>(({ theme, tone }) => ({
  fontWeight: 900,
  letterSpacing: '-0.01em',
  fontVariantNumeric: 'tabular-nums',
  color: tone ? toneToColor(theme, tone) : theme.palette.text.primary,
}));

export const MobileCardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
}));

export const InlineIconWrap = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
}));

export const MobileTickerAvatar = styled(Avatar)(() => ({
  width: 28,
  height: 28,
}));

export const MobileTickerSymbol = styled(Typography)(() => ({
  fontWeight: 950,
  letterSpacing: '-0.02em',
}));

export const MobileTickerPrice = styled(Typography)(() => ({
  fontWeight: 950,
}));

export const SoftDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
}));

export const TotalsCard = styled(MobilePositionCard)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

/** =========================
 *  News
 *  ========================= */

export const NewsListItem = styled(ListItemButton)<ListItemButtonProps>(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(0.5),
}));

/** =========================
 * News – layout primitives
 * ========================== */

export const NewsHeaderWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  width: '100%',

  [theme.breakpoints.up('md')]: {
    alignItems: 'center',
  },
}));

export const NewsBrandRow = styled(Stack)(() => ({
  minWidth: 0,
}));

export const NewsBrandIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 20,
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.015) 100%)',
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.06)',
  flex: '0 0 auto',
}));

export const NewsBrandText = styled(Box)(() => ({
  minWidth: 0,
}));

export const NewsHeaderActions = styled(Stack)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: 'auto',
  },
}));

export const NewsTickerChipsWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.75),
  flexWrap: 'wrap',
  justifyContent: 'flex-start',

  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-end',
  },
}));

export const NewsTickerChip = styled(Chip)(() => ({
  fontWeight: 800,
  letterSpacing: '0.02em',
  borderRadius: 999,
  height: 28,
}));

export const NewsMoreChip = styled(Chip)(() => ({
  fontWeight: 800,
  borderRadius: 999,
  height: 28,
}));

export const NewsUpdatedRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),

  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-end',
  },
}));

export const NewsUpdatedPill = styled(Box)<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0.9),
  paddingBottom: theme.spacing(0.9),
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.01) 100%)',
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.06)',
  minWidth: 160,
  justifyContent: 'center',
  width: '100%',

  opacity: dimmed ? 0.9 : 1,

  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

export const NewsUpdatedDot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: 999,
  display: 'inline-block',
  backgroundColor: theme.palette.success.main,
  boxShadow: '0 0 0 4px rgba(34,197,94,0.12)',
}));

export const NewsRefreshDesktopButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  fontWeight: 800,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  display: 'none',

  [theme.breakpoints.up('sm')]: {
    display: 'inline-flex',
  },
}));

export const NewsSubheaderWrap = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const NewsContent = styled(SectionContent)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),

  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(2),
  },
}));

export const NewsArticlesList = styled(List)(() => ({
  borderRadius: 12,
  overflow: 'hidden',
}));

export const NewsArticleItem = styled(NewsListItem)<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  paddingTop: theme.spacing(2.25),
  paddingBottom: theme.spacing(2.25),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  borderRadius: 0,
  transition: 'background-color 140ms ease, transform 140ms ease',
  opacity: dimmed ? 0.85 : 1,

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },

  '&:active': {
    transform: 'scale(0.995)',
    [theme.breakpoints.up('md')]: {
      transform: 'none',
    },
  },

  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(2.25),
    paddingRight: theme.spacing(2.25),
  },
}));

export const NewsArticleTitleRow = styled(Stack)(() => ({
  width: '100%',
}));

export const NewsArticleTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  lineHeight: 1.25,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  paddingRight: theme.spacing(1),
  WebkitLineClamp: 3,

  [theme.breakpoints.up('md')]: {
    WebkitLineClamp: 2,
  },
}));

export const NewsArticleRightMeta = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: '0 0 auto',
}));

export const NewsAgeChip = styled(Chip)(() => ({
  height: 26,
  borderRadius: 999,
  fontWeight: 900,
}));

export const NewsOpenIconBoxMobile = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,

  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const NewsArticleMetaRow = styled(Stack)(({ theme }) => ({
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

export const NewsDotSeparator = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
}));

export const NewsMetaSpacer = styled(Box)(() => ({
  flex: 1,
}));

export const NewsOpenLinkDesktop = styled(Link)(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  fontWeight: 900,

  [theme.breakpoints.up('md')]: {
    display: 'inline-flex',
  },
}));

export const NewsMobileStickyAction = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 16,
  marginTop: theme.spacing(2),
  display: 'block',

  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

export const NewsMobileRefreshButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  paddingTop: theme.spacing(1.4),
  paddingBottom: theme.spacing(1.4),
  fontWeight: 900,
  boxShadow: '0px 18px 40px rgba(15, 23, 42, 0.18)',
}));

/** =========================
 *  Profile
 *  ========================= */

export const SpacedAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const FormActions = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-start',
}));

/** =========================
 * Profile – layout primitives
 * ========================== */

export const ProfileHeaderWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    alignItems: 'center',
  },
}));

export const ProfileHeaderLeft = styled(Stack)(() => ({
  minWidth: 0,
}));

export const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  fontWeight: 950,
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.015) 100%)',
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.06)',
  color: theme.palette.text.primary,
}));

export const ProfileHeaderText = styled(Box)(() => ({
  minWidth: 0,
}));

export const ProfileHeaderRight = styled(Stack)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: 'auto',
  },
}));

export const ProfileUpdatedPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0.9),
  paddingBottom: theme.spacing(0.9),
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.01) 100%)',
  boxShadow: '0px 10px 26px rgba(15, 23, 42, 0.06)',
  justifyContent: 'center',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

export const ProfileUpdatedDot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: 999,
  display: 'inline-block',
  backgroundColor: theme.palette.success.main,
  boxShadow: '0 0 0 4px rgba(34,197,94,0.12)',
}));

export const ProfileRefreshButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  fontWeight: 800,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'inline-flex',
  },
}));

export const ProfileContent = styled(SectionContent)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(2),
  },
}));

export const ProfileCard = styled(Paper)(() => ({
  borderRadius: 16,
  overflow: 'hidden',
}));

export const ProfileIdentityCard = styled(ProfileCard)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(180deg, rgba(15,23,42,0.025) 0%, rgba(15,23,42,0.01) 100%)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.25),
  },
}));

export const ProfileTwoColGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

export const ProfileSectionCard = styled(ProfileCard)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.25),
  },
}));

export const ProfileIconBox = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const ProfileIdentityIconBox = styled(ProfileIconBox)(() => ({
  width: 40,
  height: 40,
  flex: '0 0 auto',
}));

export const ProfileStatusChip = styled(Chip)(() => ({
  height: 26,
  borderRadius: 999,
  fontWeight: 900,
}));

export const ProfileMemberSinceChip = styled(Chip)(() => ({
  height: 30,
  borderRadius: 999,
  fontWeight: 900,
  justifyContent: 'center',
}));

export const ProfilePrimaryActionButton = styled(Button)(() => ({
  borderRadius: 20,
  fontWeight: 900,
}));

export const ProfileDangerCard = styled(ProfileCard)(({ theme }) => ({
  padding: theme.spacing(2),
  borderColor: theme.palette.error.light,
  background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.25),
  },
}));

export const ProfileDangerButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  fontWeight: 900,
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: 'auto',
  },
}));

export const ProfileDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}));

export const ProfileDialogButton = styled(Button)(() => ({
  borderRadius: 20,
  fontWeight: 900,
}));

/** =========================
 *  Quotes
 *  ========================= */

export const QuoteMetaWrap = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
}));

export const QuoteFreshDot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state: 'fresh' | 'stale' | 'missing' }>(({ theme, state }) => {
  const base = {
    width: 8,
    height: 8,
    borderRadius: 999,
    display: 'inline-block',
    boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 0.85)}`,
  } as const;

  if (state === 'fresh') return { ...base, backgroundColor: theme.palette.success.main };
  if (state === 'stale') return { ...base, backgroundColor: theme.palette.warning.main };
  return { ...base, backgroundColor: theme.palette.action.disabled };
});

export const QuoteTooltip = styled(Tooltip)(() => ({}));

/** =========================
 *  Public marketing & Auth
 *  ========================= */

export const HeroSection = styled('section')(({ theme }) => ({
  minHeight: '100vh',
  position: 'relative',
  backgroundImage: `url(${heroImgUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

export const HeroOverlay = styled(Box)(() => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    radial-gradient(1100px 520px at 22% 42%, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.10) 35%, rgba(2,6,23,0.00) 62%),
    linear-gradient(90deg, rgba(2,6,23,0.86) 0%, rgba(2,6,23,0.58) 46%, rgba(2,6,23,0.40) 100%)
  `,
  boxShadow: `inset 0 -120px 160px ${alpha('#020617', 0.35)}`,
}));

export const AuthContainer = styled(Container)(() => ({
  position: 'relative',
  zIndex: 1,
}));

export const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: themeRadius(theme, 2, 16),
  backgroundColor: alpha(theme.palette.background.paper, 0.98),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: theme.shadows[10],
  backdropFilter: 'blur(10px)',
}));

export const FormHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

export const FormButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(1.4),
  paddingBottom: theme.spacing(1.4),
  fontWeight: 800,
}));

export const FormFooter = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
}));

export const BrandWordmark = styled(Typography)(({ theme }) => ({
  fontWeight: 950,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  background: `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${alpha(theme.palette.common.white, 0.72)} 70%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

export const BrandTagline = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.86),
  fontWeight: 650,
}));

export const AuthBrandWordmark = styled(Typography)(({ theme }) => ({
  fontWeight: 950,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  color: theme.palette.text.primary,
}));

export const AuthBrandTagline = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 700,
  letterSpacing: '-0.01em',
}));

export const BrandPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.75, 1.5),
  borderRadius: 999,
  fontWeight: 900,
  letterSpacing: '-0.02em',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(theme.palette.primary.main, 0.06)})`,
  color: theme.palette.text.primary,
}));

export const MarketingTopNav = styled('div')(() => ({
  position: 'absolute',
  insetInline: 0,
  top: 0,
  zIndex: 2,
}));

export const MarketingTopNavInner = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(2.25),
  paddingBottom: theme.spacing(2.25),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
}));

export const MarketingNavPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.8),
  padding: theme.spacing(0.85, 1.15),
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
  backgroundColor: alpha(theme.palette.common.white, 0.06),
  backdropFilter: 'blur(14px)',
}));

export const MarketingNavLink = styled('button')(({ theme }) => ({
  appearance: 'none',
  border: 0,
  background: 'transparent',
  color: alpha(theme.palette.common.white, 0.86),
  fontWeight: 800,
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  padding: theme.spacing(0.6, 0.9),
  borderRadius: 999,
  transition: 'background-color 140ms ease, color 140ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    color: theme.palette.common.white,
  },
}));

export const MarketingNavActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const MarketingMenuButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
  backgroundColor: alpha(theme.palette.common.white, 0.06),
  backdropFilter: 'blur(14px)',
  color: theme.palette.common.white,
  padding: theme.spacing(0.9),
  transition: 'background-color 140ms ease, transform 140ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    transform: 'translateY(-1px)',
  },
}));

export const SubtleKicker = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: alpha(theme.palette.common.white, 0.86),
  fontWeight: 850,
  letterSpacing: '-0.01em',
}));

export const KickerDot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: 999,
  display: 'inline-block',
  backgroundColor: alpha(theme.palette.primary.main, 0.95),
  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`,
}));

export const SectionEyebrow = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const SectionSurface = styled('section')(({ theme }) => ({
  position: 'relative',
  paddingTop: theme.spacing(9),
  paddingBottom: theme.spacing(9),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(7),
  },
}));

export const SoftGridBackground = styled('div')(() => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: `
    radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, rgba(255,255,255,0) 0),
    radial-gradient(800px 520px at 12% 18%, rgba(37,99,235,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(800px 520px at 88% 82%, rgba(2,6,23,0.06), rgba(255,255,255,0) 62%)
  `,
  backgroundSize: '24px 24px, auto, auto',
  opacity: 1,
}));

export const HomeHero = styled('section')(({ theme }) => ({
  position: 'relative',
  minHeight: '92vh',
  overflow: 'hidden',
  backgroundImage: `url(${heroImgUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    minHeight: '82vh',
  },
}));

export const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'left',
  color: theme.palette.common.white,
  paddingTop: theme.spacing(11),
  paddingBottom: theme.spacing(9),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(7),
  },
}));

export const HeroActions = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(1.5),
  flexWrap: 'wrap',
}));

export const CTAButton = styled(Button)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  fontWeight: 800,
}));

export const PrimaryHeroButton = styled(CTAButton)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

export const CTAOutlineButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  borderColor: alpha(theme.palette.common.white, 0.75),
  fontWeight: 800,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: theme.palette.common.white,
  },
}));

export const SectionWrap = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

export const SectionBodyText = styled(Typography)(({ theme }) => ({
  maxWidth: 820,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: theme.spacing(2),
}));

export const FeaturesSection = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

export const FeatureCardLayout = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  borderRadius: themeRadius(theme, 2, 16),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: '0px 6px 18px rgba(15, 23, 42, 0.10)',
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(
    theme.palette.background.paper,
    0.94,
  )} 100%)`,
  transition: 'transform 170ms ease, box-shadow 170ms ease, border-color 170ms ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 14px 40px rgba(15, 23, 42, 0.14)',
    borderColor: alpha(theme.palette.primary.main, 0.22),
  },
}));

export const IconBadge = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 18,
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.main, 0.05)})`,
  boxShadow: `0 16px 26px ${alpha(theme.palette.primary.main, 0.08)}`,
  marginBottom: theme.spacing(2),
}));

export const FeatureIcon = styled('img')(() => ({
  width: 34,
  height: 34,
  display: 'block',
}));

export const TrustBar = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    flexWrap: 'nowrap',
  },
}));

export const TrustPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.8),
  padding: theme.spacing(0.9, 1.15),
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
  backgroundColor: alpha(theme.palette.common.white, 0.06),
  backdropFilter: 'blur(14px)',
  color: alpha(theme.palette.common.white, 0.86),
  whiteSpace: 'nowrap',
  '& *': {
    whiteSpace: 'nowrap',
  },
}));

export const TrustPillValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 950,
  letterSpacing: '-0.02em',
}));

export const TrustPillLabel = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.8),
  fontWeight: 750,
}));

export const SplitGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1.1fr 0.9fr',
    alignItems: 'center',
  },
}));

export const PreviewCard = styled(Card)(({ theme }) => ({
  borderRadius: themeRadius(theme, 1.4, 18),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  overflow: 'hidden',
  boxShadow: '0px 18px 52px rgba(15, 23, 42, 0.14)',
}));

export const PreviewCardTop = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(
    theme.palette.background.paper,
    0.88,
  )} 100%)`,
}));

export const WindowDots = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  '& > span': {
    width: 10,
    height: 10,
    borderRadius: 999,
    display: 'inline-block',
    backgroundColor: alpha(theme.palette.text.primary, 0.14),
  },
}));

export const PreviewCardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.25),
  backgroundColor: alpha(theme.palette.background.paper, 0.98),
}));

export const PreviewImage = styled('img')(({ theme }) => ({
  width: '100%',
  display: 'block',
  borderRadius: themeRadius(theme, 1.1, 16),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
}));

export const CalloutSection = styled('section')(({ theme }) => ({
  marginTop: theme.spacing(2),
  overflow: 'hidden',
  background:
    'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.65) 55%, rgba(2,6,23,0.45) 100%)',
}));

export const CalloutWrap = styled(Container)(({ theme }) => ({
  position: 'relative',
  color: theme.palette.common.white,
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  textAlign: 'center',
}));

export const CalloutTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 950,
  letterSpacing: '-0.02em',
}));

export const CalloutText = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.86),
  maxWidth: 760,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

export const CalloutActions = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

export const FooterSection = styled('footer')(({ theme }) => ({
  marginTop: theme.spacing(0),
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(6),
  color: theme.palette.text.secondary,
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.86)} 0%, ${theme.palette.background.paper} 100%)`,
}));

export const FooterGrid = styled(Container)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
  },
}));

export const FooterTitle = styled(Typography)(() => ({
  fontWeight: 950,
  letterSpacing: '-0.03em',
}));

export const FooterLink = styled('button')(({ theme }) => ({
  appearance: 'none',
  border: 0,
  background: 'transparent',
  textAlign: 'left',
  padding: 0,
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  fontWeight: 700,
  lineHeight: 1.7,
  transition: 'color 130ms ease',
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

export const FooterBottom = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(5),
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}));
