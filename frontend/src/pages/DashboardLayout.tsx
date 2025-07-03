import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PositionsPage from './PositionsPage';
import AnalyticsPage from './AnalyticsPage';
import NewsPage from './NewsPage';
import ProfilePage from './ProfilePage';
import { DashboardContainer, MainContent } from '../components/layout/Styled';

const DashboardLayout: React.FC = () => (
  <DashboardContainer>
    <Sidebar />
    <MainContent>
      <Routes>
        <Route path="/" element={<Navigate to="positions" replace />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="analytics"  element={<AnalyticsPage  />} />
        <Route path="news"       element={<NewsPage       />} />
        <Route path="profile"    element={<ProfilePage    />} />
      </Routes>
    </MainContent>
  </DashboardContainer>
);

export default DashboardLayout;