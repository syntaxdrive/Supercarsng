import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/layout/SiteLayout';
import { AuthProvider } from './context/AuthContext';
import { AboutPage, ContactPage } from './pages/AboutContactPages';
import { AdminPage } from './pages/AdminPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { DealerDetailPage } from './pages/DealerDetailPage';
import { DealerPortalPage } from './pages/DealerPortalPage';
import { DealersPage } from './pages/DealersPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SellPage } from './pages/SellPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<MarketplacePage />} />
            <Route path="/cars/:slug" element={<VehicleDetailPage />} />
            <Route path="/dealers" element={<DealersPage />} />
            <Route path="/dealers/:slug" element={<DealerDetailPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/discover/:make" element={<DiscoverPage />} />
            <Route path="/discover/:make/:model" element={<DiscoverPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<JournalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/dealer/dashboard" element={<DealerPortalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
