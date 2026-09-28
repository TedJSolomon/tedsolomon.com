import './dashboard.css';
import DashboardSidebar from '../components/DashboardSidebar';
import StatusBar from './StatusBar';
import { logout } from '../login/actions';

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
      {/* Fixed, understated logout control — present on every dashboard route
          and every breakpoint, independent of the statusbar (hidden on mobile)
          and sidebar (hidden off-canvas on mobile). Works without JS. */}
      <form action={logout} className="db-logout-form">
        <button type="submit" className="db-logout-btn">
          Log out
        </button>
      </form>
    </>
  );
}
