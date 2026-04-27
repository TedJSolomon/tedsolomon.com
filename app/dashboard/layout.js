import './dashboard.css';
import DashboardSidebar from '../components/DashboardSidebar';
import StatusBar from './StatusBar';

export const metadata = {
  title: 'Dashboard — Ted Solomon',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="db-layout">
      <DashboardSidebar />
      <main className="db-main">
        <StatusBar />
        {children}
      </main>
    </div>
  );
}
