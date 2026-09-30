import React from 'react';
import './styles/theme.css';
import './styles/layout.css';

import { StationProvider, useStation } from './context/StationContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import FooterDisclaimer from './components/common/FooterDisclaimer';

// Pages
import Dashboard from './pages/Dashboard';
import EnvironmentalMonitoring from './pages/EnvironmentalMonitoring';
import EnergyMonitoring from './pages/EnergyMonitoring';
import InfrastructureMonitoring from './pages/InfrastructureMonitoring';
import LogisticsSupply from './pages/LogisticsSupply';
import CrossDomainImpact from './pages/CrossDomainImpact';
import AlertsOperations from './pages/AlertsOperations';
import WhatIfSimulator from './pages/WhatIfSimulator';
import HistoricalReplay from './pages/HistoricalReplay';
import StationComparison from './pages/StationComparison';
import AntarcticMapTwin from './pages/AntarcticMapTwin';
import DataQualityAndML from './pages/DataQualityAndML';

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
    case 'cross_domain':
      return <CrossDomainImpact />;
    case 'alerts':
      return <AlertsOperations />;
    case 'what_if':
      return <WhatIfSimulator />;
    case 'replay':
      return <HistoricalReplay />;
    case 'compare':
      return <StationComparison />;
    case 'map':
      return <AntarcticMapTwin />;
    case 'data_quality':
      return <DataQualityAndML />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
};

export const App = () => {
  return (
    <StationProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <PageContent />
          <FooterDisclaimer />
        </main>
      </div>
    </StationProvider>
  );
};

export default App;
