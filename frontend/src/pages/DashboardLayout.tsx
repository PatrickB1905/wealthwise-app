import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import PositionsPage from './PositionsPage';

const DashboardLayout: React.FC = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="positions" replace />} />
        <Route path="positions" element={<PositionsPage />} />
      </Routes>
    </Box>
  </Box>
);

export default DashboardLayout;