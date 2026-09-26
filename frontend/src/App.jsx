import React from 'react';
import './styles/theme.css';
import './styles/layout.css';

import { StationProvider, useStation } from './context/StationContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import FooterDisclaimer from './components/common/FooterDisclaimer';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EnvironmentalMonitoring from './pages/EnvironmentalMonitoring';
import EnergyMonitoring from './pages/EnergyMonitoring';
import InfrastructureMonitoring from './pages/InfrastructureMonitoring';
import LogisticsSupply from './pages/LogisticsSupply';
import AlertsOperations from './pages/AlertsOperations';

const PageContent = () => {
  const { currentPage } = useStation();

  switch (currentPage) {
    case 'environmental':
      return <EnvironmentalMonitoring />;
    case 'energy':
      return <EnergyMonitoring />;
    case 'infrastructure':
      return <InfrastructureMonitoring />;
    case 'logistics':
      return <LogisticsSupply />;
    case 'alerts':
      return <AlertsOperations />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
};

const MainLayout = () => {
  const { currentPage } = useStation();

  if (currentPage === 'home') {
    return <Home />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <PageContent />
        <FooterDisclaimer />
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <StationProvider>
      <MainLayout />
    </StationProvider>
  );
};

export default App;
