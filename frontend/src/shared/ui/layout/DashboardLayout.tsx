import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Navbar from '@shared/ui/layout/Navbar';
import Sidebar from '@shared/ui/layout/Sidebar';
import {
  ContentScrollArea,
  DashboardContainer,
  MainContent,
  RouteLinearProgress,
} from '@shared/ui/layout/Styled';

import { ROUTE_TRANSITION_MS, dashboardTitleFromPath } from './styled.utils';

import { AnalyticsPage } from '@features/analytics';
import { NewsPage } from '@features/news';
import { PositionsPage } from '@features/portfolio';
import { ProfilePage } from '@features/auth';

const DashboardLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    setMobileOpen(false);

    const t = window.setTimeout(() => setRouteLoading(false), ROUTE_TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const title = useMemo(() => dashboardTitleFromPath(pathname), [pathname]);

  return (
    <DashboardContainer>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <MainContent>
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        {routeLoading ? <RouteLinearProgress /> : null}

        <ContentScrollArea>
          <Routes>
            <Route path="/" element={<Navigate to="positions" replace />} />
            <Route path="positions" element={<PositionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Routes>
        </ContentScrollArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout;
