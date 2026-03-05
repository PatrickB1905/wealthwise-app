import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import SchemaOutlinedIcon from '@mui/icons-material/SchemaOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';

import type {
  FeatureCard,
  StepItem,
  FaqItem,
  ValuePropItem,
  HighlightItem,
  TrustItem,
} from './types/home';

export const FEATURE_CARDS: readonly FeatureCard[] = [
  {
    title: 'Position-Based Portfolio Tracking',
    description:
      'Add and manage positions across equities and crypto, with automatic valuation and exposure updates powered by live market data.',
    accentIcon: { Icon: AccountBalanceWalletOutlinedIcon, props: { fontSize: 'small' } },
  },
  {
    title: 'Benchmark & Correlation Analysis',
    description:
      'Measure beta and correlation against SPY, QQQ, and IWM to understand how your portfolio moves relative to the broader market.',
    accentIcon: { Icon: CompareArrowsOutlinedIcon, props: { fontSize: 'small' } },
  },
  {
    title: 'Time-Window Performance Insights',
    description:
      'Analyze results across 30, 90, 180, and 365-day windows with rolling profit tracking and historical portfolio value visualization.',
    accentIcon: { Icon: TimelineOutlinedIcon, props: { fontSize: 'small' } },
  },
] as const;

export const STEPS: readonly StepItem[] = [
  {
    title: 'Create Your Account',
    desc: 'Securely create your account and access your personalized portfolio dashboard.',
  },
  {
    title: 'Add Your Positions',
    desc: 'Input your equity and crypto positions to generate real-time portfolio valuation and exposure tracking.',
  },
  {
    title: 'Unlock Portfolio Intelligence',
    desc: 'Instantly view performance, risk metrics, benchmark correlation, and curated market news — continuously updated.',
  },
] as const;

export const FAQS: readonly FaqItem[] = [
  {
    q: 'How does WealthWise calculate portfolio performance?',
    a: 'WealthWise calculates portfolio value and performance using your recorded positions combined with live market pricing. Performance metrics such as total return, volatility, drawdown, Sharpe ratio, and correlation are derived from structured historical price data and time-window analysis.',
  },
  {
    q: 'Where does the market data come from?',
    a: 'Market pricing data is sourced through reliable financial data integrations and processed to maintain consistent portfolio valuation and analytics across supported time ranges.',
  },
  {
    q: 'Is my portfolio data secure?',
    a: 'Account access is authenticated, and portfolio data is scoped to individual users. Application routes and data access are structured to ensure users can only view and manage their own portfolio information.',
  },
  {
    q: 'Does WealthWise execute trades or connect to brokerage accounts?',
    a: 'No. WealthWise is an analytics and portfolio intelligence platform. It does not execute trades or directly connect to brokerage accounts. Users manually input positions to generate performance and risk insights.',
  },
] as const;

export const VALUE_PROPS: readonly ValuePropItem[] = [
  {
    title: 'Real-Time Portfolio View',
    desc: 'Live market data updates your portfolio value, unrealized performance, and exposure instantly — giving you an accurate view of where you stand at any moment.',
    icon: { Icon: AutoGraphOutlinedIcon },
  },
  {
    title: 'Advanced Risk & Performance Metrics',
    desc: 'From volatility and max drawdown to Sharpe ratio and benchmark correlation, understand how your portfolio behaves — not just how it performs.',
    icon: { Icon: AnalyticsOutlinedIcon },
  },
  {
    title: 'Contextual Market Intelligence',
    desc: 'News is curated by the symbols you hold, ensuring every headline is relevant to your portfolio and aligned with your current exposure.',
    icon: { Icon: NewspaperOutlinedIcon },
  },
] as const;

export const HIGHLIGHTS: readonly HighlightItem[] = [
  {
    icon: { Icon: DonutLargeOutlinedIcon },
    title: 'Exposure Breakdown',
    desc: 'Instant visibility into sector, asset, and position concentration — so you know exactly where your capital is allocated.',
  },
  {
    icon: { Icon: TrendingUpOutlinedIcon },
    title: 'Movement & Momentum Tracking',
    desc: 'Monitor daily changes in portfolio value and rolling profit to understand how your strategy is evolving over time.',
  },
  {
    icon: { Icon: RadarOutlinedIcon },
    title: 'Concentration & Risk Signals',
    desc: 'Identify overexposure, correlation clustering, and volatility shifts before they impact performance.',
  },
] as const;

export const TRUST_ITEMS: readonly TrustItem[] = [
  {
    icon: { Icon: SchemaOutlinedIcon },
    title: 'Structured Data Modeling',
    desc: 'Positions, transactions, and portfolio calculations are handled through normalized data structures that ensure consistent valuation and exposure tracking.',
  },
  {
    icon: { Icon: SyncOutlinedIcon },
    title: 'Reliable Market Data Integration',
    desc: 'Live pricing is sourced and processed to maintain accurate portfolio valuation and performance metrics across time windows.',
  },
  {
    icon: { Icon: FunctionsOutlinedIcon },
    title: 'Consistent Metric Computation',
    desc: 'Risk, return, volatility, drawdown, and correlation calculations follow structured analytical logic for dependable portfolio insight.',
  },
] as const;
