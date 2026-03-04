export const SIDEBAR_WIDTH = 272;
export const ROUTE_TRANSITION_MS = 260;

export function dashboardTitleFromPath(pathname: string): string {
  if (pathname.includes('/app/positions')) return 'Portfolio';
  if (pathname.includes('/app/analytics')) return 'Analytics';
  if (pathname.includes('/app/news')) return 'News';
  if (pathname.includes('/app/profile')) return 'My Profile';
  return 'Dashboard';
}
