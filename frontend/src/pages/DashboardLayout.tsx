import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import PositionsPage from './PositionsPage';
import AnalyticsPage from './AnalyticsPage';
import NewsPage from './NewsPage';

const DashboardLayout: React.FC = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="positions" replace />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="news" element={<NewsPage />} />
      </Routes>
    </Box>
  </Box>
);

export default DashboardLayout;