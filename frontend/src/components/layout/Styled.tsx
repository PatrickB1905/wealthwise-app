import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Paper from '@mui/material/Paper'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled, type Theme } from '@mui/material/styles'

type Tone = 'positive' | 'negative' | 'neutral'

function toneToColor(theme: Theme, tone: Tone) {
  if (tone === 'positive') return theme.palette.success.main
  if (tone === 'negative') return theme.palette.error.main
  return theme.palette.text.primary
}

export const DashboardContainer = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
}))

export const MainContent = styled('main')(() => ({
  flexGrow: 1,
}))

export const HomeHero = styled('section')(({ theme }) => ({
  position: 'relative',
  height: '80vh',
  backgroundImage: 'url(/hero.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.down('md')]: {
    height: '60vh',
  },
}))

export const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  color: theme.palette.common.white,
}))

export const HeroActions = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}))

export const CTAButton = styled(Button)(({ theme }) => ({
  boxShadow: theme.shadows[3],
}))

export const PrimaryHeroButton = styled(CTAButton)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}))

export const CTAOutlineButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  borderColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: theme.palette.common.white,
  },
}))

export const FeaturesSection = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(12),
  backgroundColor: theme.palette.grey[50],
}))

export const FeatureCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[6],
  },
}))

export const FeatureCardLayout = styled(FeatureCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  height: '100%',
}))

export const FeatureIcon = styled('img')(({ theme }) => ({
  width: 64,
  height: 64,
  marginBottom: theme.spacing(2),
}))

export const FooterSection = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

export const HeroSection = styled('section')(() => ({
  minHeight: '100vh',
  position: 'relative',
  backgroundImage: 'url(/hero.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const HeroOverlay = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
}))

export const AuthContainer = styled(Container)(() => ({
  position: 'relative',
  zIndex: 1,
}))

export const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
}))

export const FormHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}))

export const FormButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
}))

export const FormFooter = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
}))

export const FormActions = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-start',
}))

export const SidebarContainer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}))

export const SidebarBrand = styled(Box)(({ theme }) => ({
  height: theme.spacing(8),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.h6.fontSize,
  color: theme.palette.text.primary,
}))

export const SidebarPush = styled(Box)(() => ({
  flexGrow: 1,
}))

export const SidebarIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(5),
}))

export const SidebarNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  margin: theme.spacing(0, 2),
  borderRadius: theme.shape.borderRadius,
  ...(selected && {
    backgroundColor: theme.palette.action.selected,
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    },
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

export const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}))

export const PageCard = styled(Card)(() => ({
  width: '100%',
}))

export const SectionHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2, 3),
}))

export const SectionContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}))

export const CenteredBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}))

export const CenteredBoxSpaced = styled(CenteredBox)(({ theme }) => ({
  marginTop: theme.spacing(3),
}))

export const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: 'lg',
  marginTop: theme.spacing(2),
  paddingLeft: 0,
  paddingRight: 0,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

export const NavbarToolbar = styled(Toolbar)(() => ({
  gap: 8,
}))

export const NavbarTitle = styled('div')(() => ({
  flexGrow: 1,
}))

/** Used by PrivateRoute for bootstrapping/loading states */
export const FullPageCentered = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  display: 'grid',
  placeItems: 'center',
  padding: theme.spacing(3),
}))

/** Home sections */
export const SectionWrap = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}))

export const SectionBodyText = styled(Typography)(({ theme }) => ({
  maxWidth: 700,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: theme.spacing(2),
}))

export const CalloutSection = styled(Box)(() => ({
  textAlign: 'center',
  background: 'linear-gradient(to right, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 100%)',
}))

export const CalloutWrap = styled(Container)(({ theme }) => ({
  position: 'relative',
  color: theme.palette.common.white,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}))

export const CalloutTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
}))

export const CalloutText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4),
}))

export const CalloutActions = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}))

/** Positions */
export const PositionsTabGroupWrap = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}))

export const PositionsActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}))

export const TickerCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

export const TickerLogo = styled(Box)(() => ({
  width: 24,
  height: 24,
  '& .MuiAvatar-root': {
    width: 24,
    height: 24,
  },
}))

export const ProfitCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
  color: toneToColor(theme, tone),
}))

export const TotalsRow = styled(TableRow)(({ theme }) => ({
  borderTop: `2px solid ${theme.palette.divider}`,
}))

/** Analytics */
export const MetricCard = styled(PageCard)(() => ({
  height: '100%',
}))

export const MetricValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
  fontWeight: 700,
  color: toneToColor(theme, tone),
}))

export const AnalyticsRangeToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightMedium,
  },
}))

export const AnalyticsChartBox = styled(Box)(() => ({
  width: '100%',
  height: 350,
}))

/** News */
export const NewsListItem = styled(ListItemButton)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(0.5),
}))

/** Profile */
export const SpacedAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
}))
