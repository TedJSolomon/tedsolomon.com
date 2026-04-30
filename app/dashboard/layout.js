import './dashboard.css';
import DashboardSidebar from '../components/DashboardSidebar';
import StatusBar from './StatusBar';

export const metadata = {
  title: 'Dashboard — Ted Solomon',
};

export default function DashboardLayout({ children }) {
  return (
    <>
      {/* StatusBar sits OUTSIDE the flex layout so it spans the full viewport width */}
      <StatusBar />
      {/* Ambient heartbeat line — pure CSS @keyframes, no JS */}
      <div className="ambient-pulse" aria-hidden="true" />
      <div className="db-layout">
        <DashboardSidebar />
        <main className="db-main">
          {children}
        </main>
      </div>
    </>
  );
}
