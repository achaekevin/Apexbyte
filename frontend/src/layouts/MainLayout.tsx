import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-grow">
        <ErrorBoundary variant="section">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      {/* Floating Human Tech Support Button */}
      <WhatsAppButton />
    </div>
  );
};

export default MainLayout;
