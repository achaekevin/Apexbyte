import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/ui/WhatsAppButton';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Floating Human Tech Support Button */}
      <WhatsAppButton />
    </div>
  );
};

export default MainLayout;
