import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardLayout from '../../shared/ui/layout/DashboardLayout';

import { HomePage } from '@features/home';
import { AnalyticsPage } from '@features/analytics';
import { LoginPage, ProfilePage, RegisterPage, ProtectedRoute } from '@features/auth';
import { NewsPage } from '@features/news';
import { PositionsPage } from '@features/portfolio';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/positions" replace />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
