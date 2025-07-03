import { styled } from '@mui/material/styles';
import Box         from '@mui/material/Box';
import Button     from '@mui/material/Button';
import Card        from '@mui/material/Card';
import CardHeader  from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Container   from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper      from '@mui/material/Paper';

export const DashboardContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
}));

export const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
}));

export const HomeHero = styled('section')(({ theme }) => ({
  position: 'relative',
  height: '80vh',
  backgroundImage: 'url(/hero.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.down('md')]: {
    height: '60vh',
  },
}));

export const HeroContent = styled(Container)(({ theme }) => ({
  position:    'relative',
  zIndex:      1,
  height:      '100%',
  display:     'flex',
  flexDirection:'column',
  justifyContent:'center',
  textAlign:   'center',
  color:       theme.palette.common.white,
}));

export const CTAButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
  boxShadow:   theme.shadows[3],
}));

export const CTAOutlineButton = styled(Button)(({ theme }) => ({
  color:       theme.palette.common.white,
  borderColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor:     theme.palette.common.white,
  },
}));

export const FeaturesSection = styled(Container)(({ theme }) => ({
  paddingTop:    theme.spacing(6),
  paddingBottom: theme.spacing(12),
}));

export const FeatureCard = styled(Card)(({ theme }) => ({
  textAlign:    'center',
  padding:      theme.spacing(4),
  transition:   'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform:     'translateY(-8px)',
    boxShadow:     theme.shadows[6],
  },
}));

export const FeatureIcon = styled('img')(({ theme }) => ({
  width:        64,
  height:       64,
  marginBottom: theme.spacing(2),
}));

export const FooterSection = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  paddingTop:      theme.spacing(4),
  paddingBottom:   theme.spacing(4),
}));

export const HeroSection = styled('section')(({ theme }) => ({
  minHeight: '100vh',
  position:  'relative',
  backgroundImage: 'url(/hero.png)',
  backgroundSize:  'cover',
  backgroundPosition: 'center',
  display:   'flex',
  alignItems:    'center',
  justifyContent:'center',
}));

export const HeroOverlay = styled(Box)(() => ({
  position: 'absolute',
  top: 0, left: 0,
  width:  '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
}));

export const AuthContainer = styled(Container)(() => ({
  position: 'relative',
  zIndex:   1,
}));

export const AuthPaper = styled(Paper)(({ theme }) => ({
  padding:       theme.spacing(4),
  borderRadius:  theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
}));

export const FormHeader = styled(Box)(({ theme }) => ({
  textAlign:    'center',
  marginBottom: theme.spacing(3),
}));

export const FormButton = styled(Button)(({ theme }) => ({
  marginTop:     theme.spacing(2),
  paddingTop:    theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
}));

export const FormFooter = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
}));

export const SidebarContainer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export const SidebarBrand = styled(Box)(({ theme }) => ({
  height: theme.spacing(8),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.h6.fontSize,
  color: theme.palette.text.primary,
}));

export const SidebarPush = styled(Box)({
  flexGrow: 1,
});

export const SidebarIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(5),
}));

export const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop:    theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft:   theme.spacing(2),
  paddingRight:  theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft:  theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft:  theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export const PageCard = styled(Card)(() => ({
  width: '100%',
}));

export const SectionHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2, 3),
}));

export const SectionContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const CenteredBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

export const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: 'lg',
  marginTop: theme.spacing(2),
  paddingLeft:   0,
  paddingRight:  0,
  [theme.breakpoints.up('sm')]: {
    paddingLeft:  theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));