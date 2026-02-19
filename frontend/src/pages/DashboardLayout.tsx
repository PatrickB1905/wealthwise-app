import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import { DashboardContainer, MainContent } from '../components/layout/Styled'

import AnalyticsPage from './AnalyticsPage'
import NewsPage from './NewsPage'
import PositionsPage from './PositionsPage'
import ProfilePage from './ProfilePage'

const DashboardLayout: React.FC = () => {
  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        <Routes>
          <Route path="/" element={<Navigate to="positions" replace />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Routes>
      </MainContent>
    </DashboardContainer>
  )
}

export default DashboardLayout
