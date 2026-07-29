import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterUIProvider } from './context/FilterUIContext';
import AppHeader from './components/AppHeader';
import DashboardFooter from './components/DashboardFooter';
import OverviewPage from './pages/OverviewPage';
import ForecastPage from './pages/ForecastPage';
import AtRiskGroupsPage from './pages/AtRiskGroupsPage';

export default function App() {
  return (
    <FilterUIProvider>
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/at-risk-groups" element={<AtRiskGroupsPage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
        <DashboardFooter />
      </BrowserRouter>
    </FilterUIProvider>
  );
}
